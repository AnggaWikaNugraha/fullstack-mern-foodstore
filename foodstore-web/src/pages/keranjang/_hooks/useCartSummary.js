import { useHistory } from 'react-router-dom';
import { useStore } from 'react-redux';
import { config } from '../../../config';

export default function useCartSummary(selectedItems, isBusy) {
    const history = useHistory();
    const store = useStore();
    const quantity = selectedItems.reduce((sum, item) => sum + Number(item.qty), 0);
    const subtotal = selectedItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    const deliveryFee = selectedItems.length ? Math.max(0, parseInt(config.global_ongkir, 10) || 0) : 0;
    const unavailable = selectedItems.some((item) => item.stock != null && (item.stock === 0 || item.qty > item.stock));
    const canCheckout = selectedItems.length > 0 && !isBusy && !unavailable;

    return {
        quantity, subtotal, deliveryFee, total: subtotal + deliveryFee, canCheckout,
        hint: unavailable ? 'Sesuaikan jumlah atau batalkan pilihan menu yang stoknya tidak mencukupi.'
            : !selectedItems.length ? 'Pilih menu yang ingin kamu pesan terlebih dahulu.' : '',
        checkout: () => {
            if (canCheckout && !store.getState().cartSaving) history.push('/checkout');
        },
    };
}
