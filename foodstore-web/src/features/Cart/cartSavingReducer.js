import { CART_SAVING, CART_SAVED } from '../../app/constants';

export default function cartSavingReducer(state = false, action) {
    if (action.type === CART_SAVING) return true;
    if (action.type === CART_SAVED)  return false;
    return state;
}
