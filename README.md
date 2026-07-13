# LMS SMK YPWKS Cilegon - Teknik Pemesinan

Learning Management System (LMS) khusus untuk jurusan **Teknik Pemesinan** SMK YPWKS Cilegon. Mengelola pembelajaran teori, praktik bengkel, manajemen alat/mesin, dan penilaian terintegrasi.

## Fitur Utama

- **Autentikasi & Role** — Admin, Guru, Murid, dan Kepala Sekolah
- **Manajemen Mata Pelajaran** — CRUD mapel, enroll siswa, assign guru
- **Job Sheet** — Panduan praktik dengan SOP, K3, dan visualisasi 3D CAD (STL)
- **Absensi** — Input manual & scan QR Code mesin, rekap bulanan, export XLSX
- **Nilai & Rapor** — Input nilai harian, praktik, UTS, UAS, komposit, dan e-Rapor
- **Kuis Teori** — Pilihan ganda dengan timer dan auto-grading
- **Tool Crib** — Inventaris alat bengkel dengan peminjaman (Pending → Borrowed → Returned)
- **Manajemen Mesin** — Status kesiapan mesin (Ready/Maintenance/Broken), QR Code
- **Perawatan Mesin** — Jurnal servis, notifikasi ke grup WhatsApp Guru
- **Logbook & Portofolio** — Catatan penggunaan mesin dan galeri benda kerja
- **Pelanggaran Siswa** — Poin pelanggaran (Ringan/Sedang/Berat)
- **Jurnal Mengajar** — Catatan harian guru
- **BKK** — Bursa Kerja Khusus, lowongan magang/kerja
- **Forum Diskusi** — Per-course discussion
- **Kalender Akademik** — Libur, ujian, kegiatan
- **Mading Digital** — Pengumuman bengkel
- **Statistik** — Charts interaktif (Recharts)
- **Notifikasi In-App** — Tool reminders, machine emergencies, maintenance alerts

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (dev) / MySQL (produksi)
- **ORM**: Prisma 5
- **Auth**: NextAuth.js v4 (Credentials + JWT)
- **Icons**: Lucide React
- **Charts**: Recharts
- **3D**: Three.js (STL viewer)
- **PDF**: jsPDF, jspdf-autotable
- **Excel**: xlsx
- **QR**: html5-qrcode

## Memulai

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Setup database (SQLite default)
npx prisma db push
npx prisma db seed

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Untuk Produksi

1. Setup MySQL, update `DATABASE_URL` di `.env`
2. Jalankan `npx prisma db push` atau `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm start`

## Deployment

Menggunakan `server.js` untuk cPanel/Passenger Node.js.
