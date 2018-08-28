import React from 'react';

import classes from './Toolbar.css';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import MenuToggle from '../../UI/MenuToggle/MenuToggle';

const toolbar = (props) => {
    const menuToggleClasses = [classes.MenuToggle, classes.MobileOnly]
        .join(' ');

    return (
        <header className={classes.Toolbar}>
            <div className={menuToggleClasses}>
                <MenuToggle toggled={props.toggleSideDrawer} />
            </div>
            <nav className={classes.DesktopOnly}>
                <NavigationItems isAuthenticated={props.isAuth} />
            </nav>
            <div className={classes.Logo}>
                <Logo />
            </div>
        </header>
    )
};

export default toolbar;