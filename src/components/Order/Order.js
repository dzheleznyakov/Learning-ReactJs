import React from 'react';

import classes from './Order.css';

const order = (props) => {
    console.log(props);
    const ingredientsOutput = Object.keys(props.ingredients)
        .map(ingredientName => {
            return { 
                name: ingredientName,
                amount: props.ingredients[ingredientName]
            };
        })
        .map(ig => <span 
            style={{
                textTransform: 'capitalize',
                display: 'inline-block',
                margin: '0 8px',
                border: '1px solid #ccc',
                padding: '5px'
            }}
            key={ig.name}>{ig.name} ({ig.amount})</span>);

    return (
        <div className={classes.Order}>
            <p>Ingredients: {ingredientsOutput} </p>
            <p>Price: <strong>{props.price.toFixed(2)} BYR</strong></p>
        </div>
    );
}

export default order;