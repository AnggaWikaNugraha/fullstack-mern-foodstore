import { ADD_ITEM_CART, REMOVE_ITEM_CART, CLEAR_ITEMS_CART, SET_ITEMS_CART } from '../../app/constants'

const initialState = localStorage.getItem('cart')
    ? JSON.parse(localStorage.getItem('cart'))
    : [];

export default function reducer(state = initialState, action) {

    switch (action.type) {

        case ADD_ITEM_CART:
            if (state.find(item => item._id === action.item._id)) {

                return state.map(item => ({
                    ...item,
                    qty: item._id === action.item._id ? item.qty + 1 : item.qty
                }));

            } else {

                return [...state, { ...action.item, qty: 1 }];

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

        default:
            return state;

    }

}