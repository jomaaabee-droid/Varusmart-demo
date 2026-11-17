# VaruSmart Demo

Mobilanpassad demo av butiken på [varusmart.se](https://varusmart.se) för CFW Trading AB. Den riktiga shoppen är där man handlar. Den här demon är ett mörkt skyltfönster över den publika katalogen: innerdörrar, akustikpaneler, SPC-väggpaneler, golv, OSB, gips och resten av sortimentet.

**Live:** [https://jomaaabee-droid.github.io/Varusmart-demo/](https://jomaaabee-droid.github.io/Varusmart-demo/)

Priser, bilder och produkttexter kommer från varusmart.se. Kort och produktsidor länkar tillbaka dit. Navigeringen är hash-baserad (`#/produkter`, `#/produkt/...`) och Vite bygger med basen `/Varusmart-demo/`.

## Köra lokalt

```bash
npm ci
npm run dev
```

Dev-servern lyssnar på [http://127.0.0.1:43123/Varusmart-demo/](http://127.0.0.1:43123/Varusmart-demo/). `npm run build` skriver `dist`.

## Publicering

`.github/workflows/pages.yml` bygger och publicerar `dist` med GitHub Actions vid push till `main`. Källa för Pages ska vara **GitHub Actions** (Settings → Pages → Source).
