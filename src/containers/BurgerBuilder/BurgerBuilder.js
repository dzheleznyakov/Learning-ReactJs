import React, {Component} from 'react';

import classes from './BurgerBuilder.css';

import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Burger from '../../components/Burger/Burger';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/BuildControls/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

export const IngredientControlContext = React.createContext();

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
};

class BurgerBuilder extends Component {
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    };

    componentDidMount() {
        axios.get('/ingredients.json')
            .then(response => {
                const ingredients = response.data;
                this.setState({ ingredients });
                this.updatePurchaseState(ingredients);
            })
            .catch(error => {
                this.setState({ error: true });
            });
    }

    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
            .map(ingKey => ingredients[ingKey])
            .reduce((sum, num) => sum + num, 0);
        this.setState({ purchasable: sum > 0 });
    };


    addIngredientHandler = (type) => {
        const updatedCount = this.state.ingredients[type] + 1;
        const updatedIngredients = {...this.state.ingredients};
        updatedIngredients[type] = updatedCount;
        const updatedPrice = this.state.totalPrice + INGREDIENT_PRICES[type];
        this.setState({
            totalPrice: updatedPrice,
            ingredients: updatedIngredients
        });
        this.updatePurchaseState(updatedIngredients);
    };

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if (oldCount <= 0) {
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients = {...this.state.ingredients};
        updatedIngredients[type] = updatedCount;
        const updatedPrice = this.state.totalPrice - INGREDIENT_PRICES[type];
        this.setState({
            totalPrice: updatedPrice,
            ingredients: updatedIngredients
        });
        this.updatePurchaseState(updatedIngredients);
    };

    controlContext = {
        handlers: {
            added: this.addIngredientHandler,
            removed: this.removeIngredientHandler
        }
    };

    purchaseHandler = () => {
        this.setState({ purchasing: true });
    };

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    };

    purchaseContinueHandler = () => {
        // alert('You continue!');
        this.setState({ loading: true });
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Dmitriy',
                address: {
                    street: 'Fake street',
                    zipCode: 'AB12 3CD',
                    country: 'GB'
                },
                email: 'test@test.com'
            },
            deliveryMethod: 'fastest'
        }
        axios.post('/orders.json', order)
            .then(response => {
                console.log(response);
                this.setState({ loading: false, purchasing: false });
            })
            .catch(error => {
                console.log(error);
                this.setState({ loading: false, purchasing: false });
            });
    };

    render() {
        const ingredients = {...this.state.ingredients};
        const disabledInfo = Object.keys(ingredients)
            .reduce((info, ingKey) => {
                info[ingKey] = ingredients[ingKey] <= 0;
                return info;
            }, {});
        this.controlContext.disabledInfo = disabledInfo;

        let orderSummary = null;
        let burger = this.state.error ? <p>Ingredients can't be loaded</p> : <Spinner />;

        if (this.state.ingredients) {
            orderSummary = <OrderSummary 
                ingredients={this.state.ingredients}
                price={this.state.totalPrice}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} 
            />;

            burger = (
                <div className={classes.BurgerBuilderLayout}>
                    <Burger ingredients={this.state.ingredients} />
                    <IngredientControlContext.Provider value={this.controlContext}>
                        <BuildControls 
                        price={this.state.totalPrice}
                        purchasable={this.state.purchasable}
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

export default withErrorHandler(BurgerBuilder, axios);