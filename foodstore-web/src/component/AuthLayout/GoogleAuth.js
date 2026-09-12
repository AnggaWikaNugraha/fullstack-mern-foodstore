import React from 'react';

export default function GoogleAuth({ href, error, label, children }) {
    return (
        <div className="auth-alternatives">
            <div className="auth-divider"><span>atau lanjutkan dengan</span></div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <a className="auth-google" href={href}>
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.01v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z" />
                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
                    <path fill="#FBBC05" d="M6.4 13.91a6 6 0 0 1 0-3.82V7.5H3.06a10 10 0 0 0 0 9l3.34-2.59Z" />
                    <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.34 2.59C7.19 7.73 9.4 5.97 12 5.97Z" />
                </svg>
                {label}
            </a>
            <p className="auth-register">{children}</p>
        </div>
    );
}
