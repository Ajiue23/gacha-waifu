# Gacha Waifu

Simulator gacha waifu (React 19 + Tailwind, Create React App) dengan **Feature-Based Architecture**.
Build & deploy: **Vercel** (`gacha-waifu-three.vercel.app`).

## Menjalankan Lokal

```bash
npm ci
cp .env.example .env.local   # sesuaikan REACT_APP_API_BASE_URL
npm start                    # dev server di http://localhost:3000
npm run typecheck            # cek tipe TypeScript
npm run build                # build produksi ke folder build/
npx serve -s build           # pratinjau hasil build (SPA fallback)
```

Persyaratan: **Node.js 20** (lihat `.nvmrc`) dan npm 10+.
`package-lock.json` **wajib ter-commit** (dipakai oleh `npm ci` di CI & Vercel).

## Struktur

```
src/
├─ features/
│  ├─ gacha/          # api/ (banner, state, pull), components/, hooks/, types/
│  └─ inventory/      # api/ (collection, free-gems, reset), components/, hooks/
├─ components/        # UI global: Button, GachaButton, WaifuCard, HistoryDrawer, PlayerWallet
├─ config/            # env.ts (base URL API), gacha.ts (biaya pull, pity, maxHistory)
├─ context/           # PlayerStateContext (state pemain global)
├─ hooks/             # useHashRoute, useLockBodyScroll, useFocusTrap
├─ layouts/           # AppLayout
├─ routes/            # AppRoutes
├─ services/          # apiClient (fetch + error + CSRF)
├─ types/             # Rarity
└─ utils/             # rarity, format, error, userState
```

## Environment Variable

| Variabel | Wajib | Contoh | Keterangan |
| --- | --- | --- | --- |
| `REACT_APP_API_BASE_URL` | ya (Vercel & CI) | `https://api.gacha-waifu.example.com` | Base URL Gacha Engine API. Tanpa trailing slash. |

Catatan penting:

- CRA meng-**inline** env saat build. Mengubah nilai di dashboard Vercel **tidak** mengubah deployment lama — lakukan **Redeploy**.
- Variabel wajib diisi untuk **kedua** environment di Vercel: **Production** dan **Preview**.
- Untuk CI, variable disimpan sebagai **Repository Variable** GitHub Actions:
  Settings → Secrets and variables → Actions → **Variables** → `REACT_APP_API_BASE_URL`.
  Pipeline CI akan **fail-fast** bila kosong (lihat langkah *Validate required env*).
- Nilai lokal ada di `.env.local` (tidak di-commit). `.env.example` hanya contoh, tanpa secret.
- Proyek ini **tidak** menyediakan serverless function di `/api`, jadi mengosongkan
  nilai env **tidak** membuat frontend bisa "same-origin" dengan backend. Selalu isi
  dengan URL backend eksternal.

## Kontrak API

Base URL: `REACT_APP_API_BASE_URL`.

| Endpoint | Method | Keterangan |
| --- | --- | --- |
| `/api/gacha/banner` | GET | Banner aktif + karakter unggulan & rate up |
| `/api/gacha/state` | GET | State user: `gems`, `pity`, `pityLimit`, `freeGemsAvailable` |
| `/api/gacha/pull` | POST | Body `{ count: 1 \| 10 }`, hasil pull + state user terbaru |
| `/api/gacha/collection` | GET | Koleksi karakter milik user (termasuk jumlah duplikat) |
| `/api/gacha/free-gems` | POST | Klaim Free Gems harian |
| `/api/gacha/reset` | POST | Reset data simulasi |

Semua respons boleh dibungkus `{ data: ... }`. State user dibaca dari
`userState` → `state` → `user` → **root payload** (urutan fallback identik untuk
`GET /state` dan `POST /pull`, sehingga `gems`/`pity` di root tetap terbaca).

- `pity` = jumlah pull yang **sudah terpakai** sejak 5★ terakhir (`0..pityLimit`).
  Bila backend mengirim `pityRemaining`/`pullsUntilPity`, frontend mengonversinya otomatis.
- Rarity hasil dinormalisasi ke `3 | 4 | 5` (mendukung kode lama `R`/`SR`/`SSR`).

### Keamanan request

