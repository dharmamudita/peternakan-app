/**
 * Mailer Utility
 * Helper untuk mengirim email menggunakan Nodemailer
 */

const nodemailer = require('nodemailer');

// Konfigurasi Transporter (Pengirim Email)
// Menggunakan Gmail sebagai default. User harus mengisi EMAIL_USER dan EMAIL_PASS di .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Email pengirim (contoh: bisnis.anda@gmail.com)
        pass: process.env.EMAIL_PASS, // App Password Gmail (Bukan password login biasa)
    },
});

/**
 * Mengirim Email OTP untuk Verifikasi Seller
 * @param {string} toEmail - Email penerima
 * @param {string} otpCode - Kode OTP 4 digit
 * @param {string} name - Nama user (opsional)
 */
const sendSellerOtp = async (toEmail, otpCode, name = 'Partner') => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ SMTP Config belum lengkap di .env. Email tidak terkirim via server, cek Console Log.');
            // Fallback ke console log agar dev tetap jalan
            console.log(`[MAILER FALLBACK] To: ${toEmail} | OTP: ${otpCode}`);
            return false;
        }

        const mailOptions = {
            from: `"Tim Peternakan App" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Kode Verifikasi Pendaftaran Penjual',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #2F9E44; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Verifikasi Toko</h1>
                </div>
                <div style="border: 1px solid #ddd; padding: 30px; border-radius: 0 0 10px 10px; background-color: #ffffff;">
                    <p>Halo <strong>${name}</strong>,</p>
                    <p>Terima kasih telah mendaftar sebagai Penjual di aplikasi kami. Untuk memastikan keamanan akun Anda, silakan masukkan kode verifikasi berikut:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2F9E44; background: #f0fdf4; padding: 15px 30px; border-radius: 10px; border: 2px dashed #2F9E44;">
                            ${otpCode}
                        </span>
                    </div>

                    <p style="text-align: center; color: #666; font-size: 14px;">Kode ini hanya berlaku selama 10 menit.</p>
                    <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
                    <br/>
                    <p>Salam hangat,<br/>Tim Aplikasi Peternakan</p>
                </div>
            </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email OTP terkirim ke ${toEmail}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Gagal mengirim email:', error);
        throw new Error('Gagal mengirim email verifikasi. Pastikan konfigurasi server email benar.');
    }
};

module.exports = {
    sendSellerOtp,
};
