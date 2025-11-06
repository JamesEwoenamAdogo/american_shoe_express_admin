import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://americanexpress-shoes-backend-2.onrender.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
