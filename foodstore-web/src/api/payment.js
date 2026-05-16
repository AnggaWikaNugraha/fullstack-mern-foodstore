import axios from 'axios';
import { config } from '../config';

const getToken = () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth).token : '';
};

export const getSnapToken = (order_id) =>
    axios.get(`${config.api_host}/api/payments/token/${order_id}`, {
        headers: { authorization: `Bearer ${getToken()}` },
    });
