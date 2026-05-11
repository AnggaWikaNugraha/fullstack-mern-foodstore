import axios from 'axios';
import { config } from '../config';

function getToken() {
    let { token } = localStorage.getItem('auth')
        ? JSON.parse(localStorage.getItem('auth'))
        : {};
    return token;
}

export async function getTags(params) {
    return await axios.get(`${config.api_host}/api/tags`, { params });
}

export async function createTag(payload) {
    return await axios.post(`${config.api_host}/api/tags`, payload, {
        headers: { authorization: `Bearer ${getToken()}` },
    });
}

export async function updateTag(id, payload) {
    return await axios.put(`${config.api_host}/api/tags/${id}`, payload, {
        headers: { authorization: `Bearer ${getToken()}` },
    });
}

export async function deleteTag(id) {
    return await axios.delete(`${config.api_host}/api/tags/${id}`, {
        headers: { authorization: `Bearer ${getToken()}` },
    });
}
