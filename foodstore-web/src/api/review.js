import axios from 'axios';
import { config } from '../config';

const getToken = () => {
    const { token } = localStorage.getItem('auth')
        ? JSON.parse(localStorage.getItem('auth'))
        : {};
    return token;
};

export const createReview = ({ product_id, order_id, rating, comment }) =>
    axios.post(
        `${config.api_host}/api/reviews`,
        { product_id, order_id, rating, comment },
        { headers: { authorization: `Bearer ${getToken()}` } }
    );

// Ambil review milik user untuk order tertentu
export const getMyOrderReviews = (order_id) =>
    axios.get(`${config.api_host}/api/reviews`, {
        params: { order_id },
        headers: { authorization: `Bearer ${getToken()}` }
    });

// Ambil semua review untuk satu produk (publik)
export const getProductReviews = (product_id) =>
    axios.get(`${config.api_host}/api/reviews`, { params: { product_id } });
