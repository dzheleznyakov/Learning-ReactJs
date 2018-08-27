import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './Auth.css';

import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import * as actions from '../../store/actions/index';

class Auth extends Component {
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
        controls: {
            email: this.getOrderFormElement('input', 'email', 'Mail Address', 
                { isEmail: true }),
            password: this.getOrderFormElement('input', 'password', 'Password',
                { minLength: 6 })
        },
        isSignup: true
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

    inputChangedHandler = (event, controlName)  => {
        const updatedControls = {
            ...this.state.controls,
            [controlName]: {
                ...this.state.controls[controlName],
                value: event.target.value,
                valid: this.checkValidity(
                    event.target.value,
                    this.state.controls[controlName].validation),
                touched: true
            }
        };
        this.setState({ controls: updatedControls });
    };

    submitHandler = (event) => {
        event.preventDefault();
        this.props.onAuth(
            this.state.controls.email.value,
            this.state.controls.password.value,
            this.state.isSignup
        );
    };

    switchAuthModeHandler = () => {
        this.setState(prevState => {
            return { isSignup: !prevState.isSignup };
        });
    };

    render() {
        const formElementArray = Object.keys(this.state.controls)
            .map(key => {
                return { id: key, config: this.state.controls[key] }
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
                changed={(event) => this.inputChangedHandler(event, formElement.id)} />
        ));

        if (this.props.loading) {
            form = <Spinner />;
        }

        let errorMessage = null;
        if (this.props.error) {
            errorMessage = (
                <p style={{ color: 'red' }}>{this.props.error.message}</p>
            );
        }

        return (
            <div className={classes.Auth}>
                {errorMessage}
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType='Success'>SUBMIT</Button>
                </form>
                <Button 
                    clicked={this.switchAuthModeHandler}
                    btnType='Danger'>SWITCH TO {this.state.isSignup ? 'SIGN IN' : 'SIGN UP'}</Button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup) => dispatch(actions.auth(email, password, isSignup))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);