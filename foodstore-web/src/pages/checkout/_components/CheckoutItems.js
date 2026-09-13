import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';
import OrderItems from './OrderItems';

export default function CheckoutItems(props) {
    return (
        <section className="checkout-card" aria-labelledby="checkout-items-title">
            <div className="checkout-card-heading"><div><h2 id="checkout-items-title">Pilihan untuk hari ini</h2><p>{props.quantity} porsi dari {props.items.length} menu pilihanmu.</p></div><Link className="checkout-text-link" to="/keranjang">Ubah keranjang</Link></div>
            <OrderItems {...props} />
            {props.unavailable && <p className="checkout-error" role="alert">Stok menu tidak mencukupi. Sesuaikan pilihanmu di keranjang.</p>}
            <div className="checkout-note"><StoreIcon name="dish" size={21} /><p>Sudah pas pilihannya? Lanjut pilih alamat pengiriman.</p></div>
        </section>
    );
}
