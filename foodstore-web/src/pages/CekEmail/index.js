import * as React from 'react';
import { Link } from 'react-router-dom';
import { LayoutOne, Card } from 'upkit';
import styled from '@emotion/styled';
import axios from 'axios';
import { config } from '../../config';

export default function CekEmail() {
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState('idle'); // idle | loading | success | error
    const [msg, setMsg] = React.useState('');

    const handleResend = async (e) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        setMsg('');
        try {
            const { data } = await axios.post(`${config.api_host}/auth/resend-verification`, { email });
            if (data?.error) {
                setMsg(data.message);
                setStatus('error');
            } else {
                setMsg('Link verifikasi sudah dikirim ulang, cek email kamu.');
                setStatus('success');
            }
        } catch {
            setMsg('Terjadi kesalahan, coba lagi.');
            setStatus('error');
        }
    };

    return (
        <LayoutOne size="small">
            <Card color="white">
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                    <Title>Silakan cek email kamu</Title>
                    <Desc>
                        Link verifikasi sudah dikirim ke email kamu.
                        Klik link tersebut untuk mengaktifkan akun, lalu login kembali.
                    </Desc>
                    <Hint>Link berlaku selama 24 jam.</Hint>

                    <Divider />

                    <ResendLabel>Tidak menerima email?</ResendLabel>
                    <form onSubmit={handleResend}>
                        <Input
                            type="email"
                            placeholder="Masukkan email kamu"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        {msg && <Msg success={status === 'success'}>{msg}</Msg>}
                        <ResendBtn type="submit" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Mengirim...' : 'Kirim Ulang Link'}
                        </ResendBtn>
                    </form>

                    <LoginLink to="/login">Kembali ke Login</LoginLink>
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
    margin: '0 0 8px',
});

const Hint = styled('p')({
    fontSize: 13,
    color: '#aaa',
    margin: '0 0 16px',
});

const Divider = styled('div')({
    height: 1,
    background: '#f0f0f0',
    margin: '16px 0',
});

const ResendLabel = styled('p')({
    fontSize: 13,
    color: '#888',
    margin: '0 0 10px',
});

const Input = styled('input')({
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    marginBottom: 10,
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': { borderColor: '#c0392b' },
});

const Msg = styled('p')(props => ({
    fontSize: 13,
    color: props.success ? '#27ae60' : '#c0392b',
    margin: '0 0 10px',
    textAlign: 'left',
}));

const ResendBtn = styled('button')(props => ({
    width: '100%',
    backgroundColor: props.disabled ? '#e0e0e0' : '#c0392b',
    color: props.disabled ? '#aaa' : 'white',
    border: 'none',
    borderRadius: 8,
    padding: '11px 0',
    fontSize: 14,
    fontWeight: 700,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    marginBottom: 12,
}));

const LoginLink = styled(Link)({
    display: 'block',
    color: '#888',
    fontSize: 13,
    textDecoration: 'none',
    '&:hover': { color: '#c0392b' },
});
