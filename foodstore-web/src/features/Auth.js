import { USER_LOGIN, USER_LOGOUT } from '../app/constants';

let initialState = { user: null, token: null }

export default function reducer(state = initialState, action) {

    switch (action.type) {

        // (1) logika menangani action USER_LOGIN
        case USER_LOGIN:
            return { user: action.user, token: action.token }

        // (2) logika state `USER_LOGOUT`
        case USER_LOGOUT:
            return { user: null, token: null }

        default:
            return state;
    }
}