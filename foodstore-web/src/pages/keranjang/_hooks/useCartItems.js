import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { cartState, getCart, saveCart } from '../../../api/cart';
import { setItems } from '../../../features/Cart/actions';
import { CART_SAVING, CART_SAVED } from '../../../app/constants';
import { getImageUrl } from '../../../utils/image-url';

export default function useCartItems() {
    const store = useStore();
    const items = useSelector((state) => state.cart);
    const cartSaving = useSelector((state) => state.cartSaving);
    const token = useSelector((state) => state.auth?.token);
    const [status, setStatus] = useState('loading');
    const [notice, setNotice] = useState(null);
    const locked = useRef(false);
    const active = useRef(true);

    const reload = useCallback(async () => {
        setStatus('loading');
        setNotice(null);
        try {
            const loaded = await getCart();
            if (active.current) setStatus(loaded ? 'success' : 'error');
        } catch {
            if (active.current) setStatus('error');
        }
    }, []);

    useEffect(() => {
        active.current = true;
        reload();
        return () => { active.current = false; };
    }, [reload, token]);

    async function updateItems(transform, message) {
        if (locked.current || store.getState().cartSaving || status !== 'success' || !token) return;
        const previous = store.getState().cart;
        const next = transform(previous);
        if (next === previous) return;
        locked.current = true;
        setNotice(null);
        store.dispatch({ type: CART_SAVING });
        try {
            const response = await saveCart(token, next);
            if (response.data?.error) throw new Error('Cart save rejected');
            if (store.getState().auth.token !== token) return;
            cartState.skipNextSave = true;
            store.dispatch(setItems(next));
            if (active.current) setNotice({ message });
        } catch {
            if (active.current) setNotice({ error: true, message: 'Perubahan belum tersimpan. Silakan coba lagi.' });
        } finally {
            locked.current = false;
            store.dispatch({ type: CART_SAVED });
        }
    }

    function changeQuantity(id, delta) {
        updateItems((current) => {
            const item = current.find((entry) => entry._id === id);
            if (!item) return current;
            const qty = Number(item.qty) + delta;
            if (qty < 1 || (delta > 0 && item.stock != null && qty > item.stock)) return current;
            return current.map((entry) => entry._id === id ? { ...entry, qty } : entry);
        }, 'Jumlah menu diperbarui.');
    }

    return {
        items,
        status,
        notice,
        isBusy: !!cartSaving || status !== 'success',
        reload,
        updateItems,
        changeQuantity,
        removeItem: (id) => updateItems((current) => current.filter((item) => item._id !== id), 'Menu dihapus dari keranjang.'),
        imageSource: (item) => getImageUrl(item.image_url) || '/images/menus/semua.png',
        onImageError: (event) => {
            event.currentTarget.onerror = null;
            if (!event.currentTarget.src.endsWith('/images/menus/semua.png')) event.currentTarget.src = '/images/menus/semua.png';
        },
    };
}
