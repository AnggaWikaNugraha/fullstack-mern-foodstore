import React from 'react';
import AuthHeader from './AuthHeader';
import './auth.css';

export default function AuthLayout({ brand, children, className = '', titleId }) {
    return (
        <div className={`auth-page ${className}`}>
            <AuthHeader />
            <main className="auth-main">
                <div className="auth-layout">
                    {brand}
                    <section className="auth-card" aria-labelledby={titleId}>{children}</section>
                </div>
            </main>
            <footer className="auth-footer">
                <span>© {new Date().getFullYear()} FoodStore</span>
                <span>Seporsi bahagia, setiap hari.</span>
            </footer>
        </div>
    );
}
