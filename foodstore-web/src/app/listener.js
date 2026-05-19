import store from './store';
import { saveCart, getCart, cartState } from '../api/cart';
import { clearItems } from '../features/Cart/actions';
import { getPusher, disconnectPusher } from '../pusher';
import { CART_SAVING, CART_SAVED } from '../app/constants';

// (1) definisikan variabel tanpa nilai awal 
let currentAuth;
let currentCart;

// (1) mendefinisikan fungsi listener
function listener() {

    // (1) buat variabel previousAuth dan berikan currentAuth sebagai nilai
    let previousAuth = currentAuth;

    let previousCart = currentCart;

    // (2) update nilai currentAuth dari nilai state terbaru 
    currentAuth = store.getState().auth;

    currentCart = store.getState().cart;

    let { token } = currentAuth;

    // (3) cek apakah nilai state `auth` berubah dari nilai sebelumnya
    if (currentAuth !== previousAuth) {

        // (4) jika berubah simpan ke localStorage
        localStorage.setItem('auth', JSON.stringify(currentAuth));

        if (currentAuth.token) {
            getCart();
            getPusher(currentAuth.token);
        } else {
            store.dispatch(clearItems());
            disconnectPusher();
        }
    }

    if (currentCart !== previousCart) {

        if (token) {
            if (cartState.skipNextSave) {
                cartState.skipNextSave = false;
            } else {
                store.dispatch({ type: CART_SAVING });
                saveCart(token, currentCart)
                    .catch(() => {})
                    .finally(() => store.dispatch({ type: CART_SAVED }));
            }
        }
    }
}

let unsubscribe = null;

function listen() {
    if (unsubscribe) return;
    currentAuth = store.getState().auth;
    currentCart = store.getState().cart;
    unsubscribe = store.subscribe(listener);
}

// (2) export fungsi listen supaya bisa digunakan di file lain 
export { listen }