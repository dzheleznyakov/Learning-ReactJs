import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://zh-react-burger-builder.firebaseio.com/'
})

export default instance;