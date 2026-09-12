import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Register from './index';
import TopBar from '../../component/Topbar';
import { registerUser } from '../../api/auth';
import { config } from '../../config';

jest.mock('../../api/auth', () => ({ registerUser: jest.fn() }));

function setup(route = '/register') {
    const history = createMemoryHistory({ initialEntries: [route] });
    render(<Router history={history}><Register /></Router>);
    return history;
}

function fill(values = {}) {
    const fields = { 'Nama lengkap': 'Pengguna Baru', Email: 'user@example.com', Password: 'secret-password', 'Konfirmasi password': 'secret-password', ...values };
    Object.entries(fields).forEach(([name, value]) => fireEvent.change(screen.getByLabelText(name, { exact: true }), { target: { value } }));
}

function submit() { fireEvent.click(screen.getByRole('button', { name: 'Daftar sekarang', exact: true })); }

beforeEach(() => jest.clearAllMocks());

test('empty fields stop registration and provide accessible errors', async () => {
    setup();
    submit();
    expect(await screen.findByText('Nama lengkap harus diisi.')).toBeInTheDocument();
    expect(screen.getByText('Email harus diisi.')).toBeInTheDocument();
    expect(screen.getByText('Password harus diisi.')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi password harus diisi.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(registerUser).not.toHaveBeenCalled();
});

test.each([
    [{ 'Nama lengkap': '  ' }, 'Nama lengkap harus diisi.'],
    [{ 'Nama lengkap': 'AB' }, 'Nama lengkap minimal 3 karakter.'],
    [{ 'Nama lengkap': 'a'.repeat(256) }, 'Nama lengkap maksimal 255 karakter.'],
    [{ Email: 'invalid-email' }, 'Masukkan alamat email yang valid.'],
    [{ Password: 'short', 'Konfirmasi password': 'short' }, 'Password minimal 6 karakter.'],
    [{ 'Konfirmasi password': 'different-password' }, 'Konfirmasi password belum sama.'],
])('invalid values %o cannot reach the API', async (values, message) => {
    setup(); fill(values); submit();
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
});

test('changing the original password invalidates a previously matching confirmation', async () => {
    setup(); fill();
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), { target: { value: 'changed-password' } });
    submit();
    expect(await screen.findByText('Konfirmasi password belum sama.')).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
});

test('both password visibility buttons work independently without submitting', () => {
    setup(); fill();
    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan password', exact: true }));
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Konfirmasi password')).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan konfirmasi password' }));
    expect(screen.getByLabelText('Konfirmasi password')).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Sembunyikan password', exact: true }));
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Password', { exact: true })).toHaveValue('secret-password');
    expect(registerUser).not.toHaveBeenCalled();
});

test.each([200, 201])('registration success (%s) sends trimmed data and opens email verification', async (status) => {
    registerUser.mockResolvedValue({ status, data: { message: 'Register success' } });
    const history = setup();
    fill({ 'Nama lengkap': '  Pengguna Baru  ', Email: ' user@example.com ' }); submit();
    await waitFor(() => expect(history.location.pathname).toBe('/cek-email'));
    expect(registerUser).toHaveBeenCalledWith({ full_name: 'Pengguna Baru', email: 'user@example.com', password: 'secret-password', password_confirmation: 'secret-password' });
});

test.each(['resolved', 'rejected'])('server field errors (%s) stay on the form and allow correction', async (outcome) => {
    const data = { error: 1, message: 'User validation failed', fields: { email: { message: 'Email sudah terdaftar.' } } };
    if (outcome === 'resolved') registerUser.mockResolvedValueOnce({ status: 200, data });
    else registerUser.mockRejectedValueOnce({ response: { status: 422, data } });
    const history = setup(); fill(); submit();
    expect(await screen.findByText('Email sudah terdaftar.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(history.location.pathname).toBe('/register');
    registerUser.mockResolvedValueOnce({ status: 200, data: { message: 'Register success' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    submit();
    await waitFor(() => expect(history.location.pathname).toBe('/cek-email'));
});

test('network failure releases loading and permits retry', async () => {
    registerUser.mockRejectedValueOnce(new Error('Offline'));
    const history = setup(); fill(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Belum bisa terhubung ke server');
    expect(screen.getByRole('button', { name: 'Daftar sekarang', exact: true })).toBeEnabled();
    registerUser.mockResolvedValueOnce({ status: 200, data: { message: 'Register success' } });
    submit();
    await waitFor(() => expect(history.location.pathname).toBe('/cek-email'));
});

test('pending registration blocks duplicate requests and keeps credentials intact', async () => {
    let resolve;
    registerUser.mockReturnValue(new Promise((done) => { resolve = done; }));
    setup(); fill(); submit();
    await waitFor(() => expect(registerUser).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Mendaftar...' })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
    await act(async () => { fireEvent.submit(screen.getByLabelText('Email').closest('form')); });
    expect(registerUser).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Mendaftar...' })).toBeDisabled();
    await act(async () => { resolve({ status: 200, data: { error: 1, message: 'Coba lagi.' } }); });
});

test('Google registration uses the existing OAuth endpoint and login link works', () => {
    const history = setup('/register?error=google_failed');
    expect(screen.getByRole('alert')).toHaveTextContent('Pendaftaran Google belum berhasil');
    expect(screen.getByRole('link', { name: 'Daftar dengan Google' })).toHaveAttribute('href', `${config.api_host}/auth/google`);
    fireEvent.click(screen.getByRole('link', { name: 'Masuk sekarang' }));
    expect(history.location.pathname).toBe('/login');
});

test.each(['/register', '/register/'])('legacy navigation is hidden on %s', (route) => {
    const history = createMemoryHistory({ initialEntries: [route] });
    const store = createStore(() => ({ auth: { user: null }, cart: [] }));
    const { container } = render(<Provider store={store}><Router history={history}><TopBar /></Router></Provider>);
    expect(container).toBeEmptyDOMElement();
});
