import * as React from 'react';
import { Link } from 'react-router-dom';
import { LayoutOne, Card } from 'upkit';
import styled from '@emotion/styled';

export default function CekEmail() {
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
    margin: '0 0 24px',
});

const LoginLink = styled(Link)({
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
