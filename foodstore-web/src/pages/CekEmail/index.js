import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import axios from 'axios';
import { config } from '../../config';

export default function CekEmail() {
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState('idle');
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
        <PageBg>
            <BrandPanel>
                <BrandDecorTop />
                <BrandDecorBottom />
                <BrandContent>
                    <BrandLogo>📧</BrandLogo>
                    <BrandName>Hampir selesai!</BrandName>
                    <BrandTagline>Tinggal satu langkah lagi untuk<br />mengaktifkan akunmu.</BrandTagline>
                    <BrandDivider />
                    <BrandFeatures>
                        <BrandFeatureItem>✓ &nbsp;Cek folder inbox atau spam</BrandFeatureItem>
                        <BrandFeatureItem>✓ &nbsp;Link berlaku selama 24 jam</BrandFeatureItem>
                        <BrandFeatureItem>✓ &nbsp;Bisa kirim ulang jika tidak masuk</BrandFeatureItem>
                    </BrandFeatures>
                </BrandContent>
            </BrandPanel>

            <FormPanel>
                <FormScroll>
                    <FormCard>
                        <IconWrap>📧</IconWrap>
                        <FormTitle>Cek Email Kamu</FormTitle>
                        <FormSub>
                            Link verifikasi sudah dikirim ke email kamu.
                            Klik link tersebut untuk mengaktifkan akun, lalu login kembali.
                        </FormSub>

                        <Divider />

                        <ResendLabel>Tidak menerima email? Kirim ulang:</ResendLabel>
                        <form onSubmit={handleResend}>
                            <FieldInput
                                type="email"
                                placeholder="Masukkan email kamu"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            {msg && <Msg success={status === 'success'}>{msg}</Msg>}
                            <SubmitBtn type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Mengirim...' : 'Kirim Ulang Link'}
                            </SubmitBtn>
                        </form>

                        <LoginLink to="/login">← Kembali ke Login</LoginLink>
                    </FormCard>
                </FormScroll>
            </FormPanel>
        </PageBg>
    );
}

const PageBg = styled('div')({
    height: 'calc(100vh - 3.75rem)',
    overflow: 'hidden',
    display: 'flex',
});

const BrandPanel = styled('div')({
    width: '45%',
    flexShrink: 0,
    background: 'linear-gradient(160deg, #a93226 0%, #c0392b 45%, #e74c3c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    '@media (max-width: 768px)': { display: 'none' },
});

const BrandDecorTop = styled('div')({
    position: 'absolute',
    top: -80, right: -80,
    width: 280, height: 280,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
    pointerEvents: 'none',
});

const BrandDecorBottom = styled('div')({
    position: 'absolute',
    bottom: -60, left: -60,
    width: 220, height: 220,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none',
});

const BrandContent = styled('div')({
    position: 'relative',
    zIndex: 1,
    padding: '2rem',
    maxWidth: 340,
});

const BrandLogo = styled('div')({ fontSize: 56, marginBottom: '1rem' });

const BrandName = styled('div')({
    fontSize: '2rem',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.03em',
    marginBottom: '0.75rem',
});

const BrandTagline = styled('div')({
    fontSize: '1.0625rem',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 1.65,
    marginBottom: '1.75rem',
});

const BrandDivider = styled('div')({
    width: 40, height: 3,
    background: 'rgba(255,255,255,0.4)',
    borderRadius: 99,
    marginBottom: '1.25rem',
});

const BrandFeatures = styled('div')({ display: 'flex', flexDirection: 'column', gap: '0.5rem' });

const BrandFeatureItem = styled('div')({
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.8)',
});

const FormPanel = styled('div')({
    flex: 1,
    minWidth: 0,
    background: '#f7f8fa',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
        background: 'linear-gradient(135deg, #fdf2f2 0%, #f5f5f5 60%, #fff5f5 100%)',
    },
});

const FormScroll = styled('div')({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
});

const FormCard = styled('div')({
    background: '#fff',
    borderRadius: '1.25rem',
    boxShadow: '0 2px 24px rgba(0,0,0,0.07)',
    padding: '2.5rem 2.25rem',
    width: '100%',
    maxWidth: 420,
});

const IconWrap = styled('div')({
    fontSize: 44,
    marginBottom: '0.75rem',
});

const FormTitle = styled('h2')({
    fontSize: '1.625rem',
    fontWeight: 800,
    color: '#111',
    margin: '0 0 0.5rem',
    letterSpacing: '-0.02em',
});

const FormSub = styled('p')({
    fontSize: '0.9375rem',
    color: '#777',
    lineHeight: 1.65,
    margin: 0,
});

const Divider = styled('div')({
    height: 1,
    background: '#f0f0f0',
    margin: '1.5rem 0',
});

const ResendLabel = styled('p')({
    fontSize: '0.8125rem',
    color: '#888',
    fontWeight: 600,
    margin: '0 0 0.625rem',
});

const FieldInput = styled('input')({
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '0.625rem',
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fafafa',
    marginBottom: '0.625rem',
    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
    '&:focus': {
        borderColor: '#c0392b',
        background: '#fff',
        boxShadow: '0 0 0 3px rgba(192,57,43,0.1)',
    },
});

const Msg = styled('p')(({ success }) => ({
    fontSize: '0.8125rem',
    color: success ? '#27ae60' : '#c0392b',
    margin: '0 0 0.625rem',
}));

const SubmitBtn = styled('button')({
    width: '100%',
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.875rem 0',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { background: '#a93226' },
    '&:disabled': { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' },
});

const LoginLink = styled(Link)({
    display: 'block',
    marginTop: '1.25rem',
    textAlign: 'center',
    color: '#888',
    fontSize: '0.875rem',
    textDecoration: 'none',
    '&:hover': { color: '#c0392b' },
});
