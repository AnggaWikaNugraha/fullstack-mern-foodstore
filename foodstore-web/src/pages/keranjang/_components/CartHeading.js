import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';

export default function CartHeading() {
    return (
        <>
            <nav className="cart-breadcrumb" aria-label="Breadcrumb"><Link to="/">Beranda</Link><StoreIcon name="chevron" size={12} /><span aria-current="page">Keranjang</span></nav>
            <div className="cart-heading">
                <div><span className="cart-eyebrow">SELANGKAH LAGI MENUJU BAHAGIA</span><h1>Keranjang <em>pilihanmu.</em></h1><p>Cek lagi menu favoritmu. Sudah siap untuk dinikmati?</p></div>
                <Link className="cart-back" to="/"><StoreIcon name="plus" size={16} /> Tambah menu</Link>
            </div>
            <ol className="cart-progress" aria-label="Tahapan pemesanan">
                <li aria-current="step"><span>01</span> Keranjang</li><li><span>02</span> Checkout</li><li><span>03</span> Pembayaran</li>
            </ol>
        </>
    );
}
