import { useLocation } from 'react-router-dom';
import { config } from '../../../config';

export default function useGoogleLogin() {
    const { search } = useLocation();
    const failed = new URLSearchParams(search).get('error') === 'google_failed';

    return {
        href: `${config.api_host}/auth/google`,
        error: failed ? 'Login Google belum berhasil. Coba lagi atau masuk dengan email.' : '',
    };
}
