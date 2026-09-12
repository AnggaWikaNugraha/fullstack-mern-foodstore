import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';

export default function ResendForm({ emailField, emailError, isSubmitting, notice, onSubmit }) {
    return (
        <section className="verification-resend" aria-labelledby="resend-title">
            <h2 id="resend-title">Belum menerima email?</h2>
            <p className="verification-resend-intro">Masukkan email yang kamu gunakan saat mendaftar untuk mengirim ulang link.</p>
            <form className="auth-form" onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
                <div className="auth-field">
                    <label htmlFor="resend-email">Email</label>
                    <input id="resend-email" type="email" autoComplete="email" placeholder="nama@email.com"
                        {...emailField} readOnly={isSubmitting} aria-invalid={!!emailError}
                        aria-describedby={emailError ? 'resend-email-error' : undefined} />
                    {emailError && <p className="auth-field-error" id="resend-email-error" role="alert">{emailError.message}</p>}
                </div>
                {notice && <p className={notice.error ? 'auth-error' : 'verification-success'} role={notice.error ? 'alert' : 'status'}>{notice.message}</p>}
                <button className="auth-submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><span className="auth-spinner" /> Mengirim...</> : <>Kirim ulang link <StoreIcon name="arrow" size={18} /></>}
                </button>
            </form>
            <p className="auth-register">Sudah verifikasi? <Link to="/login">Masuk sekarang</Link></p>
        </section>
    );
}
