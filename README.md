# Gacha Waifu

Simulator gacha waifu (React + Tailwind) dengan **Feature-Based Architecture**.

## Menjalankan

```bash
npm install
npm start        # dev server
npm run build    # build produksi
npm test         # unit test
npm run typecheck
```

## Struktur

```
src/
├─ features/
│  └─ gacha/
│     ├─ api/          # gachaApi.ts (banner, state, pull)
│     ├─ components/   # GachaView, GachaBanner, PullButtons, PityCounter, PullResultOverlay, WaifuResultCard
│     ├─ hooks/        # useGacha, useUserState
│     ├─ types/        # tipe fitur gacha
│     └─ index.ts      # public API fitur
├─ components/         # UI global: Button, GachaButton, WaifuCard, HistoryDrawer
├─ config/             # env.ts, gacha.ts (biaya pull, pity, maxHistory)
├─ hooks/              # useLockBodyScroll, useFocusTrap
├─ layouts/            # AppLayout
├─ routes/             # AppRoutes
├─ services/           # apiClient (fetch + error + CSRF)
├─ types/              # Rarity
└─ utils/              # rarity (tema 3★ biru / 4★ ungu / 5★ emas), format, error
```

## Kontrak API

Base URL: `REACT_APP_API_BASE_URL` (lihat `.env.example`).

| Endpoint | Method | Keterangan |
| --- | --- | --- |
| `/api/gacha/banner` | GET | Banner aktif + karakter unggulan & rate up |
| `/api/gacha/state` | GET | State user: `gems`, `pity`, `pityLimit`, `freeGemsAvailable` |
| `/api/gacha/pull` | POST | Body `{ count: 1 \| 10 }`, mengembalikan hasil pull + state user terbaru |

Semua respons boleh dibungkus `{ data: ... }`. State user dibaca dari
`userState` → `state` → `user` → **root payload** (urutan fallback identik untuk
`GET /state` dan `POST /pull`, sehingga `gems`/`pity` di root tetap terbaca).

- `pity` = jumlah pull yang **sudah terpakai** sejak 5★ terakhir (`0..pityLimit`).
  Bila backend mengirim `pityRemaining`/`pullsUntilPity`, frontend mengonversinya otomatis.
- Rarity hasil dinormalisasi ke `3 | 4 | 5` (mendukung kode lama `R`/`SR`/`SSR`).
- **Merge vs replace**: respons `POST /pull` boleh mengirim state parsial
  (mis. hanya `{ gems: 1440 }`). Frontend melakukan *merge* ke state terakhir,
  sehingga `pity` tidak ter-reset saat backend tidak menyertakannya.
  Regresi ini dikunci oleh test `src/features/gacha/hooks/__tests__/useUserState.test.tsx`.

### Keamanan request

- `apiClient` mengirim cookie (`credentials: "include"`) dan menyertakan header
  `X-CSRF-Token` untuk semua request non-GET. Token dibaca dari
  `<meta name="csrf-token" content="...">` atau cookie `csrf_token`/`XSRF-TOKEN`.
- Backend wajib memvalidasi token tersebut, serta mengirim
  `Access-Control-Allow-Credentials: true` dengan origin eksplisit (bukan `*`)
  dan menetapkan cookie sesi `HttpOnly; Secure; SameSite=Lax|Strict`.

## Ikon & PWA

Repo ini **hanya menyimpan ikon SVG** (`public/favicon.svg`,
`public/icons/maskable.svg`). Keputusan ini disengaja karena source code tidak
dapat membuat file biner (PNG/ICO) di pipeline PR.

Implikasi / keterbatasan yang diketahui:

- `public/favicon.ico` **tidak disediakan** — `index.html` hanya mereferensikan
  `favicon.svg`. Browser modern memakainya; browser sangat lama (IE) akan jatuh
  ke ikon default. Tidak ada link `.ico` yang 404.
- `apple-touch-icon` (PNG 180x180) **tidak disediakan** — ikon iOS akan memakai
  screenshot halaman. Bila ingin ikon iOS proper, tambahkan file
  `public/apple-touch-icon.png` (180x180) lalu tambahkan
  `<link rel="apple-touch-icon">` di `public/index.html`.
- `manifest.json` hanya mendeklarasikan ikon SVG (`sizes: "any"`). Sebagian
  tooling PWA menyarankan PNG 192/512. Bila targetnya PWA penuh, tambahkan
  `icons/icon-192.png` & `icons/icon-512.png` dan daftarkan di `manifest.json`.

Ikon maskable (`public/icons/maskable.svg`) sudah memenuhi syarat safe zone
80% (konten dibatasi ±207px dari 512px) sehingga tidak terpotong saat Android
memberlakukan mask circle/squircle.
