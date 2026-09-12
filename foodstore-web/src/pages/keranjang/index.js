import React from 'react';
import useCartItems from './_hooks/useCartItems';
import useCartSelection from './_hooks/useCartSelection';
import useCartSummary from './_hooks/useCartSummary';
import CartHeading from './_components/CartHeading';
import CartItems from './_components/CartItems';
import CartSummary from './_components/CartSummary';
import CartState from './_components/CartState';
import './keranjang.css';

export default function Keranjang() {
    const cart = useCartItems();
    const selection = useCartSelection(cart.items, cart.updateItems);
    const summary = useCartSummary(selection.selectedItems, cart.isBusy);

    return (
        <main className="cart-page">
            <div className="cart-container">
                <CartHeading />
                {cart.status !== 'success' || !cart.items.length ? <CartState status={cart.status} reload={cart.reload} /> : (
                    <div className="cart-layout">
                        <CartItems {...cart} {...selection} />
                        <CartSummary {...summary} isBusy={cart.isBusy} />
                    </div>
                )}
                {cart.notice && <p className={`cart-notice ${cart.notice.error ? 'is-error' : ''}`} role={cart.notice.error ? 'alert' : 'status'}>{cart.notice.message}</p>}
                <footer className="cart-footer"><span>FoodStore<span className="cart-brand-dot">.</span></span><p>Seporsi bahagia, setiap hari.</p></footer>
            </div>
        </main>
    );
}
