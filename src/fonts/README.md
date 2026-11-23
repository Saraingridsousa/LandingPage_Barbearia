# Local font assets

Downloaded from the public Google Fonts CSS endpoint (not replacement fonts).

Source CSS: https://fonts.googleapis.com/css2?family=MedievalSharp&family=Montserrat:wght@400..800&display=swap

The exact returned stylesheet is retained in google-fonts-source.css for provenance, not for importing: its remote URLs include subsets deliberately not downloaded. Only the normal latin WOFF2 blocks are retained locally.

## Montserrat

- File: montserrat-latin-400-800-normal.woff2
- Style: normal; subset: latin; weight: 400 800 (variable; includes 400, 600, 700, and 800)
- Download source: https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2
- License: SIL Open Font License 1.1, preserved verbatim in Montserrat-OFL.txt
- License source: https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/OFL.txt

## MedievalSharp

- File: medievalsharp-latin-400-normal.woff2
- Style: normal; subset: latin; weight: 400
- Download source: https://fonts.gstatic.com/s/medievalsharp/v28/EvOJzAlL3oU5AQl2mP5KdgptMqhwMg.woff2
- License: SIL Open Font License 1.1, preserved verbatim in MedievalSharp-OFL.txt
- License source: https://raw.githubusercontent.com/google/fonts/main/ofl/medievalsharp/OFL.txt

Reproduce images, font downloads, licenses, and manifest with:

`node scripts/optimize-assets.cjs`

Requires installed @playwright/test Chromium and Python with Pillow. No originals are modified. Google Fonts may update its upstream files, so downloaded byte hashes can change on later runs.
