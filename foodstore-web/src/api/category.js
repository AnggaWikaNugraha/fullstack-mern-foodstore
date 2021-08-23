import axios from "axios";
import { config } from "../config";

export async function get(params) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.get(`${config.api_host}/api/categories`, {
    params: {
      limit: params.limit,
      skip: params.page * params.limit - params.limit,
    },

    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
