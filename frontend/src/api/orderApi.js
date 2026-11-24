import axios from 'axios';

const orderApi = axios.create({
  baseURL: 'http://localhost:3003/api/orders',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export default orderApi;
