import * as React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutOne, Card } from 'upkit';
import styled from '@emotion/styled';
import { config } from '../../config';
import axios from 'axios';

export default function VerifyEmail() {
    const location = useLocation();
    const [status, setStatus] = React.useState('loading'); // loading | success | error
    const [message, setMessage] = React.useState('');

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Link verifikasi tidak valid.');
            return;
        }

        axios.get(`${config.api_host}/auth/verify-email/${token}`)
            .then(({ data }) => {
                if (data?.error) {
                    setStatus('error');
                    setMessage(data.message);
                } else {
                    setStatus('success');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Terjadi kesalahan, coba lagi.');
            });
    }, [location.search]);

    return (
        <LayoutOne size="small">
            <Card color="white">
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    {status === 'loading' && (
                        <>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                            <Title>Memverifikasi akun...</Title>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                            <Title>Akun berhasil diverifikasi!</Title>
                            <Desc>Sekarang kamu bisa login dan mulai belanja.</Desc>
                            <ActionLink to="/login">Login Sekarang</ActionLink>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                            <Title>Verifikasi Gagal</Title>
                            <Desc>{message || 'Link tidak valid atau sudah expired.'}</Desc>
                            <ActionLink to="/cek-email">Kirim Ulang Link</ActionLink>
                        </>
                    )}
                </div>
            </Card>
        </LayoutOne>
    );
}

const Title = styled('h3')({
    fontSize: 20,
    fontWeight: 700,
    color: '#222',
    margin: '0 0 12px',
});

const Desc = styled('p')({
    fontSize: 14,
    color: '#555',
    lineHeight: 1.7,
    margin: '0 0 24px',
});

const ActionLink = styled(Link)({
    display: 'block',
    backgroundColor: '#c0392b',
    color: 'white',
    padding: '11px 0',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    textAlign: 'center',
    '&:hover': { backgroundColor: '#a93226' },
});
