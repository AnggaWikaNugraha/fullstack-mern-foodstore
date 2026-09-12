import React from 'react';

export default function PasswordField({ id, label, field, error, visible, onToggle, readOnly, autoComplete, placeholder, hint }) {
    const descriptions = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

    return (
        <div className="auth-field">
            <label htmlFor={id}>{label}</label>
            <div className="auth-password-wrap">
                <input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete}
                    placeholder={placeholder} {...field} readOnly={readOnly}
                    aria-invalid={!!error} aria-describedby={descriptions} />
                <button className="auth-password-toggle" type="button" onClick={onToggle}
                    aria-label={`${visible ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`} aria-pressed={visible}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
                        {visible && <path d="m3 3 18 18" />}
                    </svg>
                </button>
            </div>
            {hint && <p className="register-password-hint" id={`${id}-hint`}>{hint}</p>}
            {error && <p className="auth-field-error" id={`${id}-error`} role="alert">{error.message}</p>}
        </div>
    );
}
