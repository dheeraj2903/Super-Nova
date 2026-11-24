import axios from 'axios';

const cartApi = axios.create({
  baseURL: 'http://localhost:3002/api/cart',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3500,
});

export default cartApi;
