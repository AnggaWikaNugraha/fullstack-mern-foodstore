import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Home from './index';
import StorefrontHeader from '../../component/Topbar/StorefrontHeader';
import productsReducer from '../../features/products/reducer';
import cartReducer from '../../features/Cart/reducer';
import { getProducts } from '../../api/products';
import { get as getCategories } from '../../api/category';
import { getTags } from '../../api/tag';
import { getWishlist, addToWishlist } from '../../api/wishlist';
import { saveCart } from '../../api/cart';

jest.mock('../../api/products');
jest.mock('../../api/category');
jest.mock('../../api/tag');
jest.mock('../../api/wishlist');
jest.mock('../../api/cart', () => ({ saveCart: jest.fn(), cartState: { skipNextSave: false } }));
jest.mock('debounce-promise', () => (fn) => fn);

const burger = {
    _id: 'burger',
    name: 'Burger Keju',
    price: 35000,
    stock: 3,
    category: { name: 'utama' },
    review_count: 2,
    avg_rating: 4.5,
};
const soldOut = { _id: 'coffee', name: 'Kopi Susu', price: 15000, stock: 0, category: { name: 'minuman' } };

function setup({ signedIn = false, page = 1 } = {}) {
    const history = createMemoryHistory();
    const auth = signedIn
        ? { token: 'test-token', user: { full_name: 'Angga' } }
        : { token: null, user: null };
    const store = createStore(
        combineReducers({ products: productsReducer, cart: cartReducer, auth: () => auth }),
        {
            products: { ...productsReducer(undefined, {}), currentPage: page },
            cart: [],
            auth,
        },
        applyMiddleware(thunk)
    );
    render(
        <Provider store={store}>
            <Router history={history}>
                <StorefrontHeader />
                <Home />
            </Router>
        </Provider>
    );
    return { store, history };
}

beforeEach(() => {
    jest.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    getProducts.mockResolvedValue({ data: { data: [burger, soldOut], count: 2 } });
    getCategories.mockResolvedValue({ data: { data: [{ name: 'utama' }, { name: 'minuman' }] } });
    getTags.mockResolvedValue({ data: [{ _id: 'cheese', name: 'cheese' }] });
    getWishlist.mockResolvedValue({ data: { data: [] } });
    saveCart.mockResolvedValue({ data: {} });
    addToWishlist.mockResolvedValue({ data: {} });
});

test('search submits a keyword and resets pagination, categories, and tags', async () => {
    const { store } = setup({ page: 2 });
    await screen.findByText('Burger Keju');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari menu' }), { target: { value: 'burger' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cari', exact: true }));
    await screen.findByRole('heading', { name: 'Hasil untuk “burger”' });
    await waitFor(() =>
        expect(getProducts).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'burger', skip: 0 }))
    );
    expect(store.getState().products.currentPage).toBe(1);
});

test('category and tag filters reach the API, and reset clears the selection', async () => {
    const { store } = setup();
    fireEvent.click(await screen.findByRole('button', { name: /Makanan utama Bikin/ }));
    await waitFor(() =>
        expect(getProducts).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'utama' }))
    );
    fireEvent.click(screen.getByRole('button', { name: 'cheese' }));
    await waitFor(() =>
        expect(getProducts).toHaveBeenLastCalledWith(
            expect.objectContaining({ category: 'utama', tags: ['cheese'] })
        )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reset filter' }));
    expect(store.getState().products).toMatchObject({ category: '', tags: [], keyword: '', currentPage: 1 });
});

test('unavailable menu cannot be ordered and guests are directed to login', async () => {
    const { history } = setup();
    await screen.findByText('Burger Keju');
    expect(screen.getByRole('button', { name: 'Tambah Kopi Susu ke keranjang' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Burger Keju ke keranjang' }));
    expect(history.location.pathname).toBe('/login');
    expect(saveCart).not.toHaveBeenCalled();
});

test('adding a menu updates the cart and confirms the saved item', async () => {
    const { store } = setup({ signedIn: true });
    await screen.findByText('Burger Keju');
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Burger Keju ke keranjang' }));
    expect(await screen.findByText('Burger Keju ditambahkan ke keranjang.')).toBeInTheDocument();
    expect(saveCart).toHaveBeenCalledWith('test-token', [expect.objectContaining({ _id: 'burger', qty: 1 })]);
    expect(store.getState().cart[0].qty).toBe(1);
    expect(screen.getByRole('link', { name: 'Keranjang, 1 item' })).toBeInTheDocument();
});

test('failed cart save rolls back the added quantity and shows an error', async () => {
    saveCart.mockRejectedValue(new Error('Offline'));
    const { store } = setup({ signedIn: true });
    await screen.findByText('Burger Keju');
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Burger Keju ke keranjang' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Belum berhasil menambahkan menu');
    expect(store.getState().cart).toEqual([]);
});

test('wishlist selection rolls back when the server rejects it', async () => {
    addToWishlist.mockRejectedValue(new Error('Offline'));
    setup({ signedIn: true });
    await screen.findByText('Burger Keju');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Burger Keju ke favorit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Favorit belum tersimpan');
    expect(screen.getByRole('button', { name: 'Simpan Burger Keju ke favorit' })).toHaveAttribute(
        'aria-pressed',
        'false'
    );
});

test('failed catalog request can be retried successfully', async () => {
    getProducts.mockRejectedValueOnce(new Error('Offline'));
    setup();
    expect(await screen.findByRole('alert')).toHaveTextContent('Menu belum bisa dimuat');
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Burger Keju')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('empty results provide an action to clear the filters', async () => {
    getProducts.mockResolvedValue({ data: { data: [], count: 0 } });
    setup();
    expect(await screen.findByText('Menu yang kamu cari belum ketemu')).toBeInTheDocument();
    expect(
        within(screen.getByRole('region', { name: 'Menu untuk hari ini' })).getByRole('button', {
            name: 'Lihat semua menu',
        })
    ).toBeInTheDocument();
});

test('next page requests the next set of menu items', async () => {
    getProducts.mockResolvedValue({ data: { data: [burger], count: 13 } });
    setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Halaman berikutnya' }));
    await waitFor(() =>
        expect(getProducts).toHaveBeenLastCalledWith(expect.objectContaining({ skip: 8, limit: 8 }))
    );
    expect(await screen.findByRole('button', { name: 'Halaman 2' })).toHaveAttribute('aria-current', 'page');
});
