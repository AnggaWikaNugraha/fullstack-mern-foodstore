import React from 'react';
import StoreIcon from '../../../component/StoreIcon';
import PasswordField from '../../../component/AuthLayout/PasswordField';

export default function LoginForm({ emailField, passwordField, errors, error, isSubmitting, onSubmit, showPassword, togglePassword }) {
    return (
        <form className="auth-form" onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <div className="auth-field">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" type="email" autoComplete="username" placeholder="nama@email.com"
                    {...emailField} readOnly={isSubmitting} aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'login-email-error' : undefined} />
                {errors.email && <p className="auth-field-error" id="login-email-error" role="alert">{errors.email.message}</p>}
            </div>
            <PasswordField id="login-password" label="Password" field={passwordField} error={errors.password}
                visible={showPassword} onToggle={togglePassword} readOnly={isSubmitting}
                autoComplete="current-password" placeholder="Masukkan password" />
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><span className="auth-spinner" /> Memproses...</> : <>Masuk <StoreIcon name="arrow" size={18} /></>}
            </button>
        </form>
    );
}
