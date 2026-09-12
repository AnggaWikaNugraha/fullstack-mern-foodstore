import React from 'react';
import StoreIcon from '../../../component/StoreIcon';
import PasswordField from '../../../component/AuthLayout/PasswordField';

export default function RegisterForm({ nameField, emailField, passwordField, confirmationField, errors, error, isSubmitting, onSubmit, visiblePasswords, togglePassword }) {
    return (
        <form className="auth-form" onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <div className="auth-field">
                <label htmlFor="register-name">Nama lengkap</label>
                <input id="register-name" type="text" autoComplete="name" placeholder="Nama lengkap kamu"
                    {...nameField} readOnly={isSubmitting} aria-invalid={!!errors.full_name}
                    aria-describedby={errors.full_name ? 'register-name-error' : undefined} />
                {errors.full_name && <p className="auth-field-error" id="register-name-error" role="alert">{errors.full_name.message}</p>}
            </div>
            <div className="auth-field">
                <label htmlFor="register-email">Email</label>
                <input id="register-email" type="email" autoComplete="email" placeholder="nama@email.com"
                    {...emailField} readOnly={isSubmitting} aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'register-email-error' : undefined} />
                {errors.email && <p className="auth-field-error" id="register-email-error" role="alert">{errors.email.message}</p>}
            </div>
            <PasswordField id="register-password" label="Password" field={passwordField} error={errors.password}
                visible={visiblePasswords.password} onToggle={() => togglePassword('password')} readOnly={isSubmitting}
                autoComplete="new-password" placeholder="Buat password" hint="Gunakan minimal 6 karakter." />
            <PasswordField id="register-confirmation" label="Konfirmasi password" field={confirmationField} error={errors.password_confirmation}
                visible={visiblePasswords.password_confirmation} onToggle={() => togglePassword('password_confirmation')} readOnly={isSubmitting}
                autoComplete="new-password" placeholder="Ulangi password" />
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><span className="auth-spinner" /> Mendaftar...</> : <>Daftar sekarang <StoreIcon name="arrow" size={18} /></>}
            </button>
        </form>
    );
}
