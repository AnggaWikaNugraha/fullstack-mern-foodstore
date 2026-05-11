import axios from "axios";
import { config } from "../config";

function getToken() {
    let { token } = localStorage.getItem("auth")
        ? JSON.parse(localStorage.getItem("auth"))
        : {};
    return token;
}

export async function get(params) {
    let { token } = localStorage.getItem("auth")
        ? JSON.parse(localStorage.getItem("auth"))
        : {};
    return await axios.get(`${config.api_host}/api/categories`, {
        params: {
            limit: params?.limit || 100,
            skip: params?.page ? params.page * (params.limit || 10) - (params.limit || 10) : 0,
        },
        headers: { authorization: `Bearer ${token}` },
    });
}

export async function createCategory(payload) {
    return await axios.post(`${config.api_host}/api/categories`, payload, {
        headers: { authorization: `Bearer ${getToken()}` },
    });
}

export async function updateCategory(id, payload) {
    return await axios.put(`${config.api_host}/api/categories/${id}`, payload, {
        headers: { authorization: `Bearer ${getToken()}` },
    });
}

export async function deleteCategory(id) {
    return await axios.delete(`${config.api_host}/api/categories/${id}`, {
        headers: { authorization: `Bearer ${getToken()}` },
    });
}
