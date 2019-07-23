import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import classes from './Auth.css';

import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import * as actions from '../../store/actions/index';
import { updateObject, checkValidity } from '../../shared/utility';

const auth = props => {
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

  const [controls, setControls] = useState({
    email: getOrderFormElement('input', 'email', 'Mail Address', 
      { isEmail: true }),
    password: getOrderFormElement('input', 'password', 'Password',
      { minLength: 6 })
  });

  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (!props.buildingBurger && props.authRedirectPath !== '/') {
      props.onSetAuthRedirectPath();
    }
  }, []);

  const inputChangedHandler = (event, controlName)  => {
    const updatedControls = updateObject(controls, {
      [controlName]: updateObject(controls[controlName], {
        value: event.target.value,
        valid: checkValidity(event.target.value, controls[controlName].validation),
        touched: true
      })
    });
    setControls(updatedControls);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    props.onAuth(
      controls.email.value,
      controls.password.value,
      isSignup
    );
  };

  const switchAuthModeHandler = () => {
    setIsSignup(!isSignup);
  };

  const formElementArray = Object.keys(controls)
    .map(key => {
      return { id: key, config: controls[key] }
    });

  let form = formElementArray.map(formElement => (
    <Input
      key={formElement.id}
      elementType={formElement.config.elementType}
      elementConfig={formElement.config.elementConfig}
      value={formElement.config.value}
      invalid={!formElement.config.valid}
      shouldValidate={formElement.config.valid !== undefined}
      touched={formElement.config.touched}
      changed={(event) => inputChangedHandler(event, formElement.id)} />
  ));

  if (props.loading) {
    form = <Spinner />;
  }

  let errorMessage = null;
  if (props.error) {
    errorMessage = (
      <p style={{ color: 'red' }}>{props.error.message}</p>
    );
  }

  let authRedirect = null;
  if (props.isAuthenticated) {
    authRedirect = <Redirect to={props.authRedirectPath} />
  }

  return (
    <div className={classes.Auth}>
        {authRedirect}
        {errorMessage}
        <form onSubmit={submitHandler}>
          {form}
          <Button btnType='Success'>SUBMIT</Button>
        </form>
        <Button 
          clicked={switchAuthModeHandler}
          btnType='Danger'>SWITCH TO {isSignup ? 'SIGN IN' : 'SIGN UP'}</Button>
    </div>
  );
}

const mapStateToProps = state => ({
  loading: state.auth.loading,
  error: state.auth.error,
  isAuthenticated: state.auth.token !== null,
  buildingBurger: state.burgerBuilder.building,
  authRedirectPath: state.auth.authRedirectPath
});

const mapDispatchToProps = dispatch => ({
  onAuth: (email, password, isSignup) => dispatch(actions.auth(email, password, isSignup)),
  onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/'))
});

export default connect(mapStateToProps, mapDispatchToProps)(auth);