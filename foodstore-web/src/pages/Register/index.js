import * as React from 'react';

// (1) import InputPassword & Button
import { LayoutOne, Card, FormControl, InputText, InputPassword, Button } from 'upkit';
// (1) import useForm
import { useForm } from 'react-hook-form';
import { registerUser } from '../../api/auth';
import { useHistory, Link } from "react-router-dom";
const statuslist = {
    idle: 'idle',
    process: 'process',
    success: 'success',
    error: 'error',
}

export default function Register() {
    // (2) keluarkan fungsi `register`, `handleSubmit`, `errors`, `setError` dari `useForm`
    let { register, handleSubmit, errors, setError } = useForm();
    // (2) state status dengan nilai default `statuslist.idle`
    let [status, setStatus] = React.useState(statuslist.idle);
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
        }
    }

    return (

        <LayoutOne size="small">

            <Card color="white">
                {/* (4) gunakan onSubmit dengan terlebih dahulu dimasukan dalam handleSubmit */}
                <form onSubmit={handleSubmit(onSubmit)}>

                    {/* gunakan ref={register} */}
                    <FormControl>
                        <InputText
                            name="full_name"
                            placeholder="Nama Lengkap"
                            fitContainer
                            {...register('full_name')}
                        />
                    </FormControl>

                    {/* gunakan ref={register} */}
                    <FormControl>
                        <InputText
                            name="email"
                            placeholder="Email"
                            fitContainer
                            {...register('email')}
                        />
                    </FormControl>

                    {/* gunakan ref={register} */}
                    <FormControl>
                        <InputPassword
                            name="password"
                            placeholder="Password"
                            fitContainer
                            {...register('password')}
                        />
                    </FormControl>

                    {/* gunakan ref={register} */}
                    <FormControl>
                        <InputPassword
                            name="password_confirmation"
                            placeholder="Konfirmasi Password"
                            fitContainer
                            {...register('password_confirmation')}

                        />
                    </FormControl>

                    <Button
                        size="large"
                        fitContainer
                    > Mendaftar </Button>

                </form>
            </Card>

        </LayoutOne>
    )
}