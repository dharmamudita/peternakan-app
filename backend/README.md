# Peternakan App Backend

Backend API untuk Aplikasi Peternakan dengan fitur Manajemen, Marketplace, dan Edukasi.

## 🚀 Fitur

### 1. Manajemen Peternakan
- CRUD Peternakan
- Manajemen Hewan (sapi, kambing, ayam, dll)
- Catatan Kesehatan Hewan
- Statistik dan Dashboard

### 2. Marketplace
- CRUD Produk
- Keranjang Belanja
- Manajemen Pesanan
- Pencarian dan Filter Produk

### 3. Edukasi
- Kursus/Pelatihan
- Materi Edukasi (artikel, video, PDF)
- Tracking Progress Belajar
- Sistem Kuis

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── config/          # Konfigurasi (Firebase, constants)
│   ├── controllers/     # Controller untuk handle request
│   ├── middlewares/     # Middleware (auth, error, validation)
│   ├── models/          # Model untuk Firestore
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── .env                 # Environment variables
├── .env.example         # Example environment
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Teknologi

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **File Upload**: Multer

## ⚙️ Instalasi

1. Clone repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Konfigurasi Firebase:
   - Buat project di [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore, Authentication, dan Storage
   - Download service account key dari Project Settings > Service Accounts
   - Copy nilai-nilai ke file `.env`

4. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` dengan kredensial Firebase Anda:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email@project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

5. Jalankan server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |

### Farms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farms` | Get all farms |
| POST | `/api/farms` | Create farm |
| GET | `/api/farms/:id` | Get farm by ID |
| PUT | `/api/farms/:id` | Update farm |
| DELETE | `/api/farms/:id` | Delete farm |

### Animals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farms/:farmId/animals` | Get animals in farm |
| POST | `/api/farms/:farmId/animals` | Add animal |
| GET | `/api/animals/:id` | Get animal by ID |
| PUT | `/api/animals/:id` | Update animal |
| DELETE | `/api/animals/:id` | Delete animal |

### Products (Marketplace)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product by ID |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add to cart |
| PUT | `/api/cart/items/:productId` | Update cart item |
| DELETE | `/api/cart/items/:productId` | Remove from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/my` | Get my orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order by ID |
| PUT | `/api/orders/:id/status` | Update order status |

### Courses (Education)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| POST | `/api/courses` | Create course |
| GET | `/api/courses/:id` | Get course by ID |
| POST | `/api/courses/:id/enroll` | Enroll to course |

### Materials (Education)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials` | Get all materials |
| POST | `/api/materials` | Create material |
| GET | `/api/materials/:id` | Get material by ID |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload image |
| POST | `/api/upload/video` | Upload video |
| POST | `/api/upload/document` | Upload document |

## 🔐 Authentication

API menggunakan Firebase Authentication. Untuk mengakses protected endpoints, sertakan token di header:

```
Authorization: Bearer <firebase-id-token>
```

## 👥 User Roles

- `admin` - Full access
- `farmer` - Access to farm management
- `seller` - Access to marketplace (sell products)
- `buyer` - Access to marketplace (buy products)
- `instructor` - Access to education (create courses)
- `user` - Basic access

## 📝 License

ISC
