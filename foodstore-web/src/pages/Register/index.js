import * as React from 'react';
// (1) import LayoutOne
import {
    LayoutOne,
    Card,
    FormControl,
    InputText,
    InputPassword,
    Button
} from 'upkit';
import { useForm } from 'react-hook-form';
import { rules } from './validations';
import { useHistory, Link } from "react-router-dom";
const statuslist = {
    idle: "idle",
    process: "process",
    success: "success",
    error: "error",
};

export default function Register() {

    // (2) keluarkan fungsi yang diperlukan dari useForm
    let { register, handleSubmit, errors, setError } = useForm();
    let [status, setStatus] = React.useState(statuslist.idle);

    // (1) buat fungsi untuk menangani form submit 
    const onSubmit = async formData => {
    }

    return (
        <LayoutOne size="small">
            <Card color="white">
                <div className="text-center mb-5">
                    {/* <StoreLogo /> */}
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl errorMessage={errors.full_name?.message}>
                        <InputText
                            name="full_name"
                            placeholder="Nama Lengkap"
                            fitContainer
                            ref={register(rules.full_name)}
                        />
                    </FormControl>
                    <FormControl errorMessage={errors.email?.message}>
                        <InputText
                            name="email"
                            placeholder="Email"
                            fitContainer
                            ref={register(rules.email)}
                        />
                    </FormControl>
                    <FormControl errorMessage={errors.password?.message}>
                        <InputPassword
                            name="password"
                            placeholder="Password"
                            fitContainer
                            ref={register(rules.password)}
                        />
                    </FormControl>
                    <FormControl errorMessage={errors.password_confirmation?.message}>
                        <InputPassword
                            name="password_confirmation"
                            placeholder="Konfirmasi Password"
                            fitContainer
                            ref={register(rules.password_confirmation)}
                        />
                    </FormControl>
                    <Button
                        size="large"
                        fitContainer
                        disabled={status === statuslist.process}
                    >
                        {" "}
                        {status === statuslist.process
                            ? "Sedang memproses"
                            : "Mendaftar"}{" "}
                    </Button>
                </form>
            </Card>
            <div className="text-center mt-2">
                Sudah punya akun?{" "}
                <Link to="/login">
                    {" "}
                    <b> Masuk Sekarang. </b>{" "}
                </Link>
            </div>
        </LayoutOne>
    )
}
