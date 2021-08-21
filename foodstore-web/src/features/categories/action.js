import { getCategories } from "../../app/constants";
import { get } from "../../api/category";
import debounce from "debounce-promise";

let debounceItems = debounce(get, 500);

export const successFetching = ({ data }) => {
  return {
    type: getCategories,
    data,
  };
};

export const fetchItems = () => {
  return async (dispatch, getState) => {
    let perPage = getState().category.perPage || 9;
    let currentPage = getState().category.currentPage || 1;

    const params = {
      limit: perPage,
      skip: currentPage * perPage - perPage,
    };

    try {
      let {
        data: { data, count },
      } = await debounceItems(params);

      dispatch(successFetching({ data, count }));
    } catch (err) {
      console.log(err);
    }
  };
};
