import { CART_LOADED, CART_RESET } from '../../app/constants';

export default function cartLoadedReducer(state = false, action) {
    if (action.type === CART_LOADED) return true;
    if (action.type === CART_RESET) return false;
    return state;
}
