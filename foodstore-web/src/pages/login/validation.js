const rules = {
    email: {
        required: { value: true, message: 'Email tidak boleh kosong.' },
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Masukkan alamat email yang valid.' },
        maxLength: { value: 255, message: 'Panjang email maksimal 255 karakter' }
    },
    password: {
        required: { value: true, message: 'Password tidak boleh kosong.' },
        maxLength: { value: 255, message: 'Panjang password maksimal 255 karakter.' }
    }
}

export {
    rules
}
