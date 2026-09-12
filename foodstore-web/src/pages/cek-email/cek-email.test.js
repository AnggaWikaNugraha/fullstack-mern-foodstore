import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CekEmail from './index';
import TopBar from '../../component/Topbar';
import { resendVerification } from '../../api/auth';

jest.mock('../../api/auth', () => ({ resendVerification: jest.fn() }));

function setup(entry = '/cek-email') {
    const history = createMemoryHistory({ initialEntries: [entry] });
    render(<Router history={history}><CekEmail /></Router>);
    return history;
}
function fill(value = 'user@example.com') { fireEvent.change(screen.getByLabelText('Email'), { target: { value } }); }
function submit() { fireEvent.click(screen.getByRole('button', { name: 'Kirim ulang link' })); }

beforeEach(() => jest.clearAllMocks());

test('the guide renders without sending an email automatically', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Cek email kamu.' })).toBeInTheDocument();
    expect(screen.getByText('Link berlaku selama 24 jam.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(resendVerification).not.toHaveBeenCalled();
});

test('email from registration or login is prefilled without an automatic request', async () => {
    resendVerification.mockResolvedValue({ data: { message: 'Sent' } });
    const history = setup({ pathname: '/cek-email', state: { email: 'user@example.com' } });
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com');
    expect(history.location.search).toBe('');
    expect(resendVerification).not.toHaveBeenCalled();
    submit();
    expect(await screen.findByRole('status')).toHaveTextContent('user@example.com');
    expect(resendVerification).toHaveBeenCalledWith('user@example.com');
});

test.each([
    ['', 'Email harus diisi.'],
    ['   ', 'Email harus diisi.'],
    ['invalid-email', 'Masukkan alamat email yang valid.'],
])('invalid email %s stops the request', async (value, message) => {
    setup(); fill(value); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(resendVerification).not.toHaveBeenCalled();
});

test('successful resend trims the email, announces success, and clears stale feedback on edit', async () => {
    resendVerification.mockResolvedValue({ data: { message: 'Sent' } });
    setup(); fill(' user@example.com '); submit();
    expect(await screen.findByRole('status')).toHaveTextContent('Link verifikasi sudah dikirim ulang ke user@example.com');
    expect(resendVerification).toHaveBeenCalledWith('user@example.com');
    fill('another@example.com');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test.each([
    'Email tidak ditemukan',
    'Akun sudah terverifikasi, silakan login',
])('backend rejection is shown: %s', async (message) => {
    resendVerification.mockResolvedValue({ data: { error: 1, message } });
    const history = setup(); fill(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(history.location.pathname).toBe('/cek-email');
    expect(screen.getByRole('button', { name: 'Kirim ulang link' })).toBeEnabled();
});

test('HTTP failure keeps a usable error message', async () => {
    resendVerification.mockRejectedValue({ response: { data: { message: 'Coba lagi nanti.' } } });
    setup(); fill(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Coba lagi nanti.');
});

test('an incomplete response cannot announce successful delivery', async () => {
    resendVerification.mockResolvedValue({ data: {} });
    setup(); fill(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Link belum berhasil dikirim');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('network failure can be retried successfully', async () => {
    resendVerification.mockRejectedValueOnce(new Error('Offline'));
    setup(); fill(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Periksa koneksimu dan coba lagi');
    resendVerification.mockResolvedValueOnce({ data: { message: 'Sent' } });
    submit();
    expect(await screen.findByRole('status')).toHaveTextContent('Link verifikasi sudah dikirim ulang');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('pending resend locks the form and blocks duplicate requests', async () => {
    let resolve;
    resendVerification.mockReturnValue(new Promise((done) => { resolve = done; }));
    setup(); fill(); submit();
    await waitFor(() => expect(resendVerification).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Mengirim...' })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
    await act(async () => { fireEvent.submit(screen.getByLabelText('Email').closest('form')); });
    expect(resendVerification).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Mengirim...' })).toBeDisabled();
    await act(async () => { resolve({ data: { message: 'Sent' } }); });
});

test('verified users can return to login', () => {
    const history = setup();
    fireEvent.click(screen.getByRole('link', { name: 'Masuk sekarang' }));
    expect(history.location.pathname).toBe('/login');
});

test.each(['/cek-email', '/cek-email/'])('legacy navigation is hidden on %s', (route) => {
    const history = createMemoryHistory({ initialEntries: [route] });
    const store = createStore(() => ({ auth: { user: null }, cart: [] }));
    const { container } = render(<Provider store={store}><Router history={history}><TopBar /></Router></Provider>);
    expect(container).toBeEmptyDOMElement();
});
