import { delay } from 'redux-saga';
import { put, call } from 'redux-saga/effects'

import * as actions from '../actions/index';
import axios from 'axios';
import axiosOrders from '../../axios-orders';

export function* logoutSaga() {
    yield call([localStorage, 'removeItem'], 'token');
    yield call([localStorage, 'removeItem'], 'expirationDate');
    yield call([localStorage, 'removeItem'], 'userId');
    yield put(actions.logoutSucceed());
}

export function* checkAuthTimeoutSaga({ expirationTime }) {
    yield delay(expirationTime * 1000);
    yield put(actions.logout());
}

export function* authUserSaga({ email, password, isSignUp }) {
    yield put(actions.authStart());
    const authData = {
        email,
        password,
        returnSecureToken: true
    };
    let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyBXeAO0q585YnTCrPB3c17yeAks_szc3LA';
    if (!isSignUp) {
        url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyBXeAO0q585YnTCrPB3c17yeAks_szc3LA';
    }
    try {
        const response = yield axios.post(url, authData)
        const expirationDate = yield new Date(new Date().getTime() + response.data.expiresIn * 1000);
        yield localStorage.setItem('token', response.data.idToken);
        yield localStorage.setItem('expirationDate', expirationDate);
        yield localStorage.setItem('userId', response.data.localId);
        yield localStorage.setItem('userEmail', email);
        yield put(actions.authSuccess(response.data.idToken, response.data.localId, email));
        yield put(actions.checkAuthTimeout(response.data.expiresIn));
        yield put(actions.checkUserDiscount(response.data.idToken, response.data.localId));
    } catch (err) {
        yield put(actions.authFail(err.response.data.error));
    }
}

export function* authCheckStateSaga() {
    const token = yield localStorage.getItem('token');
        if (!token) {
            yield put(actions.logout());
        } else {
            const expirationDate = yield new Date(localStorage.getItem('expirationDate'));
            if (expirationDate > new Date()) {
                const userId = yield localStorage.getItem('userId');
                const userEmail = yield localStorage.getItem('userEmail');
                yield put(actions.authSuccess(token, userId, userEmail));
                yield put(actions.checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000));
                yield put(actions.checkUserDiscount(token, userId));
            } else {
                yield put(actions.logout());
            }
        }
}

export function* checkUserDiscountSaga({ token, userId }) {
    const queryParams = '?auth=' + token + '&orderBy="userId"&equalTo="' + userId + '"';
    let discounts;
    try {
        const response = yield axiosOrders.get('/discounts.json' + queryParams);
        discounts = Object.keys(response.data)
            .map(key => response.data[key])
            .map(d => ({ type: d.type, amount: d.discount }));
    } catch (error) {
        discounts = [];
    }
    yield put(actions.setDiscounts(discounts));
}
