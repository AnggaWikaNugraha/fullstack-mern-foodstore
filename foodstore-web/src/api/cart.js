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

let loadingCart = null;
let loadingToken = null;

export async function getCart() {
    const { token } = store.getState().auth;
    if (!token) {
        store.dispatch({ type: CART_LOADED });
        return true;
    }
    if (loadingCart && loadingToken === token) return loadingCart;

    loadingToken = token;
    const request = (async () => {
        try {
            const { data } = await axios.get(`${config.api_host}/api/carts`, {
                headers: { authorization: `Bearer ${token}` },
            });
            if (store.getState().auth.token !== token || !Array.isArray(data)) return false;
            cartState.skipNextSave = true;
            store.dispatch(setItems(data));
            return true;
        } catch {
            return false;
        } finally {
            if (store.getState().auth.token === token) store.dispatch({ type: CART_LOADED });
        }
    })();
    loadingCart = request;
    try {
        return await request;
    } finally {
        if (loadingCart === request) {
            loadingCart = null;
            loadingToken = null;
        }
    }
}
