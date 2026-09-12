import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../StoreIcon';
import '../Topbar/storefront-header.css';

export default function AuthHeader() {
    return (
        <header className="auth-header">
            <Link to="/" className="store-brand" aria-label="FoodStore beranda">
                <span className="store-brand-mark"><StoreIcon name="dish" size={25} /></span>
                Food<span>Store<span className="store-brand-dot">.</span></span>
            </Link>
            <Link className="auth-back" to="/">
                <StoreIcon name="arrow" size={17} /> Kembali ke beranda
            </Link>
        </header>
    );
}
