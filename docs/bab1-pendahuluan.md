# Laporan Magang
## BAB I - PENDAHULUAN

---

### 1.1 Latar Belakang

Magang merupakan salah satu bagian penting dalam kurikulum pendidikan tinggi yang memberikan kesempatan kepada mahasiswa untuk memperoleh pengalaman nyata di dunia kerja. Melalui magang, mahasiswa dapat mengaplikasikan teori dan pengetahuan yang diperoleh selama perkuliahan ke dalam praktik secara langsung, sehingga terjadi keterhubungan antara aspek akademis dengan kebutuhan industri maupun instansi profesional. Selain itu, kegiatan magang juga mendorong pengembangan keterampilan teknis (*hard skills*) dan keterampilan interpersonal serta profesional (*soft skills*) yang sangat dibutuhkan di dunia kerja yang dinamis.

Kegiatan magang yang dilaksanakan oleh penulis bersama tim bertujuan untuk mengimplementasikan ilmu yang diperoleh selama perkuliahan melalui keterlibatan langsung dalam dunia kerja. Pada kesempatan ini, penulis ditempatkan di PT Microdata Indonesia. PT Microdata Indonesia memberikan kepercayaan kepada mahasiswa magang untuk mengerjakan proyek pengembangan aplikasi dan *web service* yang berfokus pada sektor peternakan. Proyek tersebut dikembangkan untuk salah satu mitra perusahaan sebagai solusi digital terintegrasi bagi pelaku usaha peternakan. Kebutuhan akan teknologi informasi yang semakin tinggi di sektor agrikultur dan peternakan menjadi dasar utama dari proyek ini, dengan fokus pada pengelolaan data ternak, transaksi perdagangan, serta akses edukasi yang lebih efisien, akurat, dan transparan.

Pengelolaan usaha peternakan di Indonesia, khususnya bagi peternak skala kecil hingga menengah, masih banyak dilakukan secara manual. Pencatatan data hewan ternak, pemantauan kesehatan, jadwal pakan, hingga penjualan produk masih mengandalkan catatan kertas atau *spreadsheet* sederhana. Kondisi ini menyebabkan berbagai masalah, termasuk risiko kehilangan data, pencatatan yang tidak terstruktur, akses informasi yang terbatas, serta kesulitan dalam menjangkau pasar yang lebih luas. Selain itu, minimnya akses terhadap pengetahuan dan pelatihan modern tentang praktik peternakan yang baik turut menghambat peningkatan produktivitas dan kesejahteraan peternak.

Sebagai solusi atas permasalahan tersebut, tim magang mengembangkan Aplikasi Peternakan sebagai *platform* digital terintegrasi yang mencakup tiga modul utama: Manajemen Peternakan, *Marketplace*, dan Edukasi. Proyek ini dibangun menggunakan *framework* React Native dengan Expo untuk pengembangan aplikasi *mobile* dan *web* secara *cross-platform*, serta Express.js yang terintegrasi dengan Firebase (Firestore dan Authentication) sebagai *backend* dan layanan API untuk aplikasi *mobile*. Untuk pengembangan sisi *web*, tim menggunakan PostgreSQL sebagai *database* relasional yang dikelola melalui pgAdmin4, memberikan struktur data yang terorganisir dan mendukung query yang kompleks. React Native memiliki kelebihan dalam hal efisiensi pengembangan lintas *platform*, performa yang mendekati aplikasi *native*, dan ekosistem pustaka yang lengkap. Firebase dipilih karena kemampuannya dalam menyediakan *database* NoSQL yang fleksibel, autentikasi yang aman, serta sinkronisasi data secara *real-time*. Selain itu, proyek ini juga memanfaatkan Cloudinary untuk manajemen media gambar dan Nodemailer untuk layanan notifikasi *email*.

