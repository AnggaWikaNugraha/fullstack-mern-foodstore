import axios from 'axios';
import { config } from '../config';

const getToken = () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth).token : '';
};

const headers = () => ({ authorization: `Bearer ${getToken()}` });

export const getDashboardSummary = () =>
    axios.get(`${config.api_host}/api/dashboard/summary`, { headers: headers() });

export const getDashboardRevenue = () =>
    axios.get(`${config.api_host}/api/dashboard/revenue`, { headers: headers() });

export const getDashboardTopProducts = () =>
    axios.get(`${config.api_host}/api/dashboard/top-products`, { headers: headers() });
