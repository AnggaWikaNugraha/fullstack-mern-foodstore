import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { login } from '../../../api/auth';
import { userLogin } from '../../../features/Auth/actions';
import { rules } from '../validation';

export default function useLoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const pending = useRef(false);
    const dispatch = useDispatch();
    const history = useHistory();

    const onSubmit = handleSubmit(async ({ email, password }) => {
        if (pending.current) return;
        pending.current = true;
        setIsSubmitting(true);
        setError('');

        try {
            const { data } = await login(email.trim(), password);
            if (data?.error) {
                if (data.message === 'email_not_verified') {
                    history.push('/cek-email');
                } else {
                    setError('Email atau password salah. Silakan coba lagi.');
                }
                return;
            }
            if (!data?.user || !data?.token) {
                setError('Belum berhasil masuk. Silakan coba lagi.');
                return;
            }
            dispatch(userLogin(data.user, data.token));
            history.push('/');
        } catch (requestError) {
            const response = requestError.response;
            if (response?.data?.message === 'email_not_verified') {
                history.push('/cek-email');
            } else if (response?.status === 401) {
                setError('Email atau password salah. Silakan coba lagi.');
            } else {
                setError('Belum bisa terhubung ke server. Silakan coba lagi.');
            }
        } finally {
            pending.current = false;
            setIsSubmitting(false);
        }
    });

    return {
        emailField: register('email', rules.email),
        passwordField: register('password', rules.password),
        errors,
        error,
        isSubmitting,
        onSubmit,
        showPassword,
        togglePassword: () => setShowPassword((visible) => !visible),
    };
}
