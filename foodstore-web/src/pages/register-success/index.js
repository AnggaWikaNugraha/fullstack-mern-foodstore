import React from 'react';
import AuthLayout from '../../component/AuthLayout';
import useSuccessConfirmation from './_hooks/useSuccessConfirmation';
import SuccessBrand from './_components/SuccessBrand';
import SuccessConfirmation from './_components/SuccessConfirmation';
import './register-success.css';

export default function RegisterSuccess() {
    const confirmation = useSuccessConfirmation();

    return (
        <AuthLayout className="register-success-page" brand={<SuccessBrand />} titleId="register-success-title">
            <SuccessConfirmation {...confirmation} />
        </AuthLayout>
    );
}
