import axios from 'axios';
import { config } from '../config';

const getToken = () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth).token : '';
};

const headers = () => ({ authorization: `Bearer ${getToken()}` });

export const getWishlist = () =>
    axios.get(`${config.api_host}/api/wishlists`, { headers: headers() });

export const addToWishlist = (product_id) =>
    axios.post(`${config.api_host}/api/wishlists`, { product_id }, { headers: headers() });

export const removeFromWishlist = (product_id) =>
    axios.delete(`${config.api_host}/api/wishlists/${product_id}`, { headers: headers() });
