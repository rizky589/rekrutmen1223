# Rekrutmen Mitra Statistik 2026

Aplikasi fullstack modern untuk Rekrutmen Mitra Statistik 2026 BPS Kabupaten Labuhanbatu Utara. Stack: Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI, Supabase Auth/Database/Storage, dan Vercel Free.

## Fitur

- Login/register Supabase Auth dengan role `admin` dan `user`
- Peserta hanya bisa register jika nama dan tanggal lahir cocok dengan daftar lulus administrasi
- Ujian 30 soal wajib, timer 60 menit, auto-submit, scoring server-side
- Nilai tidak ditampilkan ke peserta
- Admin dashboard, CRUD peserta, CRUD/import soal Excel/CSV, hasil, export Excel
- Settings jadwal buka/tutup ujian otomatis
- Upload avatar ke Supabase Storage
- Dark mode, toast, protected routes, responsive mobile-first

## Install Lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dari Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Setup Supabase

1. Buat project Supabase Free.
2. Buka SQL Editor, jalankan `supabase/schema.sql`.
3. Aktifkan Email Auth di Supabase Authentication.
4. Untuk alur peserta tanpa email, matikan email confirmation di Authentication → Providers → Email → Confirm email. Peserta akan login memakai nomor HP dan password; aplikasi membuat email internal otomatis.
5. Buat akun admin pertama lewat Supabase Authentication → Users.
6. Jalankan SQL berikut di Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

7. Tambah peserta lulus administrasi di `/admin/participants`, atau import Excel/CSV sampai 400 calon mitra sekaligus.
8. Tambah soal manual atau import file `.xlsx`, `.xls`, `.csv` di `/admin/questions`.

Format import soal Excel/CSV:

```text
nomor,pertanyaan,a,b,c,d,e,kunci
1,Siti memiliki 27 kartu...,36,37,38,39,40,E
```

Format import peserta Excel/CSV:

```text
nama
Budi Santoso
```

Peserta register sendiri memakai Nama Lengkap, Tanggal Lahir, Kecamatan, Nomor HP, dan Password. Saat register, sistem hanya mengecek apakah nama ada di daftar admin dan belum pernah dipakai. Setelah itu peserta login memakai Nomor HP dan Password. Admin tetap login memakai email dan password Supabase.

Jika database lama sudah terlanjur dibuat dengan schema NIK, jalankan `supabase/migrate-to-phone-login.sql` di Supabase SQL Editor.

## Deploy Vercel Free

1. Push project ke GitHub.
2. Import repo di Vercel.
3. Tambahkan environment variables yang sama dengan `.env.example`.
4. Deploy.
5. Di Supabase Auth URL Configuration, isi Site URL dengan domain Vercel dan tambahkan redirect URL:

```text
https://domain-anda.vercel.app/**
```

## Struktur Folder

```text
app/                  App Router pages, API routes, server actions
components/           Reusable UI, shell, timer, theme
components/ui/        shadcn-style primitives
lib/                  Auth, validation, Supabase clients, constants
stores/               Zustand state
types/                Shared TypeScript types
supabase/schema.sql   Database, RLS, storage, policies
```

## Checklist Testing Mobile

- Buka di Android Chrome, Samsung Internet, Safari iPhone, tablet, laptop, desktop
- Pastikan tidak ada horizontal overflow
- Navbar bawah mobile terlihat dan tidak menutup tombol submit
- Form login/register nyaman satu tangan
- Admin table bisa discroll horizontal di layar kecil
- Timer berjalan dan auto-submit saat 00:00
- Peserta tidak bisa melihat nilai
- User non-admin tidak bisa akses `/admin`
- Export Excel berhasil dari akun admin
