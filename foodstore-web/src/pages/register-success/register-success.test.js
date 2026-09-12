import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Router, Route, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Register from '../register';
import RegisterSuccess from './index';
import CekEmail from '../cek-email';
import TopBar from '../../component/Topbar';
import { registerUser, resendVerification } from '../../api/auth';

jest.mock('../../api/auth', () => ({ registerUser: jest.fn(), resendVerification: jest.fn() }));

function setup(entry = '/register/berhasil') {
    const history = createMemoryHistory({ initialEntries: [entry] });
    const store = createStore(() => ({ auth: { user: null }, cart: [] }));
    render(
        <Provider store={store}>
            <Router history={history}>
                <TopBar />
                <Switch>
                    <Route exact path="/register"><Register /></Route>
                    <Route path="/register/berhasil"><RegisterSuccess /></Route>
                    <Route path="/cek-email"><CekEmail /></Route>
                    <Route path="/login"><h1>Masuk ke akun</h1></Route>
                </Switch>
            </Router>
        </Provider>
    );
    return history;
}

beforeEach(() => jest.clearAllMocks());

test('registration reaches success and retains the email when continuing to resend verification', async () => {
    registerUser.mockResolvedValue({ status: 200, data: { message: 'Register success' } });
    const history = setup('/register');
    const values = { 'Nama lengkap': 'Pengguna Baru', Email: 'user@example.com', Password: 'secret-password', 'Konfirmasi password': 'secret-password' };
    Object.entries(values).forEach(([label, value]) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } }));
    fireEvent.click(screen.getByRole('button', { name: 'Daftar sekarang' }));
    expect(await screen.findByRole('heading', { name: 'Akunmu berhasil dibuat.' })).toBeInTheDocument();
    expect(history.location.pathname).toBe('/register/berhasil');
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Cari makanan, minuman, dan lainnya...')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Kirim ulang link' }));
    expect(history.location.pathname).toBe('/cek-email');
    expect(history.location.search).toBe('');
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com');
    expect(registerUser).toHaveBeenCalledTimes(1);
    expect(resendVerification).not.toHaveBeenCalled();
});

test.each([undefined, { email: 42 }])('direct access with state %o can continue without an email', (state) => {
    const history = setup({ pathname: '/register/berhasil/', state });
    expect(screen.getByRole('heading', { name: 'Akunmu berhasil dibuat.' })).toBeInTheDocument();
    expect(screen.getByText('Buka email yang kamu gunakan saat mendaftar.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Cari makanan, minuman, dan lainnya...')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Kirim ulang link' }));
    expect(history.location.pathname).toBe('/cek-email');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(resendVerification).not.toHaveBeenCalled();
});

test('the login action opens login after the user has verified their email', () => {
    const history = setup();
    fireEvent.click(screen.getByRole('link', { name: 'Sudah verifikasi? Masuk sekarang' }));
    expect(history.location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Masuk ke akun' })).toBeInTheDocument();
});
