import React from 'react';

import classes from './OrderSummary.css';

import Button from '../../../UI/Button/Button';

const orderSummary = (props) => {
    const ingredientSummary = Object.keys(props.ingredients)
        .map(ingKey => (
            <li key={`orderSummary${ingKey}`}><span 
                style={{textTransform: 'capitalize'}}>{ingKey}:</span> {props.ingredients[ingKey]}
            </li>
        ));

    let totalPrice = null;
    let discounts = null;
    let totalPriceHtml = <p><strong>Total Price: {props.price.toFixed(2)} BYR</strong></p>;
    if (props.discounts && props.discounts.length) {
        totalPrice = props.discounts.map(dscnt => dscnt.amount)
            .reduce((price, dscnt) => price * (1 - dscnt), props.price);
        discounts = (
            <div>
                <p><strong>Your discounts:</strong></p>
                <ul className={classes.DiscountsList}>
                    {props.discounts
                        .map((dscnt, i) => <li key={i}>{dscnt.type}: {dscnt.amount * 100}%</li>)}
                </ul>
            </div>
        );
        totalPriceHtml = <p>
            <strong>Total Price: </strong>
            <strike>{props.price.toFixed(2)} BYR</strike>
            <strong> {totalPrice.toFixed(2)} BYR</strong>
        </p>;
    }

    return (
        <React.Fragment>
            <h3>Your Order</h3>
            <p>A delicious burger with the following ingredients:</p>
            <ul>
                {ingredientSummary}
            </ul>
            {discounts}
            {totalPriceHtml}
            <p>Continue to Checkout?</p>
            <Button btnType='Danger' clicked={props.purchaseCancelled}>CANCEL</Button>
            <Button btnType='Success' clicked={props.purchaseContinued}>CONTINUE</Button>
        </React.Fragment>
    )
};

export default orderSummary;