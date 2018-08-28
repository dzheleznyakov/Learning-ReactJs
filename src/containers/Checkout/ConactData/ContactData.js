import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './ContactData.css';

import Button from '../../../components/UI/Button/Button';
import Spinner from '../../../components/UI/Spinner/Spinner';
import Input from '../../../components/UI/Input/Input';
import axios from '../../../axios-orders';
import withErrorHandler from '../../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../../store/actions/index';

class ContactData extends Component {
    getOrderFormElement = (elementType, type, placeholder, ...rules) => {
        const formElement = { 
            elementType, 
            elementConfig: { type, placeholder },
            value: '',
            validation: {
                required: true
            },
            valid: false,
            touched: false
        }
        rules.forEach(rule => {
            formElement.validation = {
                ...formElement.validation,
                ...rule
            };
        });
        return formElement;
    };

    state = {
        orderForm: {
            name: this.getOrderFormElement('input', 'text', 'Your Name'),
            street: this.getOrderFormElement('input', 'text', 'Your Street'),
            zipCode: this.getOrderFormElement('input', 'text', 'ZIP CODE', 
                { minLength: 5 }, { maxLength: 5 }),
            country: this.getOrderFormElement('input', 'text', 'Country'),
            email: this.getOrderFormElement('input', 'email', 'Your E-Mail',
                { matches: /\w+@\w+[\\.\w+]+/ }),
            deliveryMethod: {
                elementType: 'select',
                elementConfig: {
                    options: [
                        { value: 'fastest', displayValue: 'Fastest'},
                        { value: 'cheapest', displayValue: 'Cheapest'}
                    ]
                },
                value: 'fastest',
                valid: true
            }
        },
        formIsValid: false
    }

    orderHandler = (event) => {
        event.preventDefault();
        const formData = Object.keys(this.state.orderForm)
            .reduce((data, key) => {
                data[key] = this.state.orderForm[key].value;
                return data;
            }, {});
        const order = {
            ingredients: this.props.ings,
            price: this.props.price,
            orderData: formData
        }
        this.props.onOrderBurger(order, this.props.token);
    };

    checkValidity = (value, rules) => {
        if (!rules) {
            return true;
        }
        let isValid = true;
        if (rules.required) {
            isValid = isValid && value.trim() !== '';
        }
        if (rules.minLength) {
            isValid = isValid && value.length >= rules.minLength;
        }
        if (rules.maxLength) {
            isValid = isValid && value.length <= rules.maxLength;
        }
        if (rules.matches) {
            isValid = isValid && rules.matches.test(value);
        }
        if (rules.isEmail) {
            const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            isValid = isValid && pattern.test(value);
        }
        if (rules.isNumeric) {
            const pattern = /^\d+$/;
            isValid = pattern.test(value) && isValid
        }
        return isValid;
    };

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedOrderForm = {
            ...this.state.orderForm
        };
        const updatedFormElement = {
            ...updatedOrderForm[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = 
            this.checkValidity(updatedFormElement.value, updatedFormElement.validation);
        updatedFormElement.touched = true;
        updatedOrderForm[inputIdentifier] = updatedFormElement;
        
        let formIsValid = true;
        for (let inputIdent in updatedOrderForm) {
            formIsValid = formIsValid && updatedOrderForm[inputIdent].valid;
        }
        this.setState({ orderForm: updatedOrderForm, formIsValid });
    };

    render() {
        const inputs = Object.keys(this.state.orderForm)
            .map(key => {
                return { id: key, config: this.state.orderForm[key] }
            })
            .map(formElement => <Input 
                key={formElement.id}
                elementType={formElement.config.elementType}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.valid !== undefined}
                touched={formElement.config.touched}
                changed={(event) => this.inputChangedHandler(event, formElement.id)} />);
        let form = (
            <div className={classes.ContactData}>
                <h4>Enter your Contact Data</h4>
                <form onSubmit={this.orderHandler}>
                    {inputs}
                    <Button 
                        btnType='Success'
                        disabled={!this.state.formIsValid}>ORDER</Button>
                </form>
            </div>
        );
        if (this.props.loading) {
            form = <Spinner />
        }
        return form;
    }
}

const stateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        loading: state.order.loading,
        token: state.auth.token
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onOrderBurger: (orderData, token) => dispatch(actions.purchaseBurder(orderData, token))
    };
};

export default connect(stateToProps, mapDispatchToProps)(withErrorHandler(ContactData, axios));