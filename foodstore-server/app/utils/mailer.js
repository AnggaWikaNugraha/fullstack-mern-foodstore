const nodemailer = require('nodemailer');

// Konfigurasi transporter — pakai Gmail atau SMTP lain
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Gmail App Password (bukan password biasa)
    },
});

// ─── Template email order confirmation ───────────────────────────────────────

function orderConfirmationHTML({ order_number, full_name, items, sub_total, delivery_fee, total }) {
    const itemRows = items.map(item =>
        `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${item.qty}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">Rp ${item.price.toLocaleString('id-ID')}</td>
        </tr>`
    ).join('');

    return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#333">
        <div style="background:#c0392b;padding:20px 24px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">🍽️ FoodStore</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
            <p>Halo <b>${full_name}</b>,</p>
            <p>Order kamu berhasil dibuat! Berikut detailnya:</p>
            <p style="font-size:13px;color:#888">Order #${order_number}</p>

            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
                <thead>
                    <tr style="background:#f9f9f9">
                        <th style="padding:8px 12px;text-align:left">Produk</th>
                        <th style="padding:8px 12px;text-align:center">Qty</th>
                        <th style="padding:8px 12px;text-align:right">Harga</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>

            <div style="background:#fef9f9;border:1px solid #f5c6c6;border-radius:8px;padding:12px 16px;font-size:14px">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                    <span>Subtotal</span><span>Rp ${sub_total.toLocaleString('id-ID')}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                    <span>Ongkir</span><span>Rp ${delivery_fee.toLocaleString('id-ID')}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;color:#c0392b">
                    <span>Total</span><span>Rp ${total.toLocaleString('id-ID')}</span>
                </div>
            </div>

            <p style="margin-top:20px;font-size:13px;color:#888">
                Silakan lakukan pembayaran sesuai total di atas. Terima kasih telah berbelanja di FoodStore!
            </p>
        </div>
    </div>`;
}

// ─── Kirim email konfirmasi order ─────────────────────────────────────────────
// Fire-and-forget: tidak di-await, jadi tidak blok response checkout.
// Siap diganti dengan Bull queue job di production.

function sendOrderConfirmation({ to, order_number, full_name, items, sub_total, delivery_fee, total }) {
    const html = orderConfirmationHTML({ order_number, full_name, items, sub_total, delivery_fee, total });

    console.log(`[Mailer] Mencoba kirim email ke: ${to}, order #${order_number}`);

    transporter.sendMail({
        from: `"FoodStore" <${process.env.MAIL_USER}>`,
        to,
        subject: `✅ Order #${order_number} Berhasil Dibuat`,
        html,
    }).then(info => {
        console.log(`[Mailer] Email berhasil terkirim: ${info.messageId}`);
    }).catch(err => {
        console.error('[Mailer] Gagal kirim email:', err.message);
        console.error('[Mailer] Detail error:', err.responseCode, err.response);
    });
}

function sendVerificationEmail({ to, full_name, verification_link }) {
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#333">
        <div style="background:#c0392b;padding:20px 24px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">🍽️ FoodStore</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
            <p>Halo <b>${full_name}</b>,</p>
            <p>Terima kasih sudah mendaftar di FoodStore! Klik tombol di bawah untuk verifikasi akun kamu.</p>
            <div style="text-align:center;margin:28px 0">
                <a href="${verification_link}"
                   style="background:#c0392b;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
                    Verifikasi Akun
                </a>
            </div>
            <p style="font-size:13px;color:#888">Link berlaku selama 24 jam. Jika kamu tidak merasa mendaftar, abaikan email ini.</p>
            <p style="font-size:12px;color:#bbb;word-break:break-all">Atau buka link ini: ${verification_link}</p>
        </div>
    </div>`;

    return transporter.sendMail({
        from: `"FoodStore" <${process.env.MAIL_USER}>`,
        to,
        subject: '✅ Verifikasi Akun FoodStore',
        html,
    }).then(info => {
        console.log(`[Mailer] Verifikasi email terkirim ke: ${to} — ${info.messageId}`);
    }).catch(err => {
        console.error('[Mailer] Gagal kirim verifikasi email:', err.message);
    });
}

module.exports = { sendOrderConfirmation, sendVerificationEmail };
