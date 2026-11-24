import axios from 'axios';

const productApi = axios.create({
  baseURL: 'http://localhost:3001/api/products',
  withCredentials: true,
  timeout: 6000,
});

export default productApi;
