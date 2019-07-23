import React, { useState, useEffect } from 'react';
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

const burgerBuilder = props => {
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    props.onInitIngredients();
  }, []);

  const updatePurchaseState = (ingredients) => {
    const sum = Object.keys(ingredients)
      .map(ingKey => ingredients[ingKey])
      .reduce((sum, num) => sum + num, 0);
    return sum > 0;
  };

  const controlContext = {
    handlers: {
      added: props.onIngredientAdded,
      removed: props.onIngredientRemoved
    }
  };

  const purchaseHandler = () => {
    if (props.isAuthenticated) {
      setPurchasing(true);
    } else {
      props.onSetAuthRedirectPath('/checkout');
      props.history.push('/auth');
    }        
  };

  const purchaseCancelHandler = () => {
    setPurchasing(false);
  };

  const purchaseContinueHandler = () => {
    props.onInitPurchase();
    props.history.push('/checkout');
  };


  const ingredients = {...props.ings };
  const disabledInfo = Object.keys(ingredients)
    .reduce((info, ingKey) => {
        info[ingKey] = ingredients[ingKey] <= 0;
        return info;
    }, {});
  controlContext.disabledInfo = disabledInfo;

  let orderSummary = null;
  let burger = props.error ? <p>Ingredients can't be loaded</p> : <Spinner />;

  if (props.ings) {
    orderSummary = <OrderSummary 
      ingredients={props.ings}
      price={props.price}
      purchaseCancelled={purchaseCancelHandler}
      purchaseContinued={purchaseContinueHandler} 
    />;

    burger = (
      <div className={classes.BurgerBuilderLayout}>
        <Burger ingredients={props.ings} />
        <IngredientControlContext.Provider value={controlContext}>
          <BuildControls 
            price={props.price}
            purchasable={updatePurchaseState(props.ings)}
            ordered={purchaseHandler}
            isAuth={props.isAuthenticated} />
        </IngredientControlContext.Provider>
        </div>
    );
  }

  return (
    <React.Fragment>
      <Modal 
        show={purchasing} 
        modalClosed={purchaseCancelHandler}
      >
        {orderSummary}
      </Modal>
      {burger}
    </React.Fragment>
  );
}

const mapStateToProps = state => ({
  ings: state.burgerBuilder.ingredients,
  price: state.burgerBuilder.totalPrice,
  error: state.burgerBuilder.error,
  isAuthenticated: state.auth.token !== null
});

const mapDispatchToProps = dispatch => ({
  onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
  onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
  onInitIngredients: () => dispatch(actions.initIngredients()),
  onInitPurchase: () => dispatch(actions.purchaseInit()),
  onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
});

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(burgerBuilder, axios));