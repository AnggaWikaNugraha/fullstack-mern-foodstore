import React from 'react';
import { Link } from 'react-router-dom';
import GoogleAuth from '../../../component/AuthLayout/GoogleAuth';

export default function GoogleRegister(props) {
    return (
        <GoogleAuth {...props} label="Daftar dengan Google">
            Sudah punya akun? <Link to="/login">Masuk sekarang</Link>
        </GoogleAuth>
    );
}
