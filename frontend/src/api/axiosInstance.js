import axios from 'axios';

const baseURL = import.meta.env.MODE === 'development'? 'http://localhost:5000/api' : 'api';

const axiosInstance =  axios.create({
    baseURL,
    headers:{
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
})

export default axiosInstance;