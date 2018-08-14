import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://zh-react-burger-builder.firebaseio.co/'
})

export default instance;