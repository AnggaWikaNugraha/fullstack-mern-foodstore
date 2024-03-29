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
import { getProducts } from '../../api/products';
import debounce from 'debounce-promise';

export const startFetchingProducts = () => {
    return {
        type: START_FETCHING_PRODUCT
    }
}
export const successFetchingProducts = ({ data, count }) => {
    return {
        type: SUCCESS_FETCHING_PRODUCT,
        data,
        count
    }
}
export const errorFetchingProducts = () => {
    return {
        type: ERROR_FETCHING_PRODUCT
    }
}

let debouncedFetchProducts = debounce(getProducts, 500);

export const fetchProducts = () => {

    return async (dispatch, getState) => {
        dispatch(startFetchingProducts());
        // menggunakan `getProducts` untuk mendapatkan data produk dari API

        let perPage = getState().products.perPage || 9;
        let currentPage = getState().products.currentPage || 1;
        let tags = getState().products.tags || [];
        let keyword = getState().products.keyword || '';
        let category = getState().products.category || '';

        const params = {
            limit: perPage,
            skip: (currentPage * perPage) - perPage,
            q: keyword,
            tags,
            category
        }

        try {
            let { data: { data, count } } = await debouncedFetchProducts(params);
            dispatch(successFetchingProducts({ data, count }));
        } catch (err) {
            dispatch(errorFetchingProducts());
        }
    }
}

export const setPage = (number = 1) => {
    return {
        type: SET_PAGE_PRODUCT,
        currentPage: number
    }
}

export const setKeyword = keyword => {
    return {
        type: SET_KEYWORD_PRODUCT,
        keyword
    }
}

export const setCategory = category => {
    return {
        type: SET_CATEGORY_PRODUCT,
        category
    }
}

export const setTags = tags => {
    return {
        type: SET_TAGS_PRODUCT,
        tags
    }
}

export const goToNextPage = () => {
    return {
        type: NEXT_PAGE_PRODUCT,
    }
}

export const goToPrevPage = () => {
    return {
        type: PREV_PAGE_PRODUCT
    }
}

export const toggleTag = tag => {
    return {
        type: TOGGLE_TAG_PRODUCT,
        tag
    };
}