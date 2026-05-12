import * as React from 'react';

// (1) import InputPassword & Button
import { LayoutSidebar, Card, FormControl, InputText, InputPassword, Button } from 'upkit';
import { useForm } from 'react-hook-form';
import { registerUser } from '../../api/auth';
import { useHistory } from "react-router-dom";
import AppSidebar from '../../component/AppSidebar';
const statuslist = {
    idle: 'idle',
    process: 'process',
    success: 'success',
    error: 'error',
}

export default function Register() {
    // (2) keluarkan fungsi `register`, `handleSubmit`, `errors`, `setError` dari `useForm`
    let { register, handleSubmit } = useForm();
    let [, setStatus] = React.useState(statuslist.idle);
    let history = useHistory();
    // (1) buat fungsi untuk menangani form submit 
    const onSubmit = async formData => {
        let respones = await registerUser(formData);
        if (respones.status === 200) {
            setStatus(statuslist.success)
            // (1) redirect ke `register/berhasil`
            history.push("/register/berhasil");
        } else {
            setStatus(statuslist.error)
            alert('error sandi or email wrong !')
        }
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
                                        name="full_name"
                                        placeholder="Nama Lengkap"
                                        fitContainer
                                        {...register('full_name')}
                                    />
                                </FormControl>
                                <FormControl>
                                    <InputText
                                        name="email"
                                        placeholder="Email"
                                        fitContainer
                                        {...register('email')}
                                    />
                                </FormControl>
                                <FormControl>
                                    <InputPassword
                                        name="password"
                                        placeholder="Password"
                                        fitContainer
                                        {...register('password')}
                                    />
                                </FormControl>
                                <FormControl>
                                    <InputPassword
                                        name="password_confirmation"
                                        placeholder="Konfirmasi Password"
                                        fitContainer
                                        {...register('password_confirmation')}
                                    />
                                </FormControl>
                                <Button size="large" fitContainer>Mendaftar</Button>
                            </form>
                        </Card>
                    </div>
                </div>
            }
        />
    )
}