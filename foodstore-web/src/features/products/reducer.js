import {
    START_FETCHING_PRODUCT,
    SUCCESS_FETCHING_PRODUCT,
    ERROR_FETCHING_PRODUCT,
    SET_CATEGORY_PRODUCT,
    SET_PAGE_PRODUCT,
    SET_KEYWORD_PRODUCT,
    SET_TAGS_PRODUCT,
    NEXT_PAGE_PRODUCT,
    PREV_PAGE_PRODUCT,
    TOGGLE_TAG_PRODUCT,
} from '../../app/constants'

const statuslist = {
    idle: 'idle',
    process: 'process',
    success: 'success',
    error: 'error',
}

const initialState = {
    data: [],
    currentPage: 1,
    totalItems: -1,
    perPage: 6,
    keyword: '',
    category: '',
    tags: [],
    status: statuslist.idle
};

export default function reducer(state = initialState, action) {

    switch (action.type) {

        // tangani `START_FETCHING_PRODUCT`
        case START_FETCHING_PRODUCT:
            return { ...state, status: statuslist.process }

        // tangani `SUCCESS_FETCHING_PRODUCT`
        case SUCCESS_FETCHING_PRODUCT:
            return { ...state, status: statuslist.success, data: action.data, totalItems: action.count }

        // tangani `ERROR_FETCHING_PRODUCT`
        case ERROR_FETCHING_PRODUCT:
            return { ...state, status: statuslist.error }

        case SET_PAGE_PRODUCT:
            return { ...state, currentPage: action.currentPage }

        case SET_KEYWORD_PRODUCT:
            return { ...state, keyword: action.keyword, category: '', tags: [] }

        case SET_CATEGORY_PRODUCT:
            return { ...state, currentPage: 1, tags: [], category: action.category, keyword: '' }

        case SET_TAGS_PRODUCT:
            return { ...state, tags: action.tags }

        case TOGGLE_TAG_PRODUCT:
            if (!state.tags.includes(action.tag)) {
                return { ...state, currentPage: 1, tags: [...state.tags, action.tag] }
            } else {
                return { ...state, currentPage: 1, tags: state.tags.filter(tag => tag !== action.tag) }
            }

        case NEXT_PAGE_PRODUCT:
            return { ...state, currentPage: state.currentPage + 1 }

        case PREV_PAGE_PRODUCT:
            return { ...state, currentPage: state.currentPage - 1 }

        default:
            return state;
    }

}