import React from 'react';
import StoreIcon from '../../../component/StoreIcon';
import { formatRupiah } from '../../../utils/format-rupiah';

export default function CartSummary({ quantity, subtotal, deliveryFee, total, canCheckout, hint, checkout, isBusy }) {
    return (
        <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <div className="cart-summary-card">
                <span className="cart-eyebrow">PILIHAN ENAK HARI INI</span>
                <h2 id="cart-summary-title">Ringkasan belanja</h2>
                <dl className="cart-breakdown">
                    <div><dt>Subtotal ({quantity} porsi)</dt><dd>{formatRupiah(subtotal)}</dd></div>
                    <div><dt>Ongkos kirim</dt><dd>{quantity ? formatRupiah(deliveryFee) : '—'}</dd></div>
                    <div className="cart-grand-total"><dt>Total pembayaran</dt><dd data-testid="cart-total">{formatRupiah(total)}</dd></div>
                </dl>
                <button className="cart-primary" onClick={checkout} disabled={!canCheckout}>
                    {isBusy ? <><span className="cart-spinner" /> Menyimpan...</> : <>Lanjut checkout <StoreIcon name="arrow" size={18} /></>}
                </button>
                {hint && <p className="cart-summary-hint">{hint}</p>}
                <p className="cart-payment-note">Cek alamat dan detail pesanan di langkah berikutnya.</p>
            </div>
            <div className="cart-summary-note"><StoreIcon name="heart" size={22} /><div><strong>Dipilih dengan hati.</strong><p>Seporsi favorit untuk melengkapi harimu.</p></div></div>
        </aside>
    );
}
