import React from 'react';

import classes from './BuildControl.css';
import { IngredientControlContext } from '../../../../containers/BurgerBuilder/BurgerBuilder';

const buildControl = (props) => (
    <IngredientControlContext.Consumer>{context =>
        <div className={classes.BuildControl}>
            <div className={classes.Label}>{props.label}</div>
            <button 
                className={classes.Less}
                onClick={() => context.handlers.removed(props.type)}
                disabled={context.disabledInfo[props.type]}>Less</button>
            <button 
                className={classes.More}
                onClick={() => context.handlers.added(props.type)}>More</button>
        </div>
    }</IngredientControlContext.Consumer>
);

export default buildControl;