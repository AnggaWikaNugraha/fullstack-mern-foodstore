import * as axios from "axios";
import { config } from "../config";

export async function getOrders(params) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  let { limit, page, status } = params;
  let skip = page * limit - limit;

  return await axios.get(`${config.api_host}/api/orders`, {
    params: { skip, limit, ...(status ? { status } : {}) },
    headers: { authorization: `Bearer ${token}` },
  });
}

export async function getOrderStats() {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};
  return await axios.get(`${config.api_host}/api/orders/stats`, {
    headers: { authorization: `Bearer ${token}` },
  });
}

export async function exportAllOrders() {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};
  return await axios.get(`${config.api_host}/api/orders/export`, {
    headers: { authorization: `Bearer ${token}` },
  });
}

export async function createOrder(payload) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.post(`${config.api_host}/api/orders`, payload, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function getOrderById(id) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.get(`${config.api_host}/api/orders/${id}`, {
    headers: { authorization: `Bearer ${token}` },
  });
}

export async function updateOrderStatus(id, status) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.put(`${config.api_host}/api/orders/${id}/status`, { status }, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