- `apiClient` mengirim cookie (`credentials: "include"`) dan menyertakan header
  `X-CSRF-Token` untuk semua request non-GET. Token dibaca dari
  `<meta name="csrf-token" content="...">` atau cookie `csrf_token`/`XSRF-TOKEN`.
- Backend wajib memvalidasi token tersebut, serta mengirim
  `Access-Control-Allow-Credentials: true` dengan origin eksplisit (bukan `*`)
  dan menetapkan cookie sesi `HttpOnly; Secure; SameSite=Lax|Strict`.
- Origin produksi yang perlu diizinkan backend: `https://gacha-waifu-three.vercel.app`
  (tambahkan juga pola preview `https://gacha-waifu-three-*.vercel.app`).

## Routing & Caching

Aplikasi memakai hash route, sehingga `https://.../#/gacha` dan `https://.../#/koleksi`
aman saat di-refresh. Sebagai jaring pengaman untuk path non-hash
(mis. `/koleksi` yang diketik manual), `vercel.json` memasang **rewrite SPA**:

```
/((?!api($|/)).*)  →  /index.html
```

- Prefix **`/api` dan `/api/*` DIKECUALIKAN** dari rewrite (pola `api($|/)`
  mencakup `/api` tanpa trailing slash), sehingga request ke endpoint API tidak
  pernah diubah menjadi HTML — baik saat env menunjuk origin lain maupun ke
  path `/api` di origin yang sama (bila backend diletakkan terpisah).
- File statis tetap disajikan normal karena Vercel memeriksa filesystem lebih dulu
  sebelum menjalankan rewrite.

Header cache yang dipasang `vercel.json`:

| Path | Cache-Control | Alasan |
| --- | --- | --- |
| `/static/(.*)` | `public, max-age=31536000, immutable` | Nama file ber-hash, aman di-cache selamanya |
| `/` dan `/index.html` | `no-cache, no-store, must-revalidate` | Cegah browser memegang `index.html` lama yang menunjuk aset hash usang |
| lainnya (`/assets/*`, dll.) | default Vercel | Mengikuti kebijakan platform |

Header keamanan yang dipasang: `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`, `Permissions-Policy`, dan **`Content-Security-Policy`**.
CSP default: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data: https:; connect-src 'self' https:`. Bila backend memakai
protokol/domain khusus, sesuaikan direktif `connect-src`/`img-src` di `vercel.json`.

## CI Sebelum Deploy (Gate Rilis)

Vercel hanya menjalankan `npm run build`. Untuk menahan rilis yang rusak, tersedia
gate CI di `.github/workflows/ci.yml` yang berjalan saat **push ke `master`** dan
**pull request ke `master`**:

1. Verifikasi `package-lock.json` ter-commit
2. `npm ci`
3. Validasi `REACT_APP_API_BASE_URL` **fail-fast** bila kosong
4. `npm run typecheck`
5. `npm run build` (dengan `CI=false` eksplisit agar warning ESLint tidak
   menggagalkan build; error TypeScript/kompilasi tetap menggagalkan)
6. `npm test -- --watchAll=false --passWithNoTests`

### Wajib: aktifkan branch protection agar gate benar-benar memblokir

CI **tidak otomatis** memblokir merge/deploy — status check hanya *informasi*.
Agar deploy ke `master` benar-benar terjaga, aktifkan manual (sekali per repo):

1. GitHub → repo → **Settings → Branches → Add branch protection rule**.
2. **Branch name pattern**: `master`.
3. Centang **Require a pull request before merging**.
4. Centang **Require status checks to pass before merging**, lalu pilih
   workflow **CI / Build, typecheck & test**.
5. (Disarankan) Centang **Require branches to be up to date before merging**.

Setelah ini, merge ke `master` (dan karena itu deploy Vercel production) hanya
bisa terjadi setelah gate CI hijau.

### Menyesuaikan ketegasan gate

- Setelah ESLint warning dibersihkan, ubah `CI: "false"` → `CI: "true"` pada
  `env` job di `.github/workflows/ci.yml` agar warning juga menggagalkan build.
- Bila repo sudah punya test stabil dan ingin lebih ketat, hapus flag
  `--passWithNoTests` dari step *Unit tests*.

## Deploy ke Vercel

### 1. Import project

1. Buka [vercel.com/new](https://vercel.com/new) → pilih repo `Ajiue23/gacha-waifu`.
2. **Root Directory**: `.` (frontend ada di root, backend ada di `server/` dan tidak ikut dideploy).
3. Framework Preset: **Create React App** (deteksi otomatis dari `vercel.json`,
   yang juga menetapkan `installCommand`/`buildCommand`/`outputDirectory` default).
4. Node.js Version: **20.x** (mengikuti `.nvmrc`).
5. Pastikan `package-lock.json` sudah ter-commit sebelum import.

### 2. Set environment variable

Project Settings → **Environment Variables** → tambahkan `REACT_APP_API_BASE_URL`
untuk centang **Production** dan **Preview** (dan **Development** bila memakai `vercel dev`).

### 3. Branch production & preview

Project Settings → **Git**:

- **Production Branch**: `master` → setiap push/merge ke `master` otomatis deploy ke
  `https://gacha-waifu-three.vercel.app`.
- **Preview Deployments**: aktifkan untuk semua branch lain (default). Setiap PR/branch
  mendapat URL preview `https://gacha-waifu-three-<hash>-<scope>.vercel.app`.

### 4. Deploy dari CLI (opsional)

```bash
npm i -g vercel
vercel login
vercel link                                   # hubungkan ke project gacha-waifu-three
vercel                                        # deploy preview
vercel --prod                                 # deploy production
vercel env add REACT_APP_API_BASE_URL production
vercel env add REACT_APP_API_BASE_URL preview
```

Pastikan tidak ada kredensial yang ditulis di repo: `vercel.json` hanya berisi
konfigurasi routing/header, seluruh nilai rahasia ada di dashboard Vercel.

## Alur Build di Vercel

```
git push origin master
   ├─ GitHub Actions: lockfile → npm ci → validate env → typecheck → build → test
   │  (gate; branch protection memblokir merge/deploy bila gagal)
   └─ Vercel: npm ci → npm run build (CRA) → output build/ → CDN
        └─ rewrite SPA (kecuali /api) + cache header + domain gacha-waifu-three.vercel.app
```

Jika build Vercel gagal hanya karena **ESLint warning** (CRA memperlakukannya
sebagai error saat `CI=true`), set environment variable `CI=false` di dashboard
Vercel, atau perbaiki warning-nya. Error TypeScript/kompilasi tetap harus
diperbaiki di kode.

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| Halaman 404 saat refresh di `/koleksi` | rewrite SPA belum aktif | Pastikan `vercel.json` ter-commit dan redeploy |
| API balas HTML bukan JSON | rewrite menelan `/api` | Pastikan pattern rewrite `/((?!api($|/)).*)` |
| Halaman blank setelah redeploy | `index.html` lama masih di-cache | Sudah dicegah `Cache-Control: no-cache` pada `/` & `/index.html`; hard refresh bila perlu |
| `Tidak dapat terhubung ke server gacha` | `REACT_APP_API_BASE_URL` kosong/salah | Isi env untuk Production & Preview, lalu **Redeploy** |
| CI gagal di step "Validate required env" | Repository Variable belum diset | Set `REACT_APP_API_BASE_URL` di Actions Variables |
| CI gagal di step "Verify package-lock.json is committed" | lockfile belum ada di repo | Jalankan `npm install` lalu commit `package-lock.json` |
| Merge ke `master` tidak diblokir saat CI merah | branch protection belum aktif | Aktifkan manual (lihat bagian *CI Sebelum Deploy*) |
| CSP memblokir request/asset | `connect-src`/`img-src` terlalu ketat | Tambahkan origin backend/gambar ke direktif terkait di `vercel.json` |
| Data API lama masih muncul | env di-inline saat build | Redeploy setelah mengubah env / clear cache |
| CORS error di console | origin belum diizinkan backend | Tambahkan `https://gacha-waifu-three.vercel.app` |
| Build gagal di Vercel tapi lokal sukses | beda versi Node / `package-lock.json` tidak sinkron | Pakai Node 20 (`.nvmrc`), commit lockfile, `npm ci` |
