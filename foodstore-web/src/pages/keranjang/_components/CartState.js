import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';

export default function CartState({ status, reload }) {
    if (status === 'loading') return <div className="cart-state" role="status"><span className="cart-loading-icon"><span className="cart-spinner" /></span><h2>Menyiapkan keranjangmu</h2><p>Sebentar, kami ambil pilihan favoritmu.</p></div>;
    if (status === 'error') return <div className="cart-state" role="alert"><span className="cart-state-icon"><StoreIcon name="bag" size={35} /></span><h2>Keranjang belum bisa dimuat</h2><p>Periksa koneksimu, lalu coba lagi.</p><button className="cart-primary" onClick={reload}>Coba lagi <StoreIcon name="arrow" size={18} /></button></div>;
    return (
        <div className="cart-state cart-empty">
            <span className="cart-state-icon"><StoreIcon name="bag" size={38} /></span>
            <span className="cart-eyebrow">MASIH ADA RUANG UNTUK YANG ENAK</span>
            <h2>Keranjangmu masih <em>kosong.</em></h2>
            <p>Yuk, temukan makanan favorit dan tambahkan sedikit bahagia ke harimu.</p>
            <Link className="cart-primary" to="/">Jelajahi menu <StoreIcon name="arrow" size={18} /></Link>
        </div>
    );
}
