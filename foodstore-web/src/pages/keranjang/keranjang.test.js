import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Keranjang from './index';
import TopBar from '../../component/Topbar';
import cartReducer from '../../features/Cart/reducer';
import cartSavingReducer from '../../features/Cart/cartSavingReducer';
import productsReducer from '../../features/products/reducer';
import { getCart, saveCart, cartState } from '../../api/cart';
import { config } from '../../config';

jest.mock('../../api/cart', () => ({ getCart: jest.fn(), saveCart: jest.fn(), cartState: { skipNextSave: false } }));
const burger = { _id: 'burger', name: 'Burger Keju', price: 37450, qty: 2, stock: 3, checked: true, image_url: 'burger.jpg' };
const coffee = { _id: 'coffee', name: 'Kopi Susu', price: 18000, qty: 1, stock: 5, checked: false };

function setup(items = [burger, coffee]) {
    const history = createMemoryHistory({ initialEntries: ['/keranjang'] });
    const store = createStore(combineReducers({
        cart: cartReducer,
        cartSaving: cartSavingReducer,
        products: productsReducer,
        auth: () => ({ token: 'test-token', user: { full_name: 'Pengguna' } }),
    }), { cart: items, cartSaving: false });
    render(<Provider store={store}><Router history={history}><TopBar /><Keranjang /></Router></Provider>);
    return { store, history };
}
const ready = () => screen.findByRole('region', { name: 'Menu di keranjang' });
const checkout = () => screen.getByRole('button', { name: 'Lanjut checkout' });

beforeEach(() => {
    jest.clearAllMocks();
    cartState.skipNextSave = false;
    config.global_ongkir = '10000';
    getCart.mockResolvedValue(true);
    saveCart.mockResolvedValue({ data: [] });
});

test('selected items determine exact totals without rounding prices', async () => {
    setup(); await ready();
    const summary = screen.getByRole('complementary', { name: 'Ringkasan belanja' });
    expect(within(summary).getByText('Subtotal (2 porsi)')).toBeInTheDocument();
    expect(within(summary).getByText(/74\.900/)).toBeInTheDocument();
    expect(screen.getByTestId('cart-total')).toHaveTextContent('84.900');
    expect(screen.getByRole('checkbox', { name: /Pilih semua/ })).toBePartiallyChecked();
    expect(screen.getByRole('link', { name: 'Keranjang, 3 item' })).toBeInTheDocument();
});

test('quantity is persisted before the UI updates and cannot exceed stock', async () => {
    let resolve;
    saveCart.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const { store } = setup(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Burger Keju' }));
    expect(store.getState().cart[0].qty).toBe(2);
    expect(screen.getByRole('button', { name: 'Menyimpan...' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Burger Keju' }));
    expect(saveCart).toHaveBeenCalledTimes(1);
    await act(async () => { resolve({ data: [] }); });
    expect(store.getState().cart[0].qty).toBe(3);
    expect(screen.getByRole('button', { name: 'Tambah Burger Keju' })).toBeDisabled();
    expect(saveCart).toHaveBeenCalledWith('test-token', [expect.objectContaining({ _id: 'burger', qty: 3 }), coffee]);
    expect(cartState.skipNextSave).toBe(true);
    expect(checkout()).toBeEnabled();
});

test('quantity can decrease, but never below one', async () => {
    const { store } = setup(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Kurangi Burger Keju' }));
    await waitFor(() => expect(store.getState().cart[0].qty).toBe(1));
    expect(screen.getByRole('button', { name: 'Kurangi Burger Keju' })).toBeDisabled();
});

test.each(['network', 'API'])('%s save failure keeps existing data and enables a retry', async (kind) => {
    if (kind === 'network') saveCart.mockRejectedValueOnce(new Error('Offline'));
    else saveCart.mockResolvedValueOnce({ data: { error: 1 } });
    const { store } = setup(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Burger Keju' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Perubahan belum tersimpan');
    expect(store.getState().cart[0].qty).toBe(2);
    expect(store.getState().cartSaving).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Burger Keju' }));
    await waitFor(() => expect(store.getState().cart[0].qty).toBe(3));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('individual and bulk selection update saved flags and totals', async () => {
    const { store } = setup([{ ...burger, checked: undefined }, coffee]); await ready();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pilih Burger Keju' }));
    await waitFor(() => expect(store.getState().cart[0].checked).toBe(false));
    expect(checkout()).toBeDisabled();
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Rp 0');
    fireEvent.click(screen.getByRole('checkbox', { name: /Pilih semua/ }));
    await waitFor(() => expect(store.getState().cart.every((item) => item.checked)).toBe(true));
    expect(screen.getByTestId('cart-total')).toHaveTextContent('102.900');
    fireEvent.click(screen.getByRole('checkbox', { name: /Pilih semua/ }));
    await waitFor(() => expect(store.getState().cart.every((item) => !item.checked)).toBe(true));
    expect(checkout()).toBeDisabled();
});

test('deleting selected items preserves unchecked items, and deleting the last item shows empty state', async () => {
    const { store } = setup(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Hapus pilihan' }));
    await waitFor(() => expect(store.getState().cart).toEqual([coffee]));
    fireEvent.click(screen.getByRole('button', { name: 'Hapus Kopi Susu' }));
    expect(await screen.findByRole('heading', { name: 'Keranjangmu masih kosong.' })).toBeInTheDocument();
    expect(store.getState().cart).toEqual([]);
    expect(screen.getByRole('link', { name: 'Jelajahi menu' })).toHaveAttribute('href', '/');
});

test('failed deletion preserves the item', async () => {
    saveCart.mockRejectedValueOnce(new Error('Offline'));
    const { store } = setup(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Hapus Burger Keju' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(store.getState().cart).toEqual([burger, coffee]);
});

test.each([0, 1])('selected insufficient stock (%s) blocks checkout but can be deselected', async (stock) => {
    setup([{ ...burger, stock }, { ...coffee, checked: true }]); await ready();
    expect(checkout()).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pilih Burger Keju' }));
    await waitFor(() => expect(checkout()).toBeEnabled());
});

test('loading failure has a retry and does not misrepresent existing cart as empty', async () => {
    getCart.mockResolvedValueOnce(false);
    setup();
    expect(screen.getByRole('status')).toHaveTextContent('Menyiapkan keranjangmu');
    expect(await screen.findByRole('alert')).toHaveTextContent('Keranjang belum bisa dimuat');
    expect(screen.queryByRole('heading', { name: 'Keranjangmu masih kosong.' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    await ready();
    expect(getCart).toHaveBeenCalledTimes(2);
});

test('checkout uses the persisted selection', async () => {
    const { history, store } = setup(); await ready();
    fireEvent.click(checkout());
    expect(history.location.pathname).toBe('/checkout');
    expect(store.getState().cart.filter((item) => item.checked !== false)).toEqual([burger]);
});

test('header search from cart sends the keyword and opens home', async () => {
    const { history, store } = setup(); await ready();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari menu' }), { target: { value: ' burger ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cari', exact: true }));
    expect(history.location.pathname).toBe('/');
    expect(store.getState().products.keyword).toBe('burger');
});

test('missing and failed images use the local fallback', async () => {
    setup(); await ready();
    const image = screen.getByRole('img', { name: 'Burger Keju' });
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', '/images/menus/semua.png');
    expect(screen.getByRole('img', { name: 'Kopi Susu' })).toHaveAttribute('src', '/images/menus/semua.png');
});
