import { useLocation } from 'react-router-dom';
import { config } from '../../../config';

export default function useGoogleRegister() {
    const { search } = useLocation();
    const failed = new URLSearchParams(search).get('error') === 'google_failed';

    return {
        href: `${config.api_host}/auth/google`,
        error: failed ? 'Pendaftaran Google belum berhasil. Coba lagi atau daftar dengan email.' : '',
    };
}
