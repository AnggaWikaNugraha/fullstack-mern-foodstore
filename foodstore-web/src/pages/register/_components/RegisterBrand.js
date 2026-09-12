import React from 'react';
import StoreIcon from '../../../component/StoreIcon';

export default function RegisterBrand() {
    return (
        <section className="auth-brand-panel" aria-labelledby="register-brand-title">
            <div className="auth-brand-copy">
                <span className="auth-eyebrow"><span /> SEPORSI BAHAGIA, SETIAP HARI</span>
                <h2 id="register-brand-title">Hari yang enak<br />dimulai <em>dari sini.</em></h2>
                <p>Satu akun untuk semua rasa yang kamu suka. Simpan favoritmu, pesan, dan nikmati setiap momennya.</p>
            </div>
            <div className="auth-food-visual">
                <img src="/images/home/hero-burger.jpg" alt="Burger keju dengan selada segar dan kentang goreng di atas piring" width="1536" height="1024" />
                <div className="auth-food-note">
                    <span className="auth-note-icon"><StoreIcon name="heart" size={21} /></span>
                    <div><strong>Favoritmu punya tempat.</strong><span>Simpan sekarang, pesan kapan saja.</span></div>
                </div>
            </div>
            <div className="auth-brand-bottom"><StoreIcon name="dish" size={18} /> Banyak pilihan, satu akun FoodStore.</div>
        </section>
    );
}
