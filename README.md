# Hiura-AutoOrder: Telegram Auto Order Bot dengan Tripay Payment Gateway

## Deskripsi Proyek

**Hiura-AutoOrder** adalah bot Telegram otomatis yang dirancang untuk memproses pesanan produk digital secara mandiri (Auto Order) dengan integrasi penuh Payment Gateway **Tripay**. Dibangun menggunakan **Node.js** dan framework **Telegraf**, bot ini mengutamakan arsitektur yang **modular, mudah di-maintain, aman (anti-bug & anti-bypass)**, serta siap berjalan di lingkungan **Termux** atau **VPS**.

Bot ini menangani seluruh alur transaksi, mulai dari pemilihan produk, pembuatan *invoice* Tripay, hingga pengiriman akun/stok secara otomatis setelah pembayaran terverifikasi melalui *callback* yang aman.

## Fitur Utama

### 1. Fitur Pengguna (User)

| Perintah/Aksi | Deskripsi |
| :--- | :--- |
| `/start` | Menampilkan menu utama dengan tombol *inline* untuk navigasi cepat. |
| `/listproduk` | Menampilkan daftar produk yang tersedia, dibaca dari `products.json`. |
| `/beli <produk>` | Memulai alur pemesanan untuk produk yang dipilih. |
| `/riwayat` | Menampilkan riwayat transaksi (order) yang pernah dilakukan oleh pengguna. |
| **Inline Buttons** | Memfasilitasi alur order yang lancar: Pilih Produk, Pilih Durasi, Pilih Metode Bayar, *Generate Invoice* Tripay, Cek Status *Invoice*, dan Klaim Akun Otomatis. |
| **Anti-Spam** | Implementasi *rate limiting* per pengguna untuk mencegah *spam* dan *abuse* sistem. |

### 2. Fitur Administrator (Admin)

Akses penuh melalui perintah `/admin` yang menampilkan panel *inline* khusus.

| Perintah | Deskripsi |
| :--- | :--- |
| `/admin` | Menampilkan panel kontrol admin. |
| `/addproduct <nama>` | Menambahkan produk baru ke daftar. |
| `/delproduct <nama>` | Menghapus produk dari daftar. |
| `/setprice <nama> <harga>` | Mengatur harga untuk produk tertentu. |
| `/addstock <produk> <user:pass>` | Menambahkan satu unit stok produk (misalnya: akun) ke dalam antrian. |
| `/bulkstock (upload file)` | Mengunggah stok dalam jumlah besar melalui file. |
| `/liststock <produk>` | Menampilkan daftar stok yang tersedia untuk produk. |
| `/delstock <produk> <id>` | Menghapus stok berdasarkan ID/indeks. |
| `/stats` | Menampilkan statistik bot secara keseluruhan. |
| `/topbuyer` | Menampilkan daftar pengguna dengan pembelian terbanyak. |
| `/setlimit <detik>` | Mengatur batas waktu *rate limit* pengguna. |
| `/backupnow` | Melakukan *backup* data secara manual. |
| `/adminlog ON/OFF` | Mengaktifkan/menonaktifkan pencatatan log aktivitas admin. |
| `/maintenance ON/OFF` | Mengaktifkan/menonaktifkan mode pemeliharaan (*maintenance mode*). |
| `/monitoring` | Menampilkan status dan performa bot secara *real-time*. |

## Arsitektur dan Struktur Proyek

Proyek ini mengadopsi struktur modular untuk memastikan kode **rapih, mudah di-maintain, dan *scalable***.

```
bot/
│── index.js          # File utama (entry point)
│── config.js         # Konfigurasi bot dan API keys
│
│── assets/           # Aset visual (gambar profil, ikon, banner)
│     ├── profil/
│     ├── icons/
│     └── banners/
│
│── commands/         # Logika untuk setiap perintah Telegram (e.g., /start, /admin)
│     ├── admin.js
│     ├── order.js
│     ├── user.js
│     └── help.js
│
│── handlers/         # Penanganan interaksi non-perintah (buttons, callbacks)
│     ├── commandHandler.js
│     ├── buttonHandler.js
│     └── callbackHandler.js
│
│── utils/            # Kumpulan fungsi utilitas inti yang dapat digunakan kembali
│     ├── db.js
│     ├── stok.js
│     ├── tripay.js
│     ├── invoice.js
│     ├── validation.js
│     ├── limiter.js
│     ├── sanitizer.js
│     ├── logger.js
│     ├── monitoring.js 
│     └── security.js
│
│── api/              # Endpoint API eksternal (khususnya untuk Tripay Callback)
│     └── callback.js
│
│── database/         # Penyimpanan data berbasis JSON
│     ├── users.json
│     ├── products.json
│     ├── orders.json
│     └── stok/       # Folder untuk file stok produk (e.g., netflix.txt)
```

## Keamanan dan Integritas Sistem

Keamanan adalah prioritas utama dalam proyek ini, dengan implementasi proteksi berlapis:

| Komponen | Mekanisme Keamanan | Fungsi |
| :--- | :--- | :--- |
| **Tripay Callback** | Validasi Signature HMAC SHA256 & IP Whitelist | Mencegah *callback* palsu dan *replay-attack*. |
| **`security.js`** | Proteksi Admin & Maintenance Mode | Memastikan hanya Admin yang dapat menjalankan perintah sensitif dan memblokir akses saat *maintenance*. |
| **`sanitizer.js`** | *Input Sanitization* & *HTML Escaping* | Mencegah serangan *injection* dan karakter berbahaya dari input pengguna. |
| **`limiter.js`** | *Rate Limiting* & *Cooldown* | Mencegah *spam* dan *abuse* sistem oleh pengguna. |
| **`db.js`** | *File Locking* | Mencegah korupsi data (*race condition*) saat operasi *read/write* JSON. |
| **`tripay.js`** | Proteksi Anti-Spoofing | Memastikan integritas data saat pembuatan dan pengecekan *invoice*. |
| **`stok.js`** | Anti-Duplicate & FIFO | Memastikan stok unik dan mekanisme pengambilan stok yang adil (*First-In, First-Out*). |

## Persyaratan Sistem

*   **Runtime:** Node.js (Versi terbaru disarankan)
*   **Framework:** Telegraf
*   **Database:** JSON (Tidak memerlukan MongoDB/SQL)
*   **Lingkungan:** Termux atau VPS (Linux)

## Instalasi dan Pengaturan

### 1. Kloning Repositori

```bash
git clone https://github.com/Hiura-AutoOrder/Hiura-AutoOrder.git
cd Hiura-AutoOrder
```

### 2. Konfigurasi

Buat file `.env` untuk menyimpan variabel lingkungan:

```
# .env file
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
ADMIN_IDS=123456789,987654321 # Pisahkan dengan koma

# Tripay Configuration
TRIPAY_API_KEY=YOUR_TRIPAY_API_KEY
TRIPAY_PRIVATE_KEY=YOUR_TRIPAY_PRIVATE_KEY
TRIPAY_MERCHANT_CODE=YOUR_TRIPAY_MERCHANT_CODE
TRIPAY_MODE=sandbox # atau production
TRIPAY_CALLBACK_URL=https://yourdomain.com/tripay/callback

# Security
RATE_LIMIT_SECONDS=5
MAINTENANCE_MODE=false
```

### 3. Instalasi Dependensi

```bash
npm install
```

### 4. Menjalankan Bot

Bot dapat dijalankan menggunakan Node.js:

```bash
node index.js
```

Untuk menjalankan bot secara persisten di VPS, disarankan menggunakan *process manager* seperti **PM2**:

```bash
npm install -g pm2
pm2 start index.js --name "Hiura-AutoOrder"
pm2 save
```

## Cara Menguji Callback Tripay (Lokal)

Untuk menguji fitur *callback* Tripay saat bot berjalan di lingkungan lokal (Termux/VPS tanpa domain publik), Anda dapat menggunakan layanan *tunneling* seperti **Cloudflared** atau **Ngrok**.

### Menggunakan Cloudflared

1.  **Instalasi Cloudflared:** Ikuti panduan resmi Cloudflare untuk instalasi.
2.  **Jalankan Tunnel:** Asumsikan bot Anda berjalan di port `3000` (sesuai `index.js`):
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
3.  **Dapatkan URL Publik:** Cloudflared akan memberikan URL publik (misalnya: `https://random-id.trycloudflare.com`).
4.  **Update Konfigurasi:** Ganti nilai `TRIPAY_CALLBACK_URL` di file `.env` Anda dengan URL publik yang baru, diikuti dengan path *callback*:
    ```
    TRIPAY_CALLBACK_URL=https://random-id.trycloudflare.com/tripay/callback
    ```
5.  **Simulasi Callback:** Anda dapat menggunakan *tool* seperti Postman atau cURL untuk mengirim *request* POST ke URL *callback* Anda dengan *payload* JSON yang sesuai.

### Contoh JSON Callback (PAID)

Berikut adalah contoh *payload* JSON yang dikirim Tripay saat pembayaran berhasil (`PAID`). Anda harus menghitung ulang `signature` menggunakan `TRIPAY_PRIVATE_KEY` Anda untuk pengujian yang valid.

```json
{
  "event": "payment_status",
  "callback_id": "cb_xxxxxxxxxxxx",
  "reference": "T12345",
  "merchant_ref": "INV-A1B2C3D4",
  "status": "PAID",
  "amount": 35000,
  "note": "Pembayaran berhasil",
  "paid_at": 1678886400,
  "payment_method": "QRIS",
  "is_closed_payment": 1
}
```

## Kontribusi

Kami menyambut kontribusi dari komunitas. Silakan buka *issue* atau kirim *Pull Request* untuk perbaikan *bug*, peningkatan fitur, atau saran keamanan.

---
*Dibuat dengan dedikasi pada kode yang bersih, modular, dan aman.*
