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
import * as actionTypes from '../../store/actions';

export const IngredientControlContext = React.createContext();

class BurgerBuilder extends Component {
    state = {
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    };

    componentDidMount() {
        // axios.get('/ingredients.json')
        //     .then(response => {
        //         const ingredients = response.data;
        //         this.setState({ ingredients });
        //         this.updatePurchaseState(ingredients);
        //     })
        //     .catch(error => {
        //         this.setState({ error: true });
        //     });
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
        this.setState({ purchasing: true });
    };

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    };

    purchaseContinueHandler = () => {
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
        let burger = this.state.error ? <p>Ingredients can't be loaded</p> : <Spinner />;

        if (this.props.ings) {
            orderSummary = <OrderSummary 
                ingredients={this.props.ings}
                price={this.state.totalPrice}
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
                        ordered={this.purchaseHandler} />
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
        ings: state.ingredients,
        price: state.totalPrice
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingredientName) => dispatch({ 
            type: actionTypes.ADD_INGREDIENT, ingredientName
        }),
        onIngredientRemoved: (ingredientName) => dispatch({ 
            type: actionTypes.REMOVE_INGREDIENT, ingredientName
        }),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));