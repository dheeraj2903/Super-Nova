import axios from 'axios';

const paymentApi = axios.create({
  baseURL: 'http://localhost:3004/api/payments',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

export default paymentApi;