Kegiatan magang ini dilaksanakan selama empat bulan, terhitung sejak 03 November 2025 hingga 03 Februari 2026. Dalam pelaksanaannya, penulis ditempatkan di Divisi *Software Engineer* dan dilibatkan dalam proyek pengembangan Aplikasi Peternakan. Dalam proyek ini, penulis berkontribusi pada tahap perancangan, pengembangan, serta penyempurnaan sistem agar sesuai dengan kebutuhan pengguna akhir.

Dengan adanya sistem ini, diharapkan pengelolaan usaha peternakan dapat dilakukan dengan lebih terstruktur, transparan, dan terpantau setiap saat. Para peternak dapat mencatat data hewan ternak secara digital, memantau kesehatan ternak, menjual produk melalui *marketplace* terintegrasi, serta mengakses materi edukasi untuk meningkatkan pengetahuan dan keterampilan mereka. Selain itu, penerapan teknologi ini juga merupakan bentuk kontribusi nyata dalam mendukung transformasi digital di sektor peternakan, sekaligus menjadi pengalaman langsung bagi mahasiswa dalam menerapkan keilmuan yang telah diperoleh selama perkuliahan.

---

### 1.2 Tujuan

Tujuan dari program magang yang diikuti oleh penulis di PT Microdata Indonesia, antara lain:

1. Mengaplikasikan pengetahuan dan keterampilan yang diperoleh selama perkuliahan dalam pengembangan aplikasi *mobile* dan *web service* di PT Microdata Indonesia, khususnya dalam membangun *platform* digital terintegrasi untuk sektor peternakan.

2. Memperoleh pemahaman mengenai proses kerja di bidang teknologi informasi, khususnya pada pengembangan aplikasi berbasis React Native dan Express.js dengan arsitektur *client-server* modern yang memanfaatkan layanan *cloud* seperti Firebase serta *database* relasional PostgreSQL.

3. Mengasah kemampuan profesional melalui peningkatan keterampilan teknis (*hard skills*) dalam pengembangan *frontend* dan *backend*, serta mengembangkan keterampilan lunak (*soft skills*) seperti komunikasi efektif, kolaborasi tim, kedisiplinan, manajemen waktu, dan kemampuan pemecahan masalah (*problem solving*).

4. Memahami siklus pengembangan perangkat lunak secara menyeluruh, mulai dari tahap analisis kebutuhan, perancangan arsitektur sistem, implementasi fitur, pengujian, hingga penyempurnaan produk berdasarkan umpan balik.

5. Memberikan kontribusi nyata dalam mendukung transformasi digital di sektor peternakan Indonesia melalui pembangunan Aplikasi Peternakan yang mencakup modul manajemen ternak, *marketplace*, dan edukasi bagi para peternak.

---

### 1.3 Manfaat

Manfaat yang didapat setelah pelaksanaan magang antara lain:

1. Menambah pengalaman dalam membuat aplikasi *mobile* dan *web*, khususnya menggunakan React Native dengan Expo untuk tampilan *frontend* lintas *platform* (Android, iOS, dan Web), serta Express.js yang terintegrasi dengan Firebase dan PostgreSQL sebagai *backend* dan layanan API.

2. Mampu mengatasi masalah nyata yang dihadapi peternak, seperti pengelolaan data ternak yang masih dilakukan secara manual, keterbatasan akses pasar, serta minimnya sumber edukasi tentang praktik peternakan yang baik.

3. Melatih kemampuan menganalisis kebutuhan pengguna, kemudian merancang arsitektur sistem dan membangun solusi teknologi yang tepat guna sesuai dengan permasalahan yang dihadapi.

4. Belajar kerja sama tim dalam lingkungan profesional, berbagi tugas dan tanggung jawab dengan rekan tim agar proyek dapat diselesaikan sesuai target waktu dan standar kualitas yang ditetapkan.

5. Memperoleh pengalaman langsung dalam menggunakan *tools* pengembangan modern seperti Visual Studio Code, Git untuk *version control*, Postman untuk pengujian API, pgAdmin4 untuk manajemen *database* PostgreSQL, serta Firebase Console untuk manajemen *database* NoSQL dan autentikasi.

---
