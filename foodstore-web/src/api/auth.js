import axios from 'axios';
import { config } from '../config';

export async function registerUser(data) {

    return await axios.post(`${config.api_host}/auth/register`, data);
}

export async function login(email, password) {

    return await axios.post(`${config.api_host}/auth/login`, { email, password });
}

export async function getMe(token) {
    return await axios.get(`${config.api_host}/auth/me`, {
        headers: { authorization: `Bearer ${token}` }
    });
}

export async function setPassword(data) {
    const auth = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')) : {};
    return await axios.put(`${config.api_host}/api/users/set-password`, data, {
        headers: { authorization: `Bearer ${auth.token}` }
    });
}

export async function logout() {

    let { token } = localStorage.getItem('auth')
        ? JSON.parse(localStorage.getItem('auth'))
        : {};

    return await axios.post(`${config.api_host}/auth/logout`, null, {
        headers: { authorization: `Bearer ${token}` }
    }).then((response) => {
        localStorage.removeItem('auth');
        return response;
    });
}