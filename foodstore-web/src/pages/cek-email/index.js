import React from 'react';
import AuthLayout from '../../component/AuthLayout';
import useResendVerification from './_hooks/useResendVerification';
import VerificationBrand from './_components/VerificationBrand';
import VerificationGuide from './_components/VerificationGuide';
import ResendForm from './_components/ResendForm';
import './cek-email.css';

export default function CekEmail() {
    const resend = useResendVerification();

    return (
        <AuthLayout className="verify-email-page" brand={<VerificationBrand />} titleId="cek-email-title">
            <VerificationGuide />
            <ResendForm {...resend} />
        </AuthLayout>
    );
}
