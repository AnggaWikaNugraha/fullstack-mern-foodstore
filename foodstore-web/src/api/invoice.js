import axios from "axios";
import { config } from "../config";

function getToken() {
  let { token } = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth')) : {};
  return token;
}

export async function getInvoices(params = {}) {
  return await axios.get(`${config.api_host}/api/invoices`, {
    params,
    headers: { authorization: `Bearer ${getToken()}` },
  });
}

export async function getInvoiceByOrderId(order_id) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.get(`${config.api_host}/api/invoices/${order_id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
