import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { Router, Route, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Checkout from './index';
import cartReducer from '../../features/Cart/reducer';
import cartSavingReducer from '../../features/Cart/cartSavingReducer';
import { getCart, saveCart, cartState } from '../../api/cart';
import { getAddress } from '../../api/address';
import { createOrder } from '../../api/orders';
import { config } from '../../config';

jest.mock('../../api/cart', () => ({ getCart: jest.fn(), saveCart: jest.fn(), cartState: { skipNextSave: false } }));
jest.mock('../../api/address', () => ({ getAddress: jest.fn() }));
jest.mock('../../api/orders', () => ({ createOrder: jest.fn() }));
const burger = { _id: 'burger', name: 'Burger Keju', price: 37450, qty: 2, stock: 4, checked: true };
const coffee = { _id: 'coffee', name: 'Kopi Susu', price: 18000, qty: 1, stock: 3, checked: false };
const home = { _id: 'home', nama: 'Rumah', detail: 'Jalan Melati 12', kelurahan: 'Sukamaju', kecamatan: 'Sukasari', kabupaten: 'Bandung', provinsi: 'Jawa Barat' };
const office = { ...home, _id: 'office', nama: 'Kantor', detail: 'Jalan Mawar 10' };

function setup({ route = '/checkout', cart = [burger, coffee] } = {}) {
    const store = createStore(combineReducers({ cart: cartReducer, cartSaving: cartSavingReducer, auth: () => ({ token: 'test-token', user: { full_name: 'Pengguna' } }) }), { cart, cartSaving: false });
    const history = createMemoryHistory({ initialEntries: [route] });
    render(<Provider store={store}><Router history={history}><Switch><Route path="/checkout"><Checkout /></Route><Route path="/invoice/:id"><h1>Invoice pesanan</h1></Route></Switch></Router></Provider>);
    return { store, history };
}
async function goToAddress() {
    fireEvent.click(await screen.findByRole('button', { name: 'Pilih alamat' }));
    await screen.findByRole('heading', { name: 'Mau diantar ke mana?' });
}
async function goToConfirmation() {
    await goToAddress();
    fireEvent.click(await screen.findByRole('radio', { name: 'Rumah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tinjau pesanan' }));
}

beforeEach(() => {
    jest.clearAllMocks(); cartState.skipNextSave = false;
    config.global_ongkir = '10000';
    getCart.mockResolvedValue(true);
    getAddress.mockResolvedValue({ data: { data: [home, office], count: 2 } });
    saveCart.mockResolvedValue({ data: [] });
    createOrder.mockResolvedValue({ data: { _id: 'order-1' } });
});

test('refresh waits for cart loading before showing selected items and exact totals', async () => {
    let resolve; getCart.mockReturnValue(new Promise((done) => { resolve = done; }));
    setup();
    expect(screen.getByRole('status')).toHaveTextContent('Menyiapkan pesananmu');
    expect(screen.queryByText('Belum ada menu yang dipilih')).not.toBeInTheDocument();
    await act(async () => { resolve(true); });
    expect(screen.getByText('Burger Keju')).toBeInTheDocument();
    expect(screen.queryByText('Kopi Susu')).not.toBeInTheDocument();
    expect(within(screen.getByRole('complementary')).getByText(/84\.900/)).toBeInTheDocument();
});

test('cart loading failure can be retried', async () => {
    getCart.mockResolvedValueOnce(false); setup();
    expect(await screen.findByRole('alert')).toHaveTextContent('Pesanan belum bisa dimuat');
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Burger Keju')).toBeInTheDocument();
});

test('an empty selection offers a return to cart', async () => {
    setup({ cart: [coffee] });
    expect(await screen.findByRole('heading', { name: 'Belum ada menu yang dipilih' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke keranjang' })).toHaveAttribute('href', '/keranjang');
    expect(createOrder).not.toHaveBeenCalled();
});

test('insufficient stock cannot advance to address selection', async () => {
    setup({ cart: [{ ...burger, stock: 1 }] });
    expect(await screen.findByRole('alert')).toHaveTextContent('Stok menu tidak mencukupi');
    expect(screen.getByRole('button', { name: 'Pilih alamat' })).toBeDisabled();
});

test('address selection is required, and going back retains the selection', async () => {
    setup(); await goToAddress();
    expect(screen.getByRole('button', { name: 'Tinjau pesanan' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Rumah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tinjau pesanan' }));
    expect(screen.getByRole('heading', { name: 'Semuanya sudah sesuai?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ubah alamat' }));
    expect(screen.getByRole('radio', { name: 'Rumah' })).toBeChecked();
    expect(screen.getByRole('button', { name: /Alamat pengiriman/ })).toHaveAttribute('aria-current', 'step');
});

test('empty addresses offer an add-address link with checkout return parameters', async () => {
    getAddress.mockResolvedValue({ data: { data: [], count: 0 } });
    setup(); await goToAddress();
    expect(screen.getByText('Belum ada alamat pengiriman')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tambah alamat pertama' })).toHaveAttribute('href', '/alamat-pengiriman/tambah?from=checkout&step=2');
    expect(screen.getByRole('button', { name: 'Tinjau pesanan' })).toBeDisabled();
});

test('address failure can be retried without losing the current step', async () => {
    getAddress.mockRejectedValueOnce(new Error('Offline'));
    setup(); await goToAddress();
    expect(screen.getByRole('alert')).toHaveTextContent('Alamat belum bisa dimuat');
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByRole('radio', { name: 'Rumah' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mau diantar ke mana?' })).toBeInTheDocument();
});

test('address pagination preserves a chosen address and the active step', async () => {
    getAddress.mockImplementation(({ page }) => Promise.resolve({ data: { data: page === 1 ? [home] : [office], count: 5 } }));
    setup(); await goToAddress();
    fireEvent.click(screen.getByRole('radio', { name: 'Rumah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Halaman alamat berikutnya' }));
    expect(await screen.findByRole('radio', { name: 'Kantor' })).toBeInTheDocument();
    expect(getAddress).toHaveBeenLastCalledWith({ page: 2, limit: 4 });
    expect(screen.getByRole('heading', { name: 'Mau diantar ke mana?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tinjau pesanan' }));
    expect(screen.getByText('Jalan Melati 12')).toBeInTheDocument();
});

test('returning from address management selects an address outside the first page', async () => {
    getAddress.mockImplementation(({ id }) => Promise.resolve({ data: { data: id ? [office] : [home], count: id ? 1 : 5 } }));
    setup({ route: '/checkout?step=2&address=office' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tinjau pesanan' })).toBeEnabled());
    expect(getAddress).toHaveBeenCalledWith({ page: 1, limit: 1, id: 'office' });
    fireEvent.click(screen.getByRole('button', { name: 'Tinjau pesanan' }));
    expect(screen.getByText('Jalan Mawar 10')).toBeInTheDocument();
});

test('an invalid returned address offers manual selection', async () => {
    getAddress.mockImplementation(({ id }) => Promise.resolve({ data: { data: id ? [] : [home], count: id ? 0 : 1 } }));
    setup({ route: '/checkout?step=2&address=missing' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Alamat sebelumnya tidak ditemukan');
    expect(screen.getByRole('button', { name: 'Tinjau pesanan' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Rumah' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('order success saves the full cart, preserves unchecked items, and opens invoice', async () => {
    const { store, history } = setup(); await goToConfirmation();
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));
    expect(await screen.findByRole('heading', { name: 'Invoice pesanan' })).toBeInTheDocument();
    expect(saveCart).toHaveBeenCalledWith('test-token', [burger, coffee]);
    expect(createOrder).toHaveBeenCalledWith({ delivery_fee: 10000, delivery_address: 'home' });
    expect(store.getState().cart).toEqual([coffee]);
    expect(cartState.skipNextSave).toBe(true);
    expect(history.location.pathname).toBe('/invoice/order-1');
});

test.each(['network', 'API'])('%s cart-save failure prevents order creation and allows retry', async (kind) => {
    if (kind === 'network') saveCart.mockRejectedValueOnce(new Error('Offline'));
    else saveCart.mockResolvedValueOnce({ data: { error: 1 } });
    const { store } = setup(); await goToConfirmation();
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Keranjang belum/);
    expect(createOrder).not.toHaveBeenCalled();
    expect(store.getState().cart).toEqual([burger, coffee]);
    expect(screen.getByRole('button', { name: 'Buat pesanan' })).toBeEnabled();
});

test('a rejected order keeps cart and address ready for correction', async () => {
    createOrder.mockResolvedValueOnce({ data: { error: 1, message: 'Stok tidak cukup.' } });
    const { store } = setup(); await goToConfirmation();
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Stok tidak cukup.');
    expect(store.getState().cart).toEqual([burger, coffee]);
    expect(screen.getByRole('button', { name: 'Ubah alamat' })).toBeEnabled();
});

test.each(['network', 'missing ID'])('uncertain order outcome (%s) directs to history and blocks resubmission', async (kind) => {
    if (kind === 'network') createOrder.mockRejectedValueOnce(new Error('Connection lost'));
    else createOrder.mockResolvedValueOnce({ data: {} });
    const { store } = setup(); await goToConfirmation();
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Status pesanan belum bisa dipastikan');
    expect(screen.getByRole('link', { name: 'Lihat riwayat belanja' })).toHaveAttribute('href', '/account?tab=riwayat');
    expect(screen.getByRole('button', { name: 'Buat pesanan' })).toBeDisabled();
    expect(store.getState().cart).toEqual([burger, coffee]);
});

test('pending submission blocks duplicate clicks and step navigation', async () => {
    let resolve; createOrder.mockReturnValue(new Promise((done) => { resolve = done; }));
    setup(); await goToConfirmation();
    fireEvent.click(screen.getByRole('button', { name: 'Buat pesanan' }));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    const pending = screen.getByRole('button', { name: 'Memproses...' });
    expect(pending).toBeDisabled(); fireEvent.click(pending);
    expect(screen.getByRole('button', { name: 'Ubah alamat' })).toBeDisabled();
    expect(createOrder).toHaveBeenCalledTimes(1);
    await act(async () => { resolve({ data: { _id: 'order-1' } }); });
});
