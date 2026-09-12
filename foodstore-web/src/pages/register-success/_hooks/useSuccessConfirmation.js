import { useLocation } from 'react-router-dom';

export default function useSuccessConfirmation() {
    const { state } = useLocation();
    const email = typeof state?.email === 'string' ? state.email.trim() : '';

    return {
        email,
        loginTo: '/login',
        verificationTo: { pathname: '/cek-email', state: email ? { email } : undefined },
    };
}
