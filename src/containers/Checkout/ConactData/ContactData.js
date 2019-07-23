import React, { useState } from 'react';
import { connect } from 'react-redux';

import classes from './ContactData.css';

import Button from '../../../components/UI/Button/Button';
import Spinner from '../../../components/UI/Spinner/Spinner';
import Input from '../../../components/UI/Input/Input';
import axios from '../../../axios-orders';
import withErrorHandler from '../../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../../store/actions/index';
import { updateObject, checkValidity } from '../../../shared/utility';

const contactData = props => {
  const getOrderFormElement = (elementType, type, placeholder, ...rules) => {
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

  const [orderForm, setOrderForm] = useState({
    name: getOrderFormElement('input', 'text', 'Your Name'),
    street: getOrderFormElement('input', 'text', 'Your Street'),
    zipCode: getOrderFormElement('input', 'text', 'ZIP CODE', 
      { minLength: 5 }, { maxLength: 5 }),
    country: getOrderFormElement('input', 'text', 'Country'),
    email: getOrderFormElement('input', 'email', 'Your E-Mail',
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
  });
  const [formIsValid, setFormIsValid] = useState(false);

  const orderHandler = (event) => {
    event.preventDefault();
    const formData = Object.keys(orderForm)
      .reduce((data, key) => {
        data[key] = orderForm[key].value;
        return data;
      }, {});
    const order = {
      ingredients: props.ings,
      price: props.price,
      orderData: formData,
      userId: props.userId
    }
    props.onOrderBurger(order, props.token);
  };

  const inputChangedHandler = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(orderForm[inputIdentifier], {
      value: event.target.value,
      valid: checkValidity(event.target.value, orderForm[inputIdentifier].validation),
      touched: true
    });
    const updatedOrderForm = updateObject(orderForm, {
      [inputIdentifier]: updatedFormElement
    });
    
    let formIsValid = true;
    for (let inputIdent in updatedOrderForm) {
      formIsValid = formIsValid && updatedOrderForm[inputIdent].valid;
    }
    setOrderForm(updatedOrderForm);
    setFormIsValid(formIsValid);
  };

  const inputs = Object.keys(orderForm)
    .map(key => {
      return { id: key, config: orderForm[key] }
    })
    .map(formElement => <Input 
      key={formElement.id}
      elementType={formElement.config.elementType}
      elementConfig={formElement.config.elementConfig}
      value={formElement.config.value}
      invalid={!formElement.config.valid}
      shouldValidate={formElement.config.valid !== undefined}
      touched={formElement.config.touched}
      changed={(event) => inputChangedHandler(event, formElement.id)} />);
  let form = (
    <div className={classes.ContactData}>
      <h4>Enter your Contact Data</h4>
      <form onSubmit={orderHandler}>
        {inputs}
        <Button 
          btnType='Success'
          disabled={!formIsValid}>ORDER</Button>
      </form>
    </div>
  );
  if (props.loading) {
    form = <Spinner />
  }
  return form;
}

const stateToProps = state => ({
  ings: state.burgerBuilder.ingredients,
  price: state.burgerBuilder.totalPrice,
  loading: state.order.loading,
  token: state.auth.token,
  userId: state.auth.userId
});

const mapDispatchToProps = dispatch => ({
  onOrderBurger: (orderData, token) => dispatch(actions.purchaseBurger(orderData, token))
});

export default connect(stateToProps, mapDispatchToProps)(withErrorHandler(contactData, axios));