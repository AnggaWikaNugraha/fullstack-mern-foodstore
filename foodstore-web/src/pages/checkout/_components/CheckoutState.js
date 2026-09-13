import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';

export default function CheckoutState({ status, retry }) {
    if (status === 'loading') return <div className="checkout-state" role="status"><span className="checkout-spinner" /><h2>Menyiapkan pesananmu</h2><p>Sebentar, kami ambil menu pilihanmu.</p></div>;
    if (status === 'error') return <div className="checkout-state" role="alert"><h2>Pesanan belum bisa dimuat</h2><p>Periksa koneksimu, lalu coba lagi.</p><button className="checkout-primary" onClick={retry}>Coba lagi</button></div>;
    return <div className="checkout-state"><span className="checkout-state-icon"><StoreIcon name="bag" size={32} /></span><h2>Belum ada menu yang dipilih</h2><p>Pilih menu di keranjang untuk melanjutkan checkout.</p><Link className="checkout-primary" to="/keranjang">Kembali ke keranjang <StoreIcon name="arrow" size={18} /></Link></div>;
}
