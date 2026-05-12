import * as React from 'react';
import { InputText, Button, FormControl, Card, LayoutSidebar } from 'upkit';
import { useForm } from 'react-hook-form';
import { useHistory, Link } from 'react-router-dom';
import AppSidebar from '../../component/AppSidebar';

import { useDispatch } from 'react-redux';
import { userLogin } from '../../features/Auth/actions';
import { login } from '../../api/auth';

const statuslist = {
    idle: 'idle',
    process: 'process',
    success: 'success',
    error: 'error',
}

export default function Login() {
    const { register, handleSubmit } = useForm();
    const [status, setStatus] = React.useState(statuslist.idle);
    const dispatch = useDispatch();
    const history = useHistory();
    // (1) fungsi untuk menangani submit form
    const onSubmit = async ({ email, password }) => {

        // (2) set status menjadi `process`
        setStatus(statuslist.process);

        // (3) kirim data ke Web API menggunakan helper `login`
        let response = await login(email, password);
        console.log(response)
        // (4) cek apakah server mengembalikan error
        if (response.data.error) {

            // (6) set status menjadi `error`
            setStatus(statuslist.error);
            alert('error sandi or email wrong !')

        } else {

            // (7) BERHASIL LOGIN 

            // (8) ambil data `user` dan `token` dari respon server
            let { user, token } = response.data;

            // (9) dispatch ke Redux store, action `userLogin` dengan data `user` dan `token`
            dispatch(userLogin(user, token));

            // (10) redirect ke halaman home
            history.push('/');
        }

        setStatus(statuslist.success);
    }

    return (
        <LayoutSidebar
            sidebar={<AppSidebar />}
            sidebarSize={80}
            content={
                <div className="flex justify-center items-start pt-16 min-h-screen bg-gray-50">
                    <div className="w-full max-w-sm px-4">
                        <Card color="white">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <FormControl>
                                    <InputText
                                        name="email"
                                        placeholder="Email"
                                        fitContainer
                                        {...register('email')}
                                    />
                                </FormControl>
                                <FormControl>
                                    <InputText
                                        name="password"
                                        placeholder="Password"
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
                    </div>
                </div>
            }
        />
    )

}