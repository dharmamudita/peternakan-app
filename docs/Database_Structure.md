# Struktur Database - Sistem Manajemen Ternak
## Cloud Firestore (NoSQL Database)

---

## 1. Koleksi: `users`
Menyimpan data pengguna aplikasi.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen (auto-generated) |
| uid | string | Firebase Auth UID |
| email | string | Email pengguna |
| displayName | string | Nama tampilan |
| phoneNumber | string | Nomor telepon |
| photoURL | string | URL foto profil |
| role | string | Role: 'user', 'admin', 'seller' |
| address | object | Objek alamat (street, city, province, postalCode, country) |
| farmId | string | ID peternakan (jika peternak) |
| isVerified | boolean | Status verifikasi akun |
| isActive | boolean | Status aktif akun |
| sellerVerification | object | Data verifikasi penjual |
| createdAt | timestamp | Waktu dibuat |
| updatedAt | timestamp | Waktu diperbarui |
| lastLoginAt | timestamp | Waktu login terakhir |

---

## 2. Koleksi: `animals`
Menyimpan data hewan ternak.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| farmId | string | ID pemilik/peternak (userId) |
| tagNumber | string | Nomor identifikasi hewan |
| name | string | Nama hewan |
| type | string | Jenis: 'cow', 'goat', 'sheep', 'chicken', 'duck', 'other' |
| breed | string | Ras/jenis khusus |
| gender | string | Jenis kelamin: 'male', 'female', 'unknown' |
| birthDate | timestamp | Tanggal lahir |
| weight | number | Berat (kg) |
| color | string | Warna |
| images | array | Array URL gambar |
| parentInfo | object | Info induk (fatherId, motherId, fatherTagNumber, motherTagNumber) |
| healthStatus | string | Status kesehatan: 'healthy', 'sick', 'pregnant', 'recovering' |
| lastHealthCheck | timestamp | Pemeriksaan kesehatan terakhir |
| vaccinations | array | Riwayat vaksinasi |
| purchaseInfo | object | Info pembelian (purchaseDate, purchasePrice, supplier) |
| notes | string | Catatan tambahan |
| isForSale | boolean | Dijual atau tidak |
| salePrice | number | Harga jual |
| isActive | boolean | Status aktif |
| createdAt | timestamp | Waktu dibuat |
| updatedAt | timestamp | Waktu diperbarui |

---

## 3. Koleksi: `products`
Menyimpan data produk marketplace.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| sellerId | string | ID penjual (userId) |
| farmId | string | ID peternakan |
| categoryId | string | ID kategori produk |
| name | string | Nama produk |
| slug | string | Slug URL |
| description | string | Deskripsi lengkap |
| shortDescription | string | Deskripsi singkat |
| images | array | Array URL gambar produk |
| price | number | Harga normal |
| salePrice | number | Harga diskon (opsional) |
| currency | string | Mata uang (IDR) |
| stock | number | Jumlah stok |
| sku | string | Kode SKU |
| unit | string | Satuan (pcs, kg, ekor) |
| minOrder | number | Minimal order |
| weight | number | Berat (gram) |
| dimensions | object | Dimensi (length, width, height) |
| specifications | object | Spesifikasi tambahan |
| tags | array | Tag produk |
| status | string | Status: 'draft', 'active', 'inactive', 'out_of_stock' |
| isFeatured | boolean | Produk unggulan |
| rating | number | Rating rata-rata |
| totalReviews | number | Jumlah review |
| totalSold | number | Total terjual |
| views | number | Jumlah dilihat |
| createdAt | timestamp | Waktu dibuat |
| updatedAt | timestamp | Waktu diperbarui |

---

## 4. Koleksi: `orders`
Menyimpan data pesanan.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| buyerId | string | ID pembeli |
| sellerId | string | ID penjual |
| shopId | string | ID toko |
| items | array | Array item pesanan [{productId, name, price, quantity, image}] |
| totalAmount | number | Total harga |
| shippingAddress | object | Alamat pengiriman |
| shippingMethod | string | Metode pengiriman |
| shippingCost | number | Biaya pengiriman |
| trackingNumber | string | Nomor resi |
| status | string | Status: 'pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled' |
| buyerName | string | Nama pembeli |
| buyerPhone | string | No HP pembeli |
| notes | string | Catatan pesanan |
| review | object | Review pesanan (rating, comment, createdAt) |
| statusHistory | array | Riwayat status [{status, timestamp, note}] |
| createdAt | timestamp | Waktu dibuat |
| updatedAt | timestamp | Waktu diperbarui |
| paidAt | timestamp | Waktu pembayaran |
| shippedAt | timestamp | Waktu pengiriman |
| completedAt | timestamp | Waktu selesai |

---

## 5. Koleksi: `addresses`
Menyimpan alamat pengiriman pengguna.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| userId | string | ID pengguna |
| label | string | Label alamat (Rumah, Kantor, dll) |
| recipientName | string | Nama penerima |
| phoneNumber | string | No HP penerima |
| fullAddress | string | Alamat lengkap |
| city | string | Kota |
| province | string | Provinsi |
| postalCode | string | Kode pos |
| note | string | Catatan (patokan) |
| latitude | number | Koordinat latitude |
| longitude | number | Koordinat longitude |
| isDefault | boolean | Alamat utama |
| createdAt | timestamp | Waktu dibuat |
| updatedAt | timestamp | Waktu diperbarui |

---

## 6. Koleksi: `notifications`
Menyimpan notifikasi pengguna.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| userId | string | ID pengguna (untuk notifikasi personal) |
| type | string | Tipe: 'personal', 'broadcast' |
| title | string | Judul notifikasi |
| message | string | Isi pesan |
| data | object | Data tambahan (orderId, productId, dll) |
| isRead | boolean | Status sudah dibaca (untuk personal) |
| readBy | array | Array userId yang sudah baca (untuk broadcast) |
| createdAt | timestamp | Waktu dibuat |

---

## 7. Koleksi: `courses`
Menyimpan data kursus edukasi.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| instructorId | string | ID instruktur |
| title | string | Judul kursus |
| slug | string | Slug URL |
| description | string | Deskripsi lengkap |
| shortDescription | string | Deskripsi singkat |
| thumbnail | string | URL thumbnail |
| coverImage | string | URL cover image |
| category | string | Kategori kursus |
| tags | array | Tag kursus |
| difficulty | string | Tingkat: 'beginner', 'intermediate', 'advanced' |
| duration | number | Total durasi (menit) |
| totalModules | number | Jumlah modul |
| totalLessons | number | Jumlah pelajaran |
| requirements | array | Persyaratan |
| whatYouWillLearn | array | Yang akan dipelajari |
| targetAudience | array | Target audiens |
| price | number | Harga kursus |
| isFree | boolean | Gratis atau tidak |
| status | string | Status: 'draft', 'published', 'archived' |
| rating | number | Rating rata-rata |
| totalReviews | number | Jumlah review |
| totalEnrollments | number | Jumlah pendaftar |
| isFeatured | boolean | Kursus unggulan |
| hasCertificate | boolean | Ada sertifikat |
| language | string | Bahasa |
| lessons | array | Array pelajaran |
| quiz | array | Array kuis |
| publishedAt | timestamp | Waktu dipublikasi |
| createdAt | timestamp | Waktu dibuat |
| updatedAt | timestamp | Waktu diperbarui |

---

## 8. Koleksi: `shops`
Menyimpan data toko penjual.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| userId | string | ID pemilik toko |
| name | string | Nama toko |
| description | string | Deskripsi toko |
| address | string | Alamat toko |
| phoneNumber | string | No HP toko |
| nik | string | NIK pemilik (untuk verifikasi) |
| ktpImageUrl | string | URL foto KTP |
| bankAccount | object | Info rekening (bank, number, holder) |
| status | string | Status: 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED' |
| rating | number | Rating toko |
| createdAt | timestamp | Waktu dibuat |
| updatedAt | timestamp | Waktu diperbarui |

---

## 9. Koleksi: `reviews`
Menyimpan review produk dan toko.

| Field | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | string | ID dokumen |
| orderId | string | ID pesanan |
| productId | string | ID produk |
| sellerId | string | ID penjual |
| buyerId | string | ID pembeli |
| buyerName | string | Nama pembeli |
| rating | number | Rating (1-5) |
| comment | string | Komentar review |
| createdAt | timestamp | Waktu dibuat |

---

## Diagram Relasi Antar Koleksi

```
users ────────┬──────── animals (farmId = userId)
              │
              ├──────── addresses (userId)
              │
              ├──────── notifications (userId)
              │
              ├──────── shops (userId)
              │
              └──────── orders (buyerId / sellerId)
                            │
                            └──── products (productId dalam items)
                                      │
                                      └──── reviews (productId, sellerId)
                                      
courses ──── lessons (embedded array)
         └── quiz (embedded array)
```
