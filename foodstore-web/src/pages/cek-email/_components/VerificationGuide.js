import React from 'react';

export default function VerificationGuide() {
    return (
        <div className="verification-guide">
            <span className="verification-mail-icon" aria-hidden="true">
                <svg width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" />
                </svg>
            </span>
            <span className="auth-eyebrow">TINGGAL SATU LANGKAH LAGI</span>
            <h1 id="cek-email-title">Cek email <em>kamu.</em></h1>
            <p className="auth-intro">Aktifkan akun lewat link verifikasi di emailmu, lalu nikmati semua pilihan di FoodStore.</p>
            <ol className="verification-steps">
                <li><span aria-hidden="true">01</span><div><strong>Buka inbox emailmu</strong><p>Belum terlihat? Cek juga folder spam.</p></div></li>
                <li><span aria-hidden="true">02</span><div><strong>Klik link verifikasi</strong><p>Link berlaku selama 24 jam.</p></div></li>
                <li><span aria-hidden="true">03</span><div><strong>Masuk dan temukan favoritmu</strong><p>Gunakan akun yang sudah terverifikasi.</p></div></li>
            </ol>
        </div>
    );
}
