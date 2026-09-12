import React from 'react';
import StoreIcon from '../../../component/StoreIcon';

export default function VerificationBrand() {
    return (
        <section className="auth-brand-panel" aria-labelledby="verification-brand-title">
            <div className="auth-brand-copy">
                <span className="auth-eyebrow"><span /> SEPORSI BAHAGIA, SETIAP HARI</span>
                <h2 id="verification-brand-title">Favoritmu<br />sudah <em>menunggu.</em></h2>
                <p>Aktifkan akunmu, lalu mulai jelajahi pilihan makanan untuk menemani harimu.</p>
            </div>
            <div className="auth-food-visual">
                <img src="/images/home/hero-burger.jpg" alt="Burger keju dengan selada segar dan kentang goreng di atas piring" width="1536" height="1024" />
                <div className="auth-food-note">
                    <span className="auth-note-icon"><StoreIcon name="check" size={21} /></span>
                    <div><strong>Satu langkah lagi.</strong><span>Verifikasi email, lalu pilih menu favorit.</span></div>
                </div>
            </div>
            <div className="auth-brand-bottom"><StoreIcon name="dish" size={18} /> Siap untuk cerita enak berikutnya?</div>
        </section>
    );
}
