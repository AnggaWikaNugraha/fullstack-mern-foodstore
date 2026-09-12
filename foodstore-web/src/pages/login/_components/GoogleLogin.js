import React from 'react';
import { Link } from 'react-router-dom';
import GoogleAuth from '../../../component/AuthLayout/GoogleAuth';

export default function GoogleLogin(props) {
    return (
        <GoogleAuth {...props} label="Masuk dengan Google">
            Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </GoogleAuth>
    );
}
