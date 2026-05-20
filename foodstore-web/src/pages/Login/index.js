import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';
import { userLogin } from '../../features/Auth/actions';
import { login } from '../../api/auth';
import { config } from '../../config';

export default function Login() {
    const { register, handleSubmit } = useForm();
    const [status, setStatus] = React.useState('idle');
    const [error, setError] = React.useState('');
    const dispatch = useDispatch();
    const history  = useHistory();

    const onSubmit = async ({ email, password }) => {
        setStatus('process');
        setError('');
        const response = await login(email, password);
        if (response.data.error) {
            setStatus('error');
            if (response.data.message === 'email_not_verified') {
                history.push('/cek-email');
            } else {
                setError('Email atau password salah.');
            }
        } else {
            const { user, token } = response.data;
            dispatch(userLogin(user, token));
            history.push('/');
        }
    };

    return (
        <PageBg>
            {/* ── Brand panel ── */}
            <BrandPanel>
                <BrandDecorTop />
                <BrandDecorBottom />
                <BrandContent>
                    <BrandLogo>🍱</BrandLogo>
                    <BrandName>FoodStore</BrandName>
                    <BrandTagline>Pesan makanan favoritmu,<br />kapan saja &amp; di mana saja.</BrandTagline>
                    <BrandDivider />
                    <BrandFeatures>
                        <BrandFeatureItem>✓ &nbsp;Pengiriman cepat ke seluruh kota</BrandFeatureItem>
                        <BrandFeatureItem>✓ &nbsp;Ratusan menu lezat tersedia</BrandFeatureItem>
                        <BrandFeatureItem>✓ &nbsp;Promo &amp; diskon setiap hari</BrandFeatureItem>
                    </BrandFeatures>
                </BrandContent>
            </BrandPanel>

            {/* ── Form panel ── */}
            <FormPanel>
                <FormScroll>
                    <FormCard>
                        <FormTitle>Masuk</FormTitle>
                        <FormSub>Selamat datang kembali! 👋</FormSub>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {error && <ErrorMsg>{error}</ErrorMsg>}

                            <FieldGroup>
                                <FieldLabel>Email</FieldLabel>
                                <FieldInput
                                    type="email"
                                    placeholder="nama@email.com"
                                    {...register('email')}
                                />
                            </FieldGroup>

                            <FieldGroup>
                                <FieldLabel>Password</FieldLabel>
                                <FieldInput
                                    type="password"
                                    placeholder="Masukkan password"
                                    {...register('password')}
                                />
                            </FieldGroup>

                            <SubmitBtn type="submit" disabled={status === 'process'}>
                                {status === 'process' ? 'Memproses...' : 'Masuk'}
                            </SubmitBtn>
                        </form>

                        <Divider>
                            <DividerLine /><DividerText>atau</DividerText><DividerLine />
                        </Divider>

                        <GoogleBtn href={`${config.api_host}/auth/google`}>
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                style={{ width: 18, height: 18 }}
                            />
                            Login dengan Google
                        </GoogleBtn>

                        <FooterText>
                            Belum punya akun? <FooterLink to="/register">Daftar sekarang</FooterLink>
                        </FooterText>
                    </FormCard>
                </FormScroll>
            </FormPanel>
        </PageBg>
    );
}

/* ─── Layout ────────────────────────────────────────────────────────────────── */

const PageBg = styled('div')({
    height: 'calc(100vh - 3.75rem)',
    overflow: 'hidden',
    display: 'flex',
});

/* ─── Brand panel (left) ─────────────────────────────────────────────────── */

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
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
    pointerEvents: 'none',
});

const BrandDecorBottom = styled('div')({
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
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

const BrandLogo = styled('div')({
    fontSize: 56,
    marginBottom: '1rem',
});

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
    width: 40,
    height: 3,
    background: 'rgba(255,255,255,0.4)',
    borderRadius: 99,
    marginBottom: '1.25rem',
});

const BrandFeatures = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
});

const BrandFeatureItem = styled('div')({
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.8)',
});

/* ─── Form panel (right) ─────────────────────────────────────────────────── */

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
    maxWidth: 400,
    '@media (max-width: 768px)': {
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
    },
});

const FormTitle = styled('h2')({
    fontSize: '1.625rem',
    fontWeight: 800,
    color: '#111',
    margin: '0 0 0.25rem',
    letterSpacing: '-0.02em',
});

const FormSub = styled('p')({
    fontSize: '0.9375rem',
    color: '#999',
    margin: '0 0 1.75rem',
});

/* ─── Form fields ────────────────────────────────────────────────────────── */

const FieldGroup = styled('div')({
    marginBottom: '1rem',
});

const FieldLabel = styled('label')({
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#444',
    marginBottom: '0.375rem',
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
    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
    '&:focus': {
        borderColor: '#c0392b',
        background: '#fff',
        boxShadow: '0 0 0 3px rgba(192,57,43,0.1)',
    },
});

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
    marginTop: '0.5rem',
    transition: 'background 0.15s',
    '&:hover': { background: '#a93226' },
    '&:disabled': { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' },
});

const Divider = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    margin: '1.25rem 0',
});

const DividerLine = styled('div')({
    flex: 1,
    height: 1,
    background: '#f0f0f0',
});

const DividerText = styled('span')({
    fontSize: '0.8125rem',
    color: '#bbb',
    flexShrink: 0,
});

const GoogleBtn = styled('a')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
    width: '100%',
    padding: '0.75rem 0',
    border: '1px solid #e0e0e0',
    borderRadius: '0.625rem',
    background: '#fff',
    color: '#333',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    boxSizing: 'border-box',
    transition: 'background 0.15s, border-color 0.15s',
    '&:hover': { background: '#f9f9f9', borderColor: '#ccc' },
});

const FooterText = styled('div')({
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '0.875rem',
    color: '#888',
});

const FooterLink = styled(Link)({
    color: '#c0392b',
    fontWeight: 700,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
});

const ErrorMsg = styled('div')({
    background: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #fed7d7',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.8125rem',
    marginBottom: '1rem',
});
