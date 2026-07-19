# Panduan Deployment CasaOS - LMS SMK YPWKS Cilegon

Panduan lengkap untuk meng部署 aplikasi LMS (Learning Management System) berbasis Next.js 16 dengan MariaDB di platform CasaOS.

---

## 1. Prasyarat

Sebelum memulai deployment, pastikan Anda memiliki:

### 1.1. CasaOS Terinstall
- Install CasaOS versi terbaru di server atau VPS Anda
- Akses CasaOS melalui browser: `http://[IP_SERVER_CASAOS]`
- Pastikan CasaOS sudah terhubung dengan internet untuk mengakses App Store

### 1.2. phpMyAdmin
- Install aplikasi **phpMyAdmin** dari CasaOS App Store
- phpMyAdmin akan digunakan untuk mengelola database MariaDB
- Akses biasanya di: `http://casaos:8888` atau sesuai konfigurasi CasaOS Anda

### 1.3. SSH Access
- Pastikan Anda memiliki akses SSH ke server CasaOS
- Untuk Windows: gunakan PowerShell atau Windows Terminal
- Untuk macOS/Linux: gunakan terminal bawaan

```bash
ssh [username]@[IP_SERVER_CASAOS]
```

### 1.4. Informasi Jaringan
- IP address server CasaOS
- Port yang dibutuhkan:
  - **3000** - Untuk aplikasi Next.js web
  - **3306** - Untuk MariaDB database
- Pastikan port tersebut tidak diblokir firewall

---

## 2. Setup Database MariaDB melalui phpMyAdmin

### Langkah 1: Buat Database dan User

1. Buka phpMyAdmin di CasaOS
2. Klik tab **SQL** atau **New** untuk membuat database baru
3. Jalankan query SQL berikut:

```sql
-- Buat database
CREATE DATABASE IF NOT EXISTS `lms_mesin_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Buat user database
CREATE USER IF NOT EXISTS 'lms_user'@'%' 
IDENTIFIED BY '[GANTI_DENGAN_PASSWORD_COMPLEX_12_CHAR_MIN]';

-- Berikan privilege
GRANT ALL PRIVILEGES ON `lms_mesin_db`.* TO 'lms_user'@'%';

-- Refresh privilege
FLUSH PRIVILEGES;
```

**PENTING**: Ganti `[GANTI_DENGAN_PASSWORD_COMPLEX_12_CHAR_MIN]` dengan password yang kuat (minimal 12 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol).

### Langkah 2: Verifikasi Database

Jalankan query untuk memastikan database dan user berhasil dibuat:

```sql
-- Cek database
SHOW DATABASES;

-- Cek user
SELECT User, Host FROM mysql.user WHERE User='lms_user';

