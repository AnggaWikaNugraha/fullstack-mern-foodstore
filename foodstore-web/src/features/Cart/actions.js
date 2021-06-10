import { ADD_ITEM_CART, REMOVE_ITEM_CART, CLEAR_ITEMS_CART, SET_ITEMS_CART } from '../../app/constants'

export function addItem(item) {

    return {
        type: ADD_ITEM,
        item
    }

}

export function removeItem(item) {

    return {
        type: REMOVE_ITEM,
        item
    }

}

export function clearItems() {

    return {
        type: CLEAR_ITEMS
    }

}

export function setItems(items) {

    return {
        type: SET_ITEMS,
        items
    }

}