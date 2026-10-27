# RAWLINK TRACKER

> **"A wireframe-themed custom URL shortener and click analytics dashboard."**

A minimalist, high-density URL shortener and click analytics logger engineered with **Express.js**, **React 18**, and native **SQLite** (`node:sqlite`).

Adheres strictly to the **"Archival Raw & Monospaced Wireframe"** visual discipline: stark monochrome contrasts, rigid 90-degree black borders, offset hard drop-shadows, pure monospace typography, and zero decorative AI fluff.

---

## ✦ Fitur Utama & Spesifikasi Teknis

- **Pencatatan Analitik Realtime:**
  Setiap klik pada tautan singkat (`/r/:code`) mencatat metadata penelusuran lengkap ke database SQLite:
  - Waktu Klik (Stempel Waktu ISO & Waktu Lokal)
  - Hash IP Teranonimasi (SHA-256 tersensitisasi)
  - Sistem Operasi (`Windows`, `macOS`, `Linux`, `iOS`, `Android`, dll.)
  - Peramban (`Chrome`, `Firefox`, `Safari`, `Edge`, `cURL`, dll.)
  - Tipe Perangkat (`Desktop`, `Mobile`, `Tablet`, `CLI/Bot`)
  - HTTP Referrer & Raw User-Agent string

- **Arsitektur Express Modular:**
  - `src/routes/redirectRouter.js` — Menangani resolusi tautan cepat (HTTP 302) dan pencatatan audit klik ke database.
  - `src/routes/apiRouter.js` — Menyediakan REST API untuk manajemen tautan (`/api/links`) dan metrik agregasi analitik (`/api/stats`, `/api/links/:code`).

- **Komponen React Terpisah & Ringkas:**
  - `Header.jsx` — Status terminal sistem & jam realtime.
  - `StatCard.jsx` — Kartu indikator metrik bergaris putus-putus.
  - `CreateLinkForm.jsx` — Formulir pembuatan tautan dengan slug kustom & validasi input manusiawi.
  - `LinkTable.jsx` — Tabel data tautan aktif dengan tombol salin, direct test, analitik, dan penghapusan.
  - `AnalyticsModal.jsx` — Drawer modal rincian sebaran perangkat dan log klik individual.
  - `SkeletonLoader.jsx` — Skeleton kotak-kotak kaku beranimasi stepping diskret.
  - `EmptyState.jsx` — Status informatif jika basis data tautan belum terisi.

- **Penyimpanan SQLite Native (`node:sqlite`):**
  Menggunakan engine SQLite bawaan Node standard library. Tanpa dependensi ORM berat, tanpa kompilasi C++ eksternal, dan langsung tersimpan di file database lokal.

- **Integrasi Laravel Herd:**
  Direktori dapat langsung diakses melalui domain lokal Laravel Herd:
  - `http://rawlink.test` (atau `http://rawlink-analytics-exprct.test`)
  - Skrip gateway proxy di `public/index.php` otomatis meneruskan permintaan ke Express port `5060`.

---

## ✦ Panduan Instalasi & Menjalankan Proyek

### 1. Instal Dependensi
```bash
# Instal dependensi backend:
npm install

# Instal dependensi frontend React:
cd client && npm install && cd ..
```

### 2. Isi Data Awal (Opsional)
```bash
node scripts/seed.js
```

### 3. Kompilasi Frontend & Jalankan Server
```bash
# Kompilasi frontend Vite ke client/dist:
npm run build

# Jalankan server Express (port 5060):
npm start
```

Akses aplikasi pada:
- **Laravel Herd Domain:** [http://rawlink.test](http://rawlink.test)
- **Direct Express Server:** [http://localhost:5060](http://localhost:5060)

---

## ✦ Dokumentasi Endpoint API

| Metode | Rute Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/links` | Mengambil seluruh daftar tautan aktif dan total klik |
| `POST` | `/api/links` | Membuat tautan singkat baru (`original_url`, `custom_slug`, `title`) |
| `GET` | `/api/links/:code` | Mengambil data tautan, agregasi metrik OS/Browser, dan 150 log klik terakhir |
| `DELETE` | `/api/links/:code` | Menghapus tautan beserta seluruh riwayat klik terkait |
| `GET` | `/api/stats` | Ringkasan metrik global dashboard |
| `GET` | `/r/:code` | Redirect HTTP 302 ke URL tujuan + pencatatan log klik analitik |

---

## ✦ Pengujian Otomatis

Jalankan rangkaian tes integrasi end-to-end:
```bash
npm test
```
Memverifikasi 7 skenario pengujian utama:
1. Pemanggilan daftar tautan (`GET /api/links`)
2. Pembuatan tautan kustom baru (`POST /api/links`)
3. Penolakan tabrakan slug kustom duplikat (HTTP 409)
4. Pengalihan HTTP 302 dan pencatatan klik (`GET /r/:code`)
5. Verifikasi akurasi parsing User-Agent (OS, Browser, Device Type)
6. Agregasi statistik global (`GET /api/stats`)
7. Penghapusan tautan dan pembersihan riwayat (`DELETE /api/links/:code`)

---

## ✦ Lisensi
MIT © Devis Rumi
