import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './ContactData.css';

import Button from '../../../components/UI/Button/Button';
import Spinner from '../../../components/UI/Spinner/Spinner';
import Input from '../../../components/UI/Input/Input';
import axios from '../../../axios-orders';
import withErrorHandler from '../../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../../store/actions/index';
import { updateObject, checkValidity } from '../../../shared/utility';

class ContactData extends Component {
    getOrderFormElement = (elementType, type, placeholder, value, ...rules) => {
        const formElement = { 
            elementType, 
            elementConfig: { type, placeholder },
            value: value || '',
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

    constructor(props) {
        super(props);
        this.state = {
            orderForm: {
                name: this.getOrderFormElement('input', 'text', 'Your Name'),
                street: this.getOrderFormElement('input', 'text', 'Your Street'),
                zipCode: this.getOrderFormElement('input', 'text', 'ZIP CODE', null, 
                    { minLength: 5 }, { maxLength: 5 }),
                country: this.getOrderFormElement('input', 'text', 'Country'),
                email: this.getOrderFormElement('input', 'email', 'Your E-Mail', props.userEmail,
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
            orderData: formData,
            userId: this.props.userId
        }
        this.props.onOrderBurger(order, this.props.token);
    };

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedFormElement = updateObject(this.state.orderForm[inputIdentifier], {
            value: event.target.value,
            valid: checkValidity(event.target.value, this.state.orderForm[inputIdentifier].validation),
            touched: true
        });
        const updatedOrderForm = updateObject(this.state.orderForm, {
            [inputIdentifier]: updatedFormElement
        });
        
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
        token: state.auth.token,
        userId: state.auth.userId,
        userEmail: state.auth.userEmail,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onOrderBurger: (orderData, token) => dispatch(actions.purchaseBurger(orderData, token))
    };
};

export default connect(stateToProps, mapDispatchToProps)(withErrorHandler(ContactData, axios));