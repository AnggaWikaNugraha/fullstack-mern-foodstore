import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Login from './index';
import TopBar from '../../component/Topbar';
import authReducer from '../../features/Auth/reducer';
import { login } from '../../api/auth';
import { config } from '../../config';

jest.mock('../../api/auth', () => ({ login: jest.fn() }));

function setup(route = '/login') {
    const history = createMemoryHistory({ initialEntries: [route] });
    const store = createStore((state = { auth: { user: null, token: null }, cart: [] }, action) => ({
        ...state, auth: authReducer(state.auth, action),
    }));
    render(<Provider store={store}><Router history={history}><Login /></Router></Provider>);
    return { history, store };
}

function submit() {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk', exact: true }));
}

beforeEach(() => jest.clearAllMocks());

test('required and invalid email fields stop requests and show accessible errors', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Masuk', exact: true }));
    expect(await screen.findByText('Email tidak boleh kosong.')).toBeInTheDocument();
    expect(screen.getByText('Password tidak boleh kosong.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
    expect(await screen.findByText('Masukkan alamat email yang valid.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(login).not.toHaveBeenCalled();
});

test('password visibility toggles without clearing or submitting credentials', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan password' }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Password')).toHaveValue('secret-password');
    fireEvent.click(screen.getByRole('button', { name: 'Sembunyikan password' }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(login).not.toHaveBeenCalled();
});

test('successful login saves the session and returns to home', async () => {
    const user = { _id: 'user-1', full_name: 'Pengguna' };
    login.mockResolvedValue({ data: { user, token: 'test-token' } });
    const { history, store } = setup();
    submit();
    await waitFor(() => expect(history.location.pathname).toBe('/'));
    expect(login).toHaveBeenCalledWith('user@example.com', 'secret-password');
    expect(store.getState().auth).toEqual({ user, token: 'test-token' });
});

test.each([
    ['API error', { data: { error: 1, message: 'email or password incorrect' } }],
    ['incomplete response', { data: {} }],
])('%s preserves the login route and permits another attempt', async (_, response) => {
    login.mockResolvedValue(response);
    const { history, store } = setup();
    submit();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(history.location.pathname).toBe('/login');
    expect(store.getState().auth.user).toBeNull();
    expect(screen.getByRole('button', { name: 'Masuk', exact: true })).toBeEnabled();
});

test('network failure releases the pending form and retry can succeed', async () => {
    login.mockRejectedValueOnce(new Error('Offline'));
    const { history } = setup();
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Belum bisa terhubung ke server');
    login.mockResolvedValueOnce({ data: { user: { _id: 'user-1' }, token: 'test-token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk', exact: true }));
    await waitFor(() => expect(history.location.pathname).toBe('/'));
});

test.each(['resolved', 'rejected'])('unverified email redirects to email verification (%s)', async (outcome) => {
    if (outcome === 'resolved') login.mockResolvedValue({ data: { error: 1, message: 'email_not_verified' } });
    else login.mockRejectedValue({ response: { data: { message: 'email_not_verified' }, status: 403 } });
    const { history } = setup();
    submit();
    await waitFor(() => expect(history.location.pathname).toBe('/cek-email'));
});

test('HTTP 401 explains that the credentials were rejected', async () => {
    login.mockRejectedValue({ response: { status: 401 } });
    setup();
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Email atau password salah');
});

test('pending request disables submit and blocks duplicate form submissions', async () => {
    let resolve;
    login.mockReturnValue(new Promise((done) => { resolve = done; }));
    setup();
    submit();
    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Memproses...' })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
    await act(async () => { fireEvent.submit(screen.getByLabelText('Email').closest('form')); });
    expect(login).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Memproses...' })).toBeDisabled();
    await act(async () => { resolve({ data: { error: 1 } }); });
});

test('Google callback failure is visible and navigation links point to existing routes', () => {
    setup('/login?error=google_failed');
    expect(screen.getByRole('alert')).toHaveTextContent('Login Google belum berhasil');
    expect(screen.getByRole('link', { name: 'Masuk dengan Google' })).toHaveAttribute('href', `${config.api_host}/auth/google`);
    expect(screen.getByRole('link', { name: 'Daftar sekarang' })).toHaveAttribute('href', '/register');
    fireEvent.click(screen.getByRole('link', { name: 'Kembali ke beranda' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test.each(['/login', '/login/'])('legacy navigation stays hidden on %s', (route) => {
    const history = createMemoryHistory({ initialEntries: [route] });
    const store = createStore(() => ({ auth: { user: null }, cart: [] }));
    const { container } = render(<Provider store={store}><Router history={history}><TopBar /></Router></Provider>);
    expect(container).toBeEmptyDOMElement();
});
