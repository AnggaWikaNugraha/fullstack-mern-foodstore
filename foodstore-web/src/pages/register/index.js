import React from 'react';
import AuthLayout from '../../component/AuthLayout';
import useRegisterForm from './_hooks/useRegisterForm';
import useGoogleRegister from './_hooks/useGoogleRegister';
import RegisterBrand from './_components/RegisterBrand';
import RegisterForm from './_components/RegisterForm';
import GoogleRegister from './_components/GoogleRegister';
import './register.css';

export default function Register() {
    const form = useRegisterForm();
    const google = useGoogleRegister();

    return (
        <AuthLayout className="register-page" brand={<RegisterBrand />} titleId="register-title">
            <span className="auth-eyebrow">MULAI CERITA ENAKMU</span>
            <h1 id="register-title">Buat akun, <em>temukan favoritmu.</em></h1>
            <p className="auth-intro">Daftar gratis untuk menyimpan menu favorit dan mulai memesan.</p>
            <RegisterForm {...form} />
            <GoogleRegister {...google} />
        </AuthLayout>
    );
}
