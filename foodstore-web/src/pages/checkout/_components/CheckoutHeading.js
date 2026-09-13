import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';

export default function CheckoutHeading({ steps, activeStep, goToStep, headingRef, isBusy }) {
    return (
        <>
            <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><Link to="/">Beranda</Link><StoreIcon name="chevron" size={12} /><Link to="/keranjang">Keranjang</Link><StoreIcon name="chevron" size={12} /><span aria-current="page">Checkout</span></nav>
            <div className="checkout-heading"><span className="checkout-eyebrow">TINGGAL SEDIKIT LAGI</span><h1>Selesaikan <em>pesananmu.</em></h1><p>Menu sudah dipilih. Sekarang, tentukan ke mana bahagianya diantar.</p></div>
            <nav className="checkout-steps" aria-label="Tahapan checkout">
                {steps.map((label, index) => <button key={label} onClick={() => goToStep(index)} disabled={isBusy || index > activeStep} aria-current={index === activeStep ? 'step' : undefined} className={index < activeStep ? 'is-done' : ''}><span>{index < activeStep ? <StoreIcon name="check" size={14} /> : `0${index + 1}`}</span>{label}</button>)}
            </nav>
            <p className="checkout-step-announcement" ref={headingRef} tabIndex="-1" aria-live="polite">Langkah {activeStep + 1} dari 3: {steps[activeStep]}</p>
        </>
    );
}
