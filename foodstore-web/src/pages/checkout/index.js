import React from 'react';
import useCheckoutItems from './_hooks/useCheckoutItems';
import useCheckoutAddress from './_hooks/useCheckoutAddress';
import useCheckoutConfirmation from './_hooks/useCheckoutConfirmation';
import useCheckoutSteps from './_hooks/useCheckoutSteps';
import CheckoutHeading from './_components/CheckoutHeading';
import CheckoutItems from './_components/CheckoutItems';
import CheckoutAddress from './_components/CheckoutAddress';
import CheckoutConfirmation from './_components/CheckoutConfirmation';
import CheckoutSummary from './_components/CheckoutSummary';
import CheckoutState from './_components/CheckoutState';
import './checkout.css';

export default function Checkout() {
    const items = useCheckoutItems();
    const address = useCheckoutAddress();
    const confirmation = useCheckoutConfirmation({ itemsReady: items.ready, addressReady: address.ready, selectedAddress: address.selectedAddress, deliveryFee: items.deliveryFee });
    const steps = useCheckoutSteps({ itemsReady: items.ready, addressReady: address.ready, ...confirmation });

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                <CheckoutHeading {...steps} isBusy={confirmation.isBusy || confirmation.uncertain} />
                {items.status !== 'success' || !items.items.length ? <CheckoutState {...items} /> : (
                    <div className="checkout-layout">
                        <div className="checkout-main">
                            {steps.activeStep === 0 && <CheckoutItems {...items} />}
                            {steps.activeStep === 1 && <CheckoutAddress {...address} isBusy={confirmation.isBusy} />}
                            {steps.activeStep === 2 && <CheckoutConfirmation {...items} {...address} {...confirmation} goToStep={steps.goToStep} />}
                        </div>
                        <CheckoutSummary {...items} {...steps} {...confirmation} selectedAddress={address.selectedAddress} />
                    </div>
                )}
                <footer className="checkout-footer"><strong>FoodStore<span>.</span></strong><p>Seporsi bahagia, setiap hari.</p></footer>
            </div>
        </main>
    );
}
