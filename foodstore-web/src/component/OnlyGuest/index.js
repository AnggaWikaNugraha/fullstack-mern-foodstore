import * as React from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

export default function OnlyGuest({ children, ...rest }) {

    let { user } = useSelector(state => state.auth);

    return <Route {...rest}>
        {!user ? children : <Redirect to="/" />}
    </Route>
}