import axios from 'axios';

import { config } from '../config';

export async function saveCart(token, cart) {

    return await axios.put(`${config.api_host}/api/carts`, { items: cart }, {
        headers: {
            authorization: `Bearer ${token}`
        }
    })

}