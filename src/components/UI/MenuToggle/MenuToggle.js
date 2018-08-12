import React from 'react';

import menuImage from '../../../assets/images/menu.png';
import classes from './MenuToggle.css';

const menuToggle = (props) => (
    <div className={classes.MenuToggle} onClick={props.toggled}>
        <img src={menuImage} alt='Menu' />
    </div>
);

export default menuToggle;