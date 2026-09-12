import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../../../api/auth';
import { rules } from '../validations';

export default function useRegisterForm() {
    const { register, handleSubmit, getValues, setError: setFieldError, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [visiblePasswords, setVisiblePasswords] = useState({ password: false, password_confirmation: false });
    const pending = useRef(false);
    const history = useHistory();

    function showServerErrors(data) {
        const fields = Object.entries(data?.fields || {}).filter(([field, detail]) =>
            Object.prototype.hasOwnProperty.call(rules, field) && typeof detail?.message === 'string'
        );
        fields.forEach(([field, detail], index) => {
            setFieldError(field, { type: 'server', message: detail.message }, { shouldFocus: index === 0 });
        });
        setError(fields.length ? 'Periksa kembali data yang ditandai di bawah.' :
            typeof data?.message === 'string' ? data.message : 'Belum berhasil mendaftar. Silakan coba lagi.');
    }

    const onSubmit = handleSubmit(async ({ full_name, email, password, password_confirmation }) => {
        if (pending.current) return;
        pending.current = true;
        setIsSubmitting(true);
        setError('');
        try {
            const response = await registerUser({ full_name, email, password, password_confirmation });
            if (response.status >= 200 && response.status < 300 && response.data && !response.data.error) {
                history.push('/cek-email', { email });
            } else {
                showServerErrors(response.data);
            }
        } catch (requestError) {
            if (requestError.response?.data?.error || requestError.response?.data?.fields) {
                showServerErrors(requestError.response.data);
            } else {
                setError(requestError.response
                    ? 'Belum berhasil mendaftar. Silakan coba lagi.'
                    : 'Belum bisa terhubung ke server. Silakan coba lagi.');
            }
        } finally {
            pending.current = false;
            setIsSubmitting(false);
        }
    });

    return {
        nameField: register('full_name', rules.full_name),
        emailField: register('email', rules.email),
        passwordField: register('password', rules.password),
        confirmationField: register('password_confirmation', {
            ...rules.password_confirmation,
            validate: (value) => value === getValues('password') || 'Konfirmasi password belum sama.',
        }),
        errors, error, isSubmitting, onSubmit, visiblePasswords,
        togglePassword: (field) => setVisiblePasswords((visible) => ({ ...visible, [field]: !visible[field] })),
    };
}
