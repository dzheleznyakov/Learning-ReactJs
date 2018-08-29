import React from 'react';

import classes from './SideDrawer.css';
import Backdrop from '../../UI/Backdrop/Backdrop';

import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';

const sideDrawer = (props) => {
    const attachedClasses = [
        classes.SideDrawer,
        props.open ? classes.Open : classes.Close
    ];
    return (
        <React.Fragment>
            <Backdrop 
                show={props.open} 
                clicked={props.closed} />
            <div className={attachedClasses.join(' ')} onClick={props.closed}>
                <div className={classes.Logo}>
                    <Logo />
                </div>
                <nav className={classes.NavigationItems}>
                    <NavigationItems isAuthenticated={props.isAuth} />
                </nav>
            </div>
        </React.Fragment>
    );
};

export default sideDrawer;