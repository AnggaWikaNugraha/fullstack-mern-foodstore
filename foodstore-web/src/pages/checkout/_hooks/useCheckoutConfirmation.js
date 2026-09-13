import { useRef, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createOrder } from '../../../api/orders';
import { saveCart, cartState } from '../../../api/cart';
import { setItems } from '../../../features/Cart/actions';
import { CART_SAVING, CART_SAVED } from '../../../app/constants';

export default function useCheckoutConfirmation({ itemsReady, addressReady, selectedAddress, deliveryFee }) {
    const store = useStore();
    const history = useHistory();
    const cartSaving = useSelector((state) => state.cartSaving);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [uncertain, setUncertain] = useState(false);
    const locked = useRef(false);
    const completed = useRef(false);

    async function submitOrder() {
        const { cart, auth } = store.getState();
        const selected = cart.filter((item) => item.checked !== false);
        if (locked.current || completed.current || uncertain || store.getState().cartSaving || !itemsReady || !addressReady || !selectedAddress || !auth?.token || !selected.length) return;
        locked.current = true;
        setIsSubmitting(true);
        setError('');
        store.dispatch({ type: CART_SAVING });
        let orderRequested = false;
        try {
            // Keep unchecked items in the server cart; the order endpoint reads checked items only.
            const saved = await saveCart(auth.token, cart);
            if (saved.data?.error) {
                setError('Keranjang belum berhasil disimpan. Silakan coba lagi.');
                return;
            }
            orderRequested = true;
            const { data } = await createOrder({ delivery_fee: deliveryFee, delivery_address: selectedAddress._id });
            if (data?.error) {
                setError(typeof data.message === 'string' ? data.message : 'Pesanan belum bisa dibuat. Periksa kembali menu dan alamatmu.');
                return;
            }
            if (!data?._id) throw new Error('Order result missing');
            completed.current = true;
            if (store.getState().auth.token !== auth.token) return;
            const orderedIds = new Set(selected.map((item) => item._id));
            cartState.skipNextSave = true;
            store.dispatch(setItems(store.getState().cart.filter((item) => !orderedIds.has(item._id))));
            history.push(`/invoice/${data._id}`);
        } catch {
            if (orderRequested) {
                setUncertain(true);
                setError('Status pesanan belum bisa dipastikan. Periksa riwayat belanja sebelum membuat pesanan lagi.');
            } else setError('Keranjang belum bisa disimpan. Periksa koneksimu dan coba lagi.');
        } finally {
            locked.current = false;
            setIsSubmitting(false);
            store.dispatch({ type: CART_SAVED });
        }
    }

    return {
        isSubmitting, error, uncertain, submitOrder,
        isBusy: isSubmitting || !!cartSaving,
        historyTo: '/account?tab=riwayat',
    };
}
