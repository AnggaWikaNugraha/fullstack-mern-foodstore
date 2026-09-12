import React from 'react';
import StoreIcon from '../../../component/StoreIcon';

export default function LoginBrand() {
    return (
        <section className="auth-brand-panel" aria-labelledby="login-brand-title">
            <div className="auth-brand-copy">
                <span className="auth-eyebrow"><span /> SEPORSI BAHAGIA, SETIAP HARI</span>
                <h2 id="login-brand-title">Rasa favoritmu,<br />tinggal <em>selangkah lagi.</em></h2>
                <p>Dari makanan yang bikin kenyang sampai camilan teman santai. Semuanya ada di sini.</p>
            </div>
            <div className="auth-food-visual">
                <img src="/images/home/hero-burger.jpg" alt="Burger keju dengan selada segar dan kentang goreng di atas piring" width="1536" height="1024" />
                <div className="auth-food-note">
                    <span className="auth-note-icon"><StoreIcon name="heart" size={21} /></span>
                    <div><strong>Yang enak, selalu dekat.</strong><span>Temukan favorit untuk setiap suasana.</span></div>
                </div>
            </div>
            <div className="auth-brand-bottom"><StoreIcon name="dish" size={18} /> Pilih menunya. Nikmati momennya.</div>
        </section>
    );
}
