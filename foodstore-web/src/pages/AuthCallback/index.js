import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLogin } from '../../features/Auth/actions';
import { getMe } from '../../api/auth';

export default function AuthCallback() {
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error || !token) {
            history.replace('/login?error=google_failed');
            return;
        }

        // ambil data user dari backend menggunakan token
        getMe(token)
            .then(({ data }) => {
                if (data?.error) {
                    history.replace('/login?error=google_failed');
                    return;
                }
                dispatch(userLogin(data, token));
                history.replace('/');
            })
            .catch(() => history.replace('/login?error=google_failed'));

    }, [dispatch, history, location.search]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ color: '#888' }}>Memproses login Google...</p>
            </div>
        </div>
    );
}
