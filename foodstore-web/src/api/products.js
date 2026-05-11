import axios from 'axios';
import { config } from '../config';

function getToken() {
    let { token } = localStorage.getItem('auth')
        ? JSON.parse(localStorage.getItem('auth'))
        : {};
    return token;
}

export async function getProducts(params) {
    return await axios.get(`${config.api_host}/api/products`, { params });
}

export async function createProduct(formData) {
    return await axios.post(`${config.api_host}/api/products`, formData, {
        headers: {
            authorization: `Bearer ${getToken()}`,
            'Content-Type': 'multipart/form-data',
        },
    });
}

export async function updateProduct(id, formData) {
    return await axios.put(`${config.api_host}/api/products/${id}`, formData, {
        headers: {
            authorization: `Bearer ${getToken()}`,
            'Content-Type': 'multipart/form-data',
        },
    });
}

export async function deleteProduct(id) {
    return await axios.delete(`${config.api_host}/api/products/${id}`, {
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    });
}
