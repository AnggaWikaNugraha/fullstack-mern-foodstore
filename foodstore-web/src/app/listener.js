import store from './store';

// (1) definisikan variabel tanpa nilai awal 
let currentAuth;

// (1) mendefinisikan fungsi listener
function listener() {

    // (1) buat variabel previousAuth dan berikan currentAuth sebagai nilai
    let previousAuth = currentAuth;

    // (2) update nilai currentAuth dari nilai state terbaru 
    currentAuth = store.getState().auth;

    // (3) cek apakah nilai state `auth` berubah dari nilai sebelumnya 
    if (currentAuth !== previousAuth) {

        // (4) jika berubah simpan ke localStorage 
        localStorage.setItem('auth', JSON.stringify(currentAuth));
    }
}

function listen() {

    // (1) dengarkan perubahan store
    store.subscribe(listener);
}

// (2) export fungsi listen supaya bisa digunakan di file lain 
export { listen }