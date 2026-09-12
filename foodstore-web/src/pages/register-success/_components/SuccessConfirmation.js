import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';

export default function SuccessConfirmation({ email, loginTo, verificationTo }) {
    return (
        <div className="success-confirmation">
            <div className="success-check" aria-hidden="true"><StoreIcon name="check" size={33} /></div>
            <span className="auth-eyebrow">SELAMAT BERGABUNG</span>
            <h1 id="register-success-title">Akunmu berhasil <em>dibuat.</em></h1>
            <p className="auth-intro">Satu langkah lagi sebelum mulai memesan. Verifikasi emailmu untuk mengaktifkan akun FoodStore.</p>

            <div className="success-email-note">
                <span className="success-email-icon" aria-hidden="true">
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" />
                    </svg>
                </span>
                <div>
                    <h2>Cek email verifikasimu</h2>
                    {email ? <p>Link verifikasi dikirim ke <strong className="success-email-address">{email}</strong></p>
                        : <p>Buka email yang kamu gunakan saat mendaftar.</p>}
                    <p>Klik link di inbox atau folder spam. Link berlaku selama 24 jam.</p>
                </div>
            </div>

            <Link className="auth-submit success-login" to={loginTo}>
                Sudah verifikasi? Masuk sekarang <StoreIcon name="arrow" size={18} />
            </Link>
            <p className="auth-register">Belum menerima email? <Link to={verificationTo}>Kirim ulang link</Link></p>
            <div className="success-note"><StoreIcon name="shield" size={16} /><span>Verifikasi email membantu menjaga akunmu.</span></div>
        </div>
    );
}
