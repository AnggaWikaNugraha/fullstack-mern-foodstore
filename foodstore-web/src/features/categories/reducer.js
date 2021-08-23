import { getCategories } from "../../app/constants";

const statuslist = {
  idle: "idle",
  process: "process",
  success: "success",
  error: "error",
};

const initialState = {
  data: [],
  currentPage: 1,
  perPage: 6,
  status: statuslist.idle,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case getCategories:
      return {
        ...state,
        status: statuslist.success,
        data: action.data,
      };

    default:
      return state;
  }
}
