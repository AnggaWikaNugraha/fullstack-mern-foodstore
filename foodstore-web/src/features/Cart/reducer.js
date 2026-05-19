import { ADD_ITEM_CART, REMOVE_ITEM_CART, CLEAR_ITEMS_CART, SET_ITEMS_CART, TOGGLE_CHECK_CART } from '../../app/constants'

const initialState = [];

export default function reducer(state = initialState, action) {

    switch (action.type) {

        case ADD_ITEM_CART:
            if (state.find(item => item._id === action.item._id)) {

                return state.map(item => ({
                    ...item,
                    qty: item._id === action.item._id ? item.qty + 1 : item.qty
                }));

            } else {

                return [...state, { ...action.item, qty: 1, checked: true }];

            }

        case REMOVE_ITEM_CART:

            return state.map(item => ({
                ...item,
                qty: item._id === action.item._id ? item.qty - 1 : item.qty
            }))
                .filter(item => item.qty > 0);

        case CLEAR_ITEMS_CART:
            return [];

        case SET_ITEMS_CART:
            return action.items

        case TOGGLE_CHECK_CART:
            return state.map(item => ({
                ...item,
                checked: item._id === action.id ? !item.checked : item.checked
            }));

        default:
            return state;

    }

}