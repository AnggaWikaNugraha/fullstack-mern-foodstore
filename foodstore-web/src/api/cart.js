import axios from 'axios';
import store from '../app/store';

import { config } from '../config';
import { setItems } from '../features/Cart/actions';
import { CART_LOADED } from '../app/constants';

export const cartState = { skipNextSave: false };

export async function saveCart(token, cart) {

    return await axios.put(`${config.api_host}/api/carts`, { items: cart }, {
        headers: {
            authorization: `Bearer ${token}`
        }
    })

}

export async function getCart() {

    let { token } = localStorage.getItem('auth')
        ? JSON.parse(localStorage.getItem('auth')) : {};

    if (!token) {
        store.dispatch({ type: CART_LOADED });
        return;
    }

    try {
        let { data } = await axios.get(`${config.api_host}/api/carts`, {
            headers: { authorization: `Bearer ${token}` }
        });

        if (!data.error) {
            cartState.skipNextSave = true;
            store.dispatch(setItems(data));
        }
    } finally {
        store.dispatch({ type: CART_LOADED });
    }

}