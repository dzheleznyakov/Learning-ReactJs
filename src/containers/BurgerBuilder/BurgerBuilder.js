import React, {Component} from 'react';
import { connect } from 'react-redux';

import classes from './BurgerBuilder.css';

import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Burger from '../../components/Burger/Burger';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/BuildControls/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';
import * as actions from '../../store/actions/index';

export const IngredientControlContext = React.createContext();

class BurgerBuilder extends Component {
    state = {
        purchasing: false,
    };

    componentDidMount() {
        this.props.onInitIngredients();
    }

    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
            .map(ingKey => ingredients[ingKey])
            .reduce((sum, num) => sum + num, 0);
        return sum > 0;
    };

    controlContext = {
        handlers: {
            added: this.props.onIngredientAdded,
            removed: this.props.onIngredientRemoved
        }
    };

    purchaseHandler = () => {
        if (this.props.isAuthenticated) {
            this.setState({ purchasing: true });
        } else {
            this.props.onSetAuthRedirectPath('/checkout');
            this.props.history.push('/auth');
        }        
    };

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    };

    purchaseContinueHandler = () => {
        this.props.onInitPurchase();
        this.props.history.push('/checkout');
    };

    render() {
        const ingredients = {...this.props.ings };
        const disabledInfo = Object.keys(ingredients)
            .reduce((info, ingKey) => {
                info[ingKey] = ingredients[ingKey] <= 0;
                return info;
            }, {});
        this.controlContext.disabledInfo = disabledInfo;

        let orderSummary = null;
        let burger = this.props.error ? <p>Ingredients can't be loaded</p> : <Spinner />;

        if (this.props.ings) {
            orderSummary = <OrderSummary 
                ingredients={this.props.ings}
                price={this.props.price}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} 
            />;

            burger = (
                <div className={classes.BurgerBuilderLayout}>
                    <Burger ingredients={this.props.ings} />
                    <IngredientControlContext.Provider value={this.controlContext}>
                        <BuildControls 
                            price={this.props.price}
                            purchasable={this.updatePurchaseState(this.props.ings)}
                            ordered={this.purchaseHandler}
                            isAuth={this.props.isAuthenticated} />
                    </IngredientControlContext.Provider>
                    </div>
            );
        }

        if (this.state.loading) {
            orderSummary = <Spinner />;
        }

        return (
            <React.Fragment>
                <Modal 
                        show={this.state.purchasing} 
                        modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(actions.initIngredients()),
        onInitPurchase: () => dispatch(actions.purchaseInit()),
        onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));