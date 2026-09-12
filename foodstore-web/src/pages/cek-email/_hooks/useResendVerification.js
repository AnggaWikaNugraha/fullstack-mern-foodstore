import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { resendVerification } from '../../../api/auth';

export default function useResendVerification() {
    const { state } = useLocation();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: typeof state?.email === 'string' ? state.email : '' },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notice, setNotice] = useState(null);
    const pending = useRef(false);

    const onSubmit = handleSubmit(async ({ email }) => {
        if (pending.current) return;
        pending.current = true;
        setIsSubmitting(true);
        setNotice(null);
        try {
            const { data } = await resendVerification(email);
            if (data?.error) {
                setNotice({ error: true, message: typeof data.message === 'string'
                    ? data.message : 'Link belum berhasil dikirim. Silakan coba lagi.' });
            } else if (typeof data?.message === 'string') {
                setNotice({ error: false, message: `Link verifikasi sudah dikirim ulang ke ${email}. Cek inbox atau folder spam kamu.` });
            } else {
                setNotice({ error: true, message: 'Link belum berhasil dikirim. Silakan coba lagi.' });
            }
        } catch (requestError) {
            const message = requestError.response?.data?.message;
            setNotice({ error: true, message: typeof message === 'string' ? message
                : 'Belum bisa mengirim link verifikasi. Periksa koneksimu dan coba lagi.' });
        } finally {
            pending.current = false;
            setIsSubmitting(false);
        }
    }, () => setNotice(null));

    const emailField = register('email', {
        required: 'Email harus diisi.',
        maxLength: { value: 255, message: 'Email maksimal 255 karakter.' },
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Masukkan alamat email yang valid.' },
        setValueAs: (value) => value.trim(),
    });

    return {
        emailField: {
            ...emailField,
            onChange: (event) => {
                setNotice(null);
                return emailField.onChange(event);
            },
        },
        emailError: errors.email,
        isSubmitting, notice, onSubmit,
    };
}
