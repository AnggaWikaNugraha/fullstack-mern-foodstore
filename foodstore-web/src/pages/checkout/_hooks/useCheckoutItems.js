import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCart } from '../../../api/cart';
import { config } from '../../../config';
import { getImageUrl } from '../../../utils/image-url';

export default function useCheckoutItems() {
    const cart = useSelector((state) => state.cart);
    const [status, setStatus] = useState('loading');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let active = true;
        setStatus('loading');
        getCart().then((loaded) => {
            if (active) setStatus(loaded ? 'success' : 'error');
        }).catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, [attempt]);

    const items = useMemo(() => cart.filter((item) => item.checked !== false), [cart]);
    const quantity = items.reduce((sum, item) => sum + Number(item.qty), 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0);
    const deliveryFee = items.length ? Math.max(0, parseInt(config.global_ongkir, 10) || 0) : 0;
    const unavailable = items.some((item) => item.stock != null && Number(item.qty) > item.stock);
    return {
        items, status, quantity, subtotal, deliveryFee, total: subtotal + deliveryFee, unavailable,
        ready: status === 'success' && items.length > 0 && !unavailable,
        retry: () => setAttempt((value) => value + 1),
        imageSource: useCallback((item) => getImageUrl(item.image_url) || '/images/menus/semua.png', []),
        onImageError: useCallback((event) => {
            if (!event.currentTarget.src.endsWith('/images/menus/semua.png')) event.currentTarget.src = '/images/menus/semua.png';
        }, []),
    };
}
