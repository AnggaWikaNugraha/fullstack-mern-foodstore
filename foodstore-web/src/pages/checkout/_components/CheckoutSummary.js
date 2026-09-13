import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';
import { formatRupiah } from '../../../utils/format-rupiah';

export default function CheckoutSummary({ quantity, subtotal, deliveryFee, total, selectedAddress, activeStep, actionLabel, canContinue, continueCheckout, isBusy, error, uncertain, historyTo }) {
    return (
        <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
            <div className="checkout-summary-card">
                <span className="checkout-eyebrow">SEDIKIT LAGI SIAP DIPESAN</span><h2 id="checkout-summary-title">Ringkasan pesanan</h2>
                <div className="checkout-summary-address"><StoreIcon name="pin" size={18} /><span>{selectedAddress ? <>Kirim ke <strong>{selectedAddress.nama}</strong></> : 'Alamat dipilih di langkah berikutnya'}</span></div>
                <dl className="checkout-breakdown"><div><dt>Subtotal ({quantity} porsi)</dt><dd>{formatRupiah(subtotal)}</dd></div><div><dt>Ongkos kirim</dt><dd>{formatRupiah(deliveryFee)}</dd></div><div className="checkout-total"><dt>Total pembayaran</dt><dd>{formatRupiah(total)}</dd></div></dl>
                {error && <div className="checkout-error" role="alert"><p>{error}</p>{uncertain && <Link to={historyTo}>Lihat riwayat belanja</Link>}</div>}
                <button className="checkout-primary" onClick={continueCheckout} disabled={!canContinue}>{isBusy ? <span className="checkout-spinner" /> : null}{actionLabel}{!isBusy && <StoreIcon name="arrow" size={18} />}</button>
                <p className="checkout-summary-hint">{activeStep === 0 ? 'Berikutnya: tentukan alamat pengiriman.' : activeStep === 1 ? 'Pilih alamat untuk meninjau pesanan.' : 'Pembayaran dilakukan setelah pesanan dibuat.'}</p>
            </div>
            <div className="checkout-warm-note"><StoreIcon name="heart" size={22} /><div><strong>Sebentar lagi, waktunya menikmati.</strong><p>Terima kasih sudah memilih FoodStore.</p></div></div>
        </aside>
    );
}
