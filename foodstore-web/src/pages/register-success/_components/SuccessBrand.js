import React from 'react';
import StoreIcon from '../../../component/StoreIcon';

export default function SuccessBrand() {
    return (
        <section className="auth-brand-panel" aria-labelledby="success-brand-title">
            <div className="auth-brand-copy">
                <span className="auth-eyebrow"><span /> SEPORSI BAHAGIA, SETIAP HARI</span>
                <h2 id="success-brand-title">Awal yang baik,<br />lanjut <em>yang enak.</em></h2>
                <p>Selamat bergabung di FoodStore. Siap temukan makanan favorit dan nikmati momen kecil yang menyenangkan?</p>
            </div>
            <div className="auth-food-visual">
                <img src="/images/home/hero-burger.jpg" alt="Burger keju dengan selada segar dan kentang goreng di atas piring" width="1536" height="1024" />
                <div className="auth-food-note">
                    <span className="auth-note-icon"><StoreIcon name="heart" size={21} /></span>
                    <div><strong>Senang kamu di sini.</strong><span>Banyak rasa baru menanti untuk dicoba.</span></div>
                </div>
            </div>
            <div className="auth-brand-bottom"><StoreIcon name="dish" size={18} /> Cerita enakmu dimulai di FoodStore.</div>
        </section>
    );
}
