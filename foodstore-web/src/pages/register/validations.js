export const rules = {
    full_name: {
        required: 'Nama lengkap harus diisi.',
        minLength: { value: 3, message: 'Nama lengkap minimal 3 karakter.' },
        maxLength: { value: 255, message: 'Nama lengkap maksimal 255 karakter.' },
        setValueAs: (value) => value.trim(),
    },
    email: {
        required: 'Email harus diisi.',
        maxLength: { value: 255, message: 'Email maksimal 255 karakter.' },
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Masukkan alamat email yang valid.' },
        setValueAs: (value) => value.trim(),
    },
    password: {
        required: 'Password harus diisi.',
        minLength: { value: 6, message: 'Password minimal 6 karakter.' },
        maxLength: { value: 255, message: 'Password maksimal 255 karakter.' },
        deps: ['password_confirmation'],
    },
    password_confirmation: {
        required: 'Konfirmasi password harus diisi.',
    },
};
