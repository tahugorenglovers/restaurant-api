# Restaurant Delivery API
# Kelas Backend Basic Naufal
# Aldin Aimar Massad - 2410511110
REST API untuk restoran dengan order delivery. Stack: **Node.js + Express + MongoDB (Mongoose)**.

## Fitur
- CRUD menu (tulis hanya admin), dengan filter, pencarian teks, sort, dan pagination
- Struktur Folder Modular: Kode program sudah di bagi ke berapa folder.
- Asynchronous + HTTP Status code saat request dengan postman
- Penyimpanan data dengan MongoDB
- Order delivery: harga dihitung server dari database (anti-manipulasi), snapshot nama/harga item, ongkir, riwayat status
- Alur status ketat: `pending → confirmed → preparing → out_for_delivery → delivered` (batal hanya dari `pending`/`confirmed`)
- Customer hanya bisa melihat order miliknya; admin melihat semua + statistik
- Validasi input, error handler terpusat, helmet, CORS, rate limiting, graceful shutdown
- Autentikasi JWT (register, login, profil) dengan role `customer` & `admin`

## Menjalankan
```bash
npm install
cp .env.example .env        # lalu edit JWT_SECRET & MONGODB_URI
npm run seed                # (opsional) isi data contoh + akun admin/customer
npm run dev                 # atau: npm start
```
MongoDB lokal harus berjalan, atau gunakan connection string MongoDB Atlas di `MONGODB_URI`.

Akun hasil seed: `admin@resto.com / admin123` dan `budi@mail.com / budi123`.

## Endpoint
| Method | Path | Akses | Keterangan |
|---|---|---|---|
| GET | /health | publik | cek server |
| POST | /api/auth/register | publik | daftar (selalu role customer) |
| POST | /api/auth/login | publik | login, dapat token |
| GET | /api/auth/me | login | profil sendiri |
| GET | /api/menu | publik | query: `category, search, available, minPrice, maxPrice, sort, page, limit` |
| GET | /api/menu/:id | publik | detail menu |
| POST | /api/menu | admin | tambah menu |
| PATCH | /api/menu/:id | admin | ubah menu |
| DELETE | /api/menu/:id | admin | hapus menu |
| POST | /api/orders | login | buat order |
| GET | /api/orders | login | customer: miliknya; admin: semua (`?status=`) |
| GET | /api/orders/:id | login | detail order |
| PATCH | /api/orders/:id/cancel | login | batalkan order |
| PATCH | /api/orders/:id/status | admin | ubah status order |
| GET | /api/orders/stats/summary | admin | ringkasan order & pendapatan |

Header autentikasi: `Authorization: Bearer <token>`

## Contoh penggunaan (curl)
```bash
# Login
curl -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"budi@mail.com","password":"budi123"}'

# Lihat menu
curl "localhost:3000/api/menu?category=makanan&sort=price"

# Buat order (ganti <TOKEN> dan <MENU_ID>)
curl -X POST localhost:3000/api/orders -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" -d '{
    "items": [{"menuItem":"<MENU_ID>","quantity":2,"notes":"Tidak pedas"}],
    "deliveryAddress": {"street":"Jl. Sudirman No. 1","city":"Jakarta","postalCode":"10220"},
    "phone": "081211111111",
    "paymentMethod": "transfer"
  }'

# Admin ubah status
curl -X PATCH localhost:3000/api/orders/<ORDER_ID>/status -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" -d '{"status":"confirmed"}'
```

## Struktur
```
server.js            entry point + graceful shutdown
src/app.js           konfigurasi Express & middleware
src/config/db.js     koneksi MongoDB
src/models/          User, MenuItem, Order
src/controllers/     logika bisnis
src/routes/          definisi rute + validasi
src/middleware/      auth, validasi, error handler
src/seed.js          data contoh
```
