import React from 'react';
import StoreIcon from '../../../component/StoreIcon';
import OrderItems from './OrderItems';
import AddressDetails from './AddressDetails';

export default function CheckoutConfirmation({ selectedAddress, goToStep, isBusy, uncertain, ...items }) {
    return (
        <section className="checkout-card" aria-labelledby="checkout-confirm-title">
            <div className="checkout-card-heading"><div><h2 id="checkout-confirm-title">Semuanya sudah sesuai?</h2><p>Periksa alamat dan menu sebelum membuat pesanan.</p></div></div>
            <div className="checkout-confirm-address"><div className="checkout-section-title"><h3><StoreIcon name="pin" size={17} /> Alamat pengiriman</h3><button className="checkout-text-link" onClick={() => goToStep(1)} disabled={isBusy || uncertain}>Ubah alamat</button></div><AddressDetails address={selectedAddress} /></div>
            <div className="checkout-section-title checkout-items-label"><h3>Menu pesanan</h3><span>{items.quantity} porsi</span></div>
            <OrderItems {...items} />
            <div className="checkout-note"><StoreIcon name="shield" size={20} /><p>Setelah pesanan dibuat, lanjutkan pembayaran melalui halaman invoice.</p></div>
        </section>
    );
}
