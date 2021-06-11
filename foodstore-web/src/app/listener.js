import store from './store';
import { saveCart } from '../api/cart';

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
    }

    if (currentCart !== previousCart) {

        localStorage.setItem('cart', JSON.stringify(currentCart));

        saveCart(token, currentCart);
    }
}

function listen() {

    // (1) dengarkan perubahan store
    store.subscribe(listener);
}

// (2) export fungsi listen supaya bisa digunakan di file lain 
export { listen }