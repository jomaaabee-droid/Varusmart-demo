#!/usr/bin/env python3
"""Download the public Shopify catalog from varusmart.se and write src/data/catalog.json.

Prices, images, variants and descriptions come from products.json.
Category membership comes from each collection's products.json.
The only copy added by hand is the CFW door note requested for this demo:
interior doors include the original handle and lock; other handles are add-ons.
"""

from __future__ import annotations

import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "catalog.json"
BASE = "https://varusmart.se"
UA = "VaruSmartDemo/1.0 (catalog mirror for design prototype)"

# Display order. `home` categories appear in the bento. Membership is the
# live collection, except SPC panels are kept out of Golv (the shop lists
# that wall product in both collections).
CATEGORIES = [
    {
        "id": "innerdorrar",
        "title": "Innerdörrar",
        "blurb": "Massiva innerdörrar med dold karm eller Flex+Karm.",
        "home": True,
        "coverHandle": "massiv-innerdorr-med-dold-karm-vit",
    },
    {
        "id": "akustik-paneler",
        "title": "Akustikpaneler",
        "blurb": "Ribbade paneler i trä och rundad sammet, 240 × 60 cm.",
        "home": True,
        "coverHandle": "akustikpanel-i-sammet-gron-240-60-cm",
    },
    {
        "id": "spc-vaggpaneler",
        "title": "SPC väggpaneler",
        "blurb": "Väggpaneler för badrum, kök och övriga rum.",
        "home": True,
        "coverHandle": "spc-vaggpaneler-badrum-kok-hus",
    },
    {
        "id": "golv",
        "title": "Golv",
        "blurb": "Vinylgolv i ek, rakt och i fiskben.",
        "home": True,
        "coverHandle": "vinylgolv-ljus-ek-1-7568-m-per-kartong",
        "excludeHandles": ["spc-vaggpaneler-badrum-kok-hus"],
    },
    {
        "id": "textilmattor",
        "title": "Textilmattor",
        "blurb": "Melerade textilplattor, 150 kr/m² inkl. moms.",
        "home": False,
        "coverHandle": "textilplattor-gra-50-50-cm-9-m-kartong",
    },
    {
        "id": "skivmaterial",
        "title": "Skivmaterial",
        "blurb": "OSB-skivor och gipsskivor för vägg, golv och tak.",
        "home": True,
        "coverHandle": "nya-osb-skivor-1200x2600x12mm",
    },
    {
        "id": "kakel",
        "title": "Kakel",
        "blurb": "Plattor 60 × 60 cm, säljs per kartong.",
        "home": True,
        "coverHandle": "kakel-sand-melerad-60x60cm",
    },
    {
        "id": "fasadpaneler",
        "title": "Fasadpaneler",
        "blurb": "Fasadpanel i fibercement för hus, garage och förråd.",
        "home": False,
        "coverHandle": "fasadpanel-i-fibercement-vit-ral-9010-3000-200-8-mm",
    },
    {
        "id": "glasracken",
        "title": "Glasräcken",
        "blurb": "Stolpfria glasräcken, topp- eller sidomonterade.",
        "home": True,
        "coverHandle": "topp-monterat-glasracke",
    },
    {
        "id": "undertak",
        "title": "Undertak",
        "blurb": "Undertak kant A och kant E, vitt och svart.",
        "home": False,
        "coverHandle": "undertak-vit-kant-a",
    },
    {
        "id": "portar-motorer",
        "title": "Portar",
        "blurb": "Industriella takskjutportar.",
        "home": False,
        "coverHandle": "takskjutport",
    },
    {
        "id": "elprodukter",
        "title": "Elprodukter",
        "blurb": "Uttag, strömbrytare, säkringar, ramar och elskåp.",
        "home": True,
        "coverHandle": "vagguttag-med-usb-a-och-usb-c-z-23f",
    },
    {
        "id": "varmepumpar",
        "title": "Värmepumpar",
        "blurb": "Luftvärmepumpar.",
        "home": False,
        "coverHandle": "varmepump",
    },
    {
        "id": "infastningsmaterial-solceller",
        "title": "Solceller & infästning",
        "blurb": "Infästning, klämmor och fågelskydd till solpaneler.",
        "home": False,
        "coverHandle": "fagelskydd",
    },
    {
        "id": "smart-toaletter",
        "title": "Smarta toaletter",
        "blurb": "Vägg- och golvmonterade smarttoaletter.",
        "home": False,
        "coverHandle": "vagghangd-smart-toalett",
    },
    {
        "id": "biljardbord",
        "title": "Biljardbord",
        "blurb": "Biljardbord och tillbehör.",
        "home": False,
        "coverHandle": "biljardbord-8ft-n014-premium-i-massivt-tra-med-klassisk-design",
    },
    {
        "id": "elsparkcykel-elbil",
        "title": "Elsparkcykel",
        "blurb": "Elsparkcyklar.",
        "home": False,
        "coverHandle": "elsparkcykel-kuickwheel",
    },
    {
        "id": "diskoho",
        "title": "Diskmaskiner",
        "blurb": "Integrerade diskmaskiner.",
        "home": False,
        "coverHandle": "diskmaskin-nordvik-integrerad-60l",
    },
]

# The dishwasher is in the public product feed but not in the collection JSON.
MANUAL_CATEGORY = {
    "diskmaskin-nordvik-integrerad-60l": "diskoho",
}

DOOR_NOTICE = (
    "CFW-innerdörrarna levereras med originalhandtag och lås. "
    "Andra handtag kan erbjudas som tillval."
)

ALLOWED = {
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
}


class Sanitizer(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag: str, attrs) -> None:  # type: ignore[no-untyped-def]
        if tag in ("script", "style"):
            self.skip += 1
            return
        if self.skip or tag not in ALLOWED:
            return
        self.out.append(f"<{tag}>")

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style") and self.skip:
            self.skip -= 1
            return
        if self.skip or tag not in ALLOWED or tag == "br":
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        if not self.skip:
            self.out.append(html.escape(data))


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip = False

    def handle_starttag(self, tag: str, attrs) -> None:  # type: ignore[no-untyped-def]
        if tag in ("script", "style"):
            self.skip = True
        if tag in ("p", "br", "li", "h2", "h3", "h4", "tr", "div"):
            self.parts.append("\n")
    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style"):
            self.skip = False

    def handle_data(self, data: str) -> None:
        if not self.skip:
            self.parts.append(data)


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as res:
        return json.loads(res.read().decode("utf-8"))


def plain_text(raw: str) -> str:
    parser = TextExtractor()
    parser.feed(raw or "")
    text = html.unescape("".join(parser.parts))
    text = text.replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s+", "\n", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def sanitize(raw: str) -> str:
    parser = Sanitizer()
    parser.feed(raw or "")
    html_out = "".join(parser.out)
    html_out = re.sub(r"(?:<br>)+", "<br>", html_out)
    html_out = re.sub(r"(<p>\s*</p>)", "", html_out)
    return html_out.strip()


def apply_door_copy(raw: str) -> str:
    raw = re.sub(
        r"Dörrhandtag ingår inte och köps separat\.",
        "Originalhandtag och lås ingår. Andra handtag kan erbjudas som tillval.",
        raw,
    )
    raw = re.sub(
        r"Dörrhandtag ingår inte\.",
        "Originalhandtag och lås ingår. Andra handtag kan erbjudas som tillval.",
        raw,
    )
    return raw


def excerpt(text: str, limit: int = 180) -> str:
    line = " ".join(part.strip() for part in text.splitlines() if part.strip())
    line = re.sub(r"\s+", " ", line).strip()
    if len(line) <= limit:
        return line
    cut = line[: limit - 1].rsplit(" ", 1)[0]
    return cut.rstrip(".,;:") + "…"


def price_note(text: str) -> str | None:
    head = text[:900]
    per_m2 = re.search(r"(\d[\d\s.,]*\s*kr\s*/\s*m²)", head, re.I)
    if per_m2:
        value = re.sub(r"\s+", " ", per_m2.group(1)).strip()
        context = head[max(0, per_m2.start() - 40) : per_m2.end()].lower()
        if "jämförpris" in context:
            return f"Jämförpris {value}"
        return value
    if re.search(r"per löpmeter", head, re.I):
        return "Pris per löpmeter"
    if re.search(r"per skiva", head, re.I):
        return "Pris per skiva"
    if re.search(r"per panel", head, re.I):
        return "Pris per panel"
    if re.search(r"per kartong", head, re.I):
        return "Pris per kartong"
    return None


def shipping_note(text: str) -> str | None:
    match = re.search(r"Fast frakt[:\s][^\n]{0,140}", text, re.I)
    if not match:
        return None
    return re.sub(r"\s+", " ", match.group(0)).strip(" .")


def restock_note(text: str) -> str | None:
    match = re.search(r"ÅTER I LAGER\s+(\d{4}-\d{2}-\d{2})", text, re.I)
    if not match:
        return None
    return match.group(1)


def num(value) -> float | None:
    if value is None or value == "":
        return None
    return float(value)


def main() -> None:
    products = fetch_json(f"{BASE}/products.json?limit=250")["products"]
    if len(products) >= 250:
        raise SystemExit("Catalog exceeded one page; add pagination before shipping.")

    membership: dict[str, set[str]] = {c["id"]: set() for c in CATEGORIES}
    for category in CATEGORIES:
        payload = fetch_json(f"{BASE}/collections/{category['id']}/products.json?limit=250")
        excluded = set(category.get("excludeHandles") or [])
        for product in payload.get("products", []):
            if product["handle"] not in excluded:
                membership[category["id"]].add(product["handle"])

    catalog_products = []
    uncategorized = []
    for product in products:
        handle = product["handle"]
        category_ids = [c["id"] for c in CATEGORIES if handle in membership[c["id"]]]
        manual = MANUAL_CATEGORY.get(handle)
        if manual and manual not in category_ids:
            category_ids.insert(0, manual)
        if not category_ids:
            uncategorized.append(product["title"])
            category_ids = ["ovrigt"]
        raw_html = product.get("body_html") or ""
        is_door = "innerdorrar" in category_ids or product.get("product_type") == "Innerdörrar"
        if is_door:
            raw_html = apply_door_copy(raw_html)
        text = plain_text(raw_html)
        images = [
            {
                "src": image["src"],
                "alt": image.get("alt") or product["title"],
                "width": image.get("width") or 0,
                "height": image.get("height") or 0,
            }
            for image in product.get("images") or []
        ]
        variants = []
        for variant in product.get("variants") or []:
            featured = variant.get("featured_image") or {}
            options = [
                variant.get("option1"),
                variant.get("option2"),
                variant.get("option3"),
            ]
            variants.append(
                {
                    "id": variant["id"],
                    "title": variant.get("title") or "Standard",
                    "price": num(variant.get("price")) or 0,
                    "compareAt": num(variant.get("compare_at_price")),
                    "available": bool(variant.get("available")),
                    "sku": variant.get("sku") or None,
                    "image": featured.get("src"),
                    "options": [opt for opt in options if opt and opt != "Default Title"],
                }
            )
        option_defs = []
        for option in product.get("options") or []:
            values = [v for v in option.get("values") or [] if v and v != "Default Title"]
            if values and option.get("name") != "Title":
                option_defs.append({"name": option.get("name") or "Val", "values": values})
        catalog_products.append(
            {
                "id": product["id"],
                "title": product["title"],
                "handle": handle,
                "vendor": product.get("vendor") or "VaruSmart",
                "productType": product.get("product_type") or "",
                "tags": product.get("tags") or [],
                "excerpt": excerpt(text),
                "descriptionHtml": sanitize(raw_html),
                "images": images,
                "options": option_defs,
                "variants": variants,
                "categoryIds": category_ids,
                "primaryCategoryId": category_ids[0],
                "url": f"{BASE}/products/{handle}",
                "priceNote": price_note(text),
                "shippingNote": shipping_note(text),
                "notice": DOOR_NOTICE if is_door else None,
                "restock": restock_note(text),
            }
        )

    categories = []
    for category in CATEGORIES:
        categories.append(
            {
                "id": category["id"],
                "title": category["title"],
                "blurb": category["blurb"],
                "home": category["home"],
                "coverHandle": category["coverHandle"],
                "collectionUrl": f"{BASE}/collections/{category['id']}",
            }
        )
    if uncategorized:
        categories.append(
            {
                "id": "ovrigt",
                "title": "Övrigt",
                "blurb": "Produkter som inte ligger i en egen kategori i demon.",
                "home": False,
                "coverHandle": None,
                "collectionUrl": f"{BASE}/collections/all",
            }
        )

    catalog = {
        "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source": f"{BASE}/products.json",
        "shop": {
            "name": "VaruSmart",
            "legalName": "CFW Trading AB",
            "tagline": "Marknadens smartaste priser på hem, bygg & elektronik",
            "pitch": "Vi tar hem kvalitetsprodukter utan mellanhänder – du betalar bara för värdet, inte påslagen.",
            "email": "info@varusmart.se",
            "phone": "070 755 14 03",
            "phoneHref": "tel:+46707551403",
            "hours": "Mån–fre 09:00–17:00",
            "companyAddress": "Resedastigen 26, 554 56 Jönköping",
            "warehouse": "Lager i Värnamo",
            "shipsFrom": "Skickas från Sverige",
            "site": BASE,
        },
        "categories": categories,
        "products": catalog_products,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(catalog_products)} products, {len(categories)} categories -> {OUT}")
    if uncategorized:
        print("Uncategorized:")
        for title in uncategorized:
            print(" -", title)


if __name__ == "__main__":
    main()
