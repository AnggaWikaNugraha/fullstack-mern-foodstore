import React from 'react';
import useLoginForm from './_hooks/useLoginForm';
import useGoogleLogin from './_hooks/useGoogleLogin';
import AuthLayout from '../../component/AuthLayout';
import LoginBrand from './_components/LoginBrand';
import LoginForm from './_components/LoginForm';
import GoogleLogin from './_components/GoogleLogin';

export default function Login() {
    const form = useLoginForm();
    const google = useGoogleLogin();

    return (
        <AuthLayout brand={<LoginBrand />} titleId="login-title">
            <span className="auth-eyebrow">SENANG BERTEMU LAGI</span>
            <h1 id="login-title">Selamat datang <em>kembali.</em></h1>
            <p className="auth-intro">Masuk dulu, lalu temukan menu yang bikin harimu lebih enak.</p>
            <LoginForm {...form} />
            <GoogleLogin {...google} />
        </AuthLayout>
    );
}