-- Cek privilege
SHOW GRANTS FOR 'lms_user'@'%';
```

---

## 3. Upload File ke CasaOS User Share

### Langkah 1: Akses User Share

1. Di CasaOS, buka **Storage** atau **Files**
2. Navigasi ke folder user share: `/mnt/user/appdata/lmsmesin/`
3. Jika folder belum ada, buat terlebih dahulu:

```bash
mkdir -p /mnt/user/appdata/lmsmesin/{uploads,data,backup}
```

### Langkah 2: Upload Project Files

Ada beberapa cara untuk upload:

#### Metode 1: Via SSH (Recommended untuk development)
```bash
# Di komputer lokal Anda, dari folder project
scp -r /path/to/lmsmesin/* [username]@[IP_CASAOS]:/mnt/user/appdata/lmsmesin/
```

#### Metode 2: Via Samba/CIFS (Windows/Mac)
1. Mount network drive di komputer lokal Anda
2. Copas file project langsung ke folder `/mnt/user/appdata/lmsmesin/`

#### Metode 3: Via CasaOS File Manager
1. Buka CasaOS File Manager
2. Upload file project satu per satu atau zip lalu extract

### Langkah 3: Struktur Folder Setelah Upload

```
/mnt/user/appdata/lmsmesin/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── next.config.ts
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── uploads/ (akan dibuat otomatis)
├── app/
├── components/
├── lib/
├── styles/
└── uploads/ (untuk temporary storage selama build)
```

---

## 4. Konfigurasi Environment (.env file)

### Langkah 1: Salin File .env.casaos

```bash
cd /mnt/user/appdata/lmsmesin/
cp .env.casaos .env.local
```

### Langkah 2: Edit File .env.local

```bash
nano .env.local
```

Atau gunakan `vi` atau editor lain:

```bash
# =========================
# DATABASE - MariaDB CasaOS
# =========================
DATABASE_URL="mysql://lms_user:[PASSWORD_ANDA]@db:3306/lms_mesin_db"

# Prisma engine untuk Docker/MySQL
PRISMA_CLIENT_ENGINE_TYPE="library"

# =========================
# NEXTAUTH
# =========================
# Generate dengan: openssl rand -base64 48
NEXTAUTH_SECRET="[GANTI_DENGAN_RANDOM_48_CHAR]"
NEXTAUTH_URL="http://localhost:3000"

# =========================
# BasePath - KOSONGKAN
# =========================
NEXT_PUBLIC_BASE_PATH=""

# =========================
# Vercel Blob - TIDAK DIPAKAI
# =========================
BLOB_READ_WRITE_TOKEN=""

# =========================
# Optional - VAPID Web Push
# =========================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""

# =========================
# Optional - WhatsApp Fonnte
# =========================
WHATSAPP_TOKEN=""
WHATSAPP_TARGET_GROUP_OR_PHONE=""

# =========================
# Node env
# =========================
NODE_ENV="production"

# =========================
# MySQL Docker Configuration
# =========================
MYSQL_ROOT_PASSWORD="[GANTI_DENGAN_ROOT_PASSWORD_COMPLEX]"
MYSQL_PASSWORD="[GANTI_DENGAN_USER_PASSWORD_SAMA_DENGAN_DATABASE_URL]"
MYSQL_DATABASE="lms_mesin_db"
```

**PENTING**:
- Ganti `[PASSWORD_ANDA]` dengan password yang sama dengan yang dibuat di phpMyAdmin
- Ganti `[GANTI_DENGAN_RANDOM_48_CHAR]` dengan string acak minimal 48 karakter
- Ganti `[GANTI_DENGAN_ROOT_PASSWORD_COMPLEX]` dengan root password untuk MariaDB (minimal 12 karakter)
- Pastikan `MYSQL_PASSWORD` sama dengan password user `lms_user`

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 48
# atau
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Langkah 3: Verifikasi File .env.local

Pastikan file .env.local memiliki format yang benar:
- Setiap variabel diisi dengan nilai (tidak boleh kosong kecuali ada keterangan)
- Tidak ada spasi berlebih di sekitar tanda `=`
- String value diapit dengan tanda kutip ganda `"`

---

## 5. Deployment dengan Docker Compose

### Langkah 1: Verifikasi File Docker Compose

Pastikan `docker-compose.yml` sudah benar:

```yaml
services:
  db:
    image: mariadb:10.11
    container_name: lms_mariadb
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: lms_mesin_db
      MYSQL_USER: lms_user
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
    networks:
      - lms_network
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 5s
      retries: 10
      interval: 5s

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lms_web_app
    restart: always
    environment:
      DATABASE_URL: "mysql://lms_user:${MYSQL_PASSWORD}@db:3306/lms_mesin_db"
      NEXTAUTH_URL: "http://web:3000"
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    volumes:
      - ./uploads:/app/public/uploads
    networks:
      - lms_network
    depends_on:
      db:
        condition: service_healthy

networks:
  lms_network:
    driver: bridge

volumes:
  mariadb_data:
  uploads:
```

### Langkah 2: Jalankan Docker Compose

```bash
cd /mnt/user/appdata/lmsmesin/

# Build dan jalankan semua container
docker-compose up -d --build
```

**Penjelasan**:
- `up`: Membuat dan menjalankan container
- `-d`: Mode detached (jalan di background)
- `--build`: Force rebuild image

### Langkah 3: Monitor Proses Build

```bash
# Lihat log real-time
docker-compose logs -f

# Cek status container
docker-compose ps
```

**Proses build akan memakan waktu 5-15 menit** tergantung spek server dan koneksi internet.

---

## 6. Konfigurasi Nginx Proxy Manager untuk Custom Domain + HTTPS

### Langkah 1: Install Nginx Proxy Manager

1. Buka CasaOS App Store
2. Cari **Nginx Proxy Manager**
3. Install aplikasi
4. Akses di: `http://[IP_CASAOS]:81`
5. Login dengan kredensial default:
   - Email: `admin@example.com`
   - Password: `changeme`
6. **UBAH** kredensial login segera setelah login pertama kali

### Langkah 2: Konfigurasi Domain DNS

Pastikan domain Anda sudah mengarah ke IP CasaOS:

```
Type: A
Name: lms (atau nama subdomain pilihan Anda)
Value: [IP_PUBLIK_CASAOS]
TTL: Auto
```

Jika menggunakan dynamic DNS (NoIP, DuckDNS, dsb), pastikan sudah diupdate.

### Langkah 3: Tambah Proxy Host di Nginx Proxy Manager

1. Buka Nginx Proxy Manager
2. Klik **Add Proxy Host**
3. Isi form:

| Field | Value |
|-------|-------|
| Domain Names | `lms.yourdomain.com` |
| Forward Hostname / IP | `lms_web_app` |
| Forward Port | `3000` |
| SSL Certificate | **Request a new certificate** |
| Force SSL | ✅ Checked |
| HTTP/2 Support | ✅ Checked |
| HSTS | ✅ Checked |
| Block Exploits | ✅ Checked |

4. Klik **Save**

**CATATAN**: 
- Jika menggunakan custom domain, gunakan nama domain lengkap (contoh: `lms.smkypwks.sch.id`)
- `Forward Hostname / IP` bisa juga menggunakan IP CasaOS: `192.168.x.x` jika domain belum aktif

### Langkah 4: Test HTTPS

Buka browser dan akses:
```
https://lms.yourdomain.com
```

Pastikan:
- ✅ Terdapat padlock di address bar (HTTPS aktif)
- ✅ Sertifikat valid (tidak ada peringatan keamanan)
- ✅ Halaman login LMS muncul

---

## 7. Verifikasi Deployment

### Langkah 1: Verifikasi Container

```bash
# Cek semua container running
docker-compose ps

# Output yang diharapkan:
# Name                 Command             State     Ports
# --------------------------------------------------------------
# lms_mariadb          docker-entrypoint ...   Up      0.0.0.0:3306->3306/tcp
# lms_web_app          sh -c npx prisma mi ... Up      0.0.0.0:3000->3000/tcp
```

### Langkah 2: Verifikasi Database

```bash
# Masuk ke container MariaDB
docker exec -it lms_mariadb mysql -ulms_user -p[lms_password] lms_mesin_db

# Cek tabel
SHOW TABLES;

# Cek jumlah data (harus ada beberapa tabel kosong)
SELECT COUNT(*) as total_users FROM User;
SELECT COUNT(*) as total_courses FROM Course;

# Keluar
EXIT;
```

### Langkah 3: Verifikasi Web Application

1. Buka browser
2. Akses: `http://[IP_CASAOS]:3000` (tanpa HTTPS dulu)
3. Login dengan kredensial admin default (lihat `prisma/seed.ts`)

**Jika ada error koneksi database**:
- Pastikan `DATABASE_URL` di `.env.local` sudah benar
- Restart container: `docker-compose restart web`
- Cek log: `docker-compose logs web`

### Langkah 4: Verifikasi Upload Functionality

1. Login ke aplikasi
2. Navigate ke halaman upload (misal: Jobsheet Create)
3. Upload file test (PDF/Image)
4. Verifikasi file tersimpan di:
   ```
   /mnt/user/appdata/lmsmesin/uploads/
   ```

---

## 8. Troubleshooting Checklist

### 8.1. Database Connection Errors

**Error**: `Error: P1000: Database connection error`

**Solusi**:
```bash
# Cek status database container
docker-compose ps db

# Cek logs database
docker-compose logs db

# Pastikan MYSQL_PASSWORD di .env.local sama dengan password di phpMyAdmin
# Restart container
docker-compose restart db
docker-compose restart web
```

### 8.2. Build Failures

**Error**: `npm ERR!` atau `Build failed`

**Solusi**:
```bash
# Clean build cache
docker-compose down
docker system prune -a --volumes

# Build ulang
docker-compose up -d --build

# Atau build hanya web service
docker-compose build web
docker-compose up -d web
```

### 8.3. Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solusi**:
```bash
# Cek port yang digunakan
sudo lsof -i :3000
sudo lsof -i :3306

# Atau gunakan netstat
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3306

# Stop container yang menggunakan port
docker stop [container_id]
```

### 8.4. Prisma Migration Failures

**Error**: `Prisma schema validation failed` atau migration error

**Solusi**:
```bash
# Masuk ke container web
docker exec -it lms_web_app sh

# Cek schema
cat prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Jalankan migration manual
npx prisma migrate deploy

# Exit container
exit

# Restart web container
docker-compose restart web
```

### 8.5. File Permission Issues

**Error**: `EACCES: permission denied` saat upload atau write

**Solusi**:
```bash
# Cek permissions
ls -la /mnt/user/appdata/lmsmesin/uploads/

# Fix permissions
sudo chmod -R 777 /mnt/user/appdata/lmsmesin/uploads/
sudo chown -R 1001:1001 /mnt/user/appdata/lmsmesin/uploads/

# Restart container
docker-compose restart web
```

### 8.6. Nginx Proxy Connection Refused

**Error**: `502 Bad Gateway` di Nginx Proxy Manager

**Solusi**:
```bash
# Cek container web running
docker-compose ps web

# Cek logs web
docker-compose logs web

# Pastikan container name di Nginx Proxy Manager = container_name di docker-compose.yml
# Restart web container
docker-compose restart web

# Restart Nginx Proxy Manager
docker-compose restart nginx-proxy-manager
```

### 8.7. CSS/JS Not Loading (404 Errors)

**Error**: Halaman muncul tanpa styling

**Solusi**:
```bash
# Cek build output
docker exec -it lms_web_app ls -la .next/

# Restart container
docker-compose restart web

# Clear browser cache
```

### 8.8. SSL Certificate Issues

**Error**: Certificate expired atau not trusted

**Solusi**:
```bash
# Reset SSL certificate di Nginx Proxy Manager
1. Edit Proxy Host
2. Delete SSL certificate
3. Request new certificate
4. Save

# Atau manually renew
docker exec -it npm_proxy_manager_1 certbot renew
```

### 8.9. Application Shows Blank Page

**Error**: White screen atau no content

**Solusi**:
```bash
# Check browser console for errors (F12)
# Common issues:
# 1. NEXTAUTH_URL wrong
# 2. Middleware blocking everything
# 3. Build incomplete

# Check .env.local NEXTAUTH_URL
grep NEXTAUTH_URL .env.local

# Check middleware configuration
cat middleware.ts

# Restart all
docker-compose restart
```

### 8.10. Container Not Starting

**Error**: Container stuck in `created` or `exited` state

**Solusi**:
```bash
# Check logs
docker-compose logs

# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check disk space
df -h
docker system df
```

---

## 9. Backup dan Restore

### Backup Database

```bash
# Backup manual
docker exec lms_mariadb mysqldump -uroot -p[ROOT_PASSWORD] lms_mesin_db > backup/lms_backup_$(date +%Y%m%d).sql

# Atau via phpMyAdmin
# Login → Select database → Export → Go
```

### Backup File Uploads

```bash
tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz /mnt/user/appdata/lmsmesin/uploads/
```

### Restore Database

```bash
docker exec -i lms_mariadb mysql -uroot -p[ROOT_PASSWORD] lms_mesin_db < backup/lms_backup_YYYYMMDD.sql
```

---

## 10. Maintenance

### Update Application

```bash
cd /mnt/user/appdata/lmsmesin/

# Pull latest code (jika menggunakan git)
git pull origin main

# Rebuild
docker-compose down
docker-compose build
docker-compose up -d

# Run migration
docker exec lms_web_app npx prisma migrate deploy
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Web container only
docker-compose logs -f web

# DB container only
docker-compose logs -f db

# Real-time streaming
docker-compose logs --tail=100 -f
```

### Container Management

```bash
# Stop
docker-compose down

# Start
docker-compose up -d

# Restart
docker-compose restart

# Remove all (careful!)
docker-compose down -v
```

---

## 11. Performance Optimization

### Container Resource Limits

Edit `docker-compose.yml` dan tambahkan resource limits:

```yaml
services:
  web:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### MariaDB Optimization

Tambahkan custom MySQL config di `docker-compose.yml`:

```yaml
services:
  db:
    # ... existing config ...
    command: >
      --innodb-buffer-pool-size=512M
      --max-connections=200
      --innodb-log-file-size=64M
      --innodb-log-buffer-size=16M
```

---

## 12. Keamanan

### Regular Updates

```bash
# Update CasaOS
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d --force-recreate
docker image prune
```

### SSL Certificate Auto-Renew

Nginx Proxy Manager otomatis renew SSL. Pastikan:
- Domain DNS sudah benar
- Port 80 dan 443 terbuka
- Server bisa akses internet

### Backup Schedule

Buat cron job untuk backup otomatis:

```bash
# Edit cron
crontab -e

# Tambahkan (backup harian jam 2 pagi)
0 2 * * * docker exec lms_mariadb mysqldump -uroot -p[ROOT_PASSWORD] lms_mesin_db | gzip > /mnt/user/appdata/lmsmesin/backup/lms_$(date +\%Y\%m\%d).sql.gz
  0 3 * * * tar -czvf /mnt/user/appdata/lmsmesin/backup/uploads_$(date +\%Y\%m\%d).tar.gz /mnt/user/appdata/lmsmesin/uploads/
  ```

---

## 12. Deployment Alternatif: CasaOS App Store (Custom App)

Jika Anda ingin aplikasi muncul di **CasaOS App Store** sebagai custom app:

### Metode 1: Docker Compose (Recommended)
1. **Buka CasaOS App Store**
2. **Klik icon Custom Install** (pojok kanan atas, ikon droplet/tambah)
3. **Pilih "Docker Compose"** atau **"Import"**
4. **Paste atau import** file `/mnt/user/appdata/lmsmesin/docker-compose.yml`
5. **Klik "Deploy"** dan tunggu proses build (5-15 menit)

### Metode 2: Custom App Manifest (Advanced)
1. **Buat folder** di `/mnt/user/appdata/lmsmesin/`
2. **Buat file** `app.json` dengan manifest:
```json
{
  "name": "LMS SMK YPWKS Cilegon",
  "description": "Learning Management System untuk Teknik Pemesinan",
  "version": "1.0.0",
  "website": "https://lms.local",
  "provider": "LMS Team",
  "docker_hub": "",
  "registry": "",
  "dockerfile": "Dockerfile",
  "composefile": "docker-compose.yml",
  "port": "3000",
  "env": [
    {"name": "NEXTAUTH_SECRET", "value": "", "required": true},
    {"name": "MYSQL_PASSWORD", "value": "", "required": true}
  ],
  "volumes": [
    {"container": "/app/public/uploads", "host": "/mnt/user/appdata/lmsmesin/uploads/"}
  ],
  "ports": [
    {"container": 3000, "host": 3000}
  ],
  "dependencies": {
    "databases": ["MariaDB"]
  },
  "tags": ["Education", "LMS", "School"],
  "categories": ["Education"],
  "icon": "https://yourdomain.com/lms-logo.png",
  "screenshots": []
}
```
3. **Buat folder `app`** dan simpan `app.json` di sana
4. **Rebuild CasaOS App Store cache** atau restart CasaOS

**Note:** Opsi 1 (Docker Compose) lebih mudah dan direkomendasikan.

---

## 13. Contact & Support

Jika mengalami masalah yang tidak teratasi di troubleshooting:

1. Check Docker logs:
   ```bash
   docker-compose logs --tail=50
   ```

2. Check CasaOS System Logs
3. Pastikan semua prasyarat terpenuhi
4. Re-read deployment steps carefully

---

**Version**: 1.0  
**Last Updated**: 2026-07-19  
**Project**: LMS SMK YPWKS Cilegon  
**Stack**: Next.js 16, MariaDB, Docker Compose, CasaOS
