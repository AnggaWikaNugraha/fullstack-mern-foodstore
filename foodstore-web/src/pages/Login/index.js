import * as React from 'react';
import { InputText, InputPassword, Button, FormControl, Card, LayoutOne } from 'upkit';
import { useForm } from 'react-hook-form';
import { useHistory, Redirect, Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../../features/Auth/actions';
import { rules } from './validation';
import { login } from '../../api/auth';

const statuslist = {
    idle: 'idle',
    process: 'process',
    success: 'success',
    error: 'error',
}

export default function Login() {
    const { register, handleSubmit, errors, setError } = useForm();
    const [status, setStatus] = React.useState(statuslist.idle);
    const dispatch = useDispatch();
    const history = useHistory();
    // (1) fungsi untuk menangani submit form
    const onSubmit = async ({ email, password }) => {

        // (2) set status menjadi `process`
        setStatus(statuslist.process);

        // (3) kirim data ke Web API menggunakan helper `login`
        let respones = await login(email, password);

        // (4) cek apakah server mengembalikan error
        if (respones !== 200) {

            // (6) set status menjadi `error`
            setStatus(statuslist.error);
            alert('error sandi or email wrong !')

        } else {

            // (7) BERHASIL LOGIN 

            // (8) ambil data `user` dan `token` dari respon server
            let { user, token } = data;

            // (9) dispatch ke Redux store, action `userLogin` dengan data `user` dan `token`
            dispatch(userLogin(user, token));

            // (10) redirect ke halaman home
            history.push('/');
        }

        setStatus(statuslist.success);
    }

    return (
        <LayoutOne size="small">
            <br />
            <Card color="white">


                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* gunakan ref={register} */}
                    <FormControl>
                        <InputText
                            name="email"
                            placeholder="email"
                            fitContainer
                            {...register('email')}
                        />
                    </FormControl>

                    {/* gunakan ref={register} */}
                    <FormControl>
                        <InputText
                            name="password"
                            placeholder="password"
                            fitContainer
                            {...register('password')}
                        />
                    </FormControl>

                    <Button fitContainer size="large" disabled={status === 'process'}>
                        Login
              </Button>
                </form>

                <div className="text-center mt-2">
                    Belum punya akun? <Link to="/register"><b>Daftar sekarang.</b></Link>
                </div>
            </Card>
        </LayoutOne>
    )

}