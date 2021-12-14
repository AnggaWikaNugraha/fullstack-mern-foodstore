import * as React from 'react'
import { Route, Redirect } from "react-router-dom";
import { useSelector } from 'react-redux';

const OnlyAdmin = ({ children, ...rest }) => {

    let { user } = useSelector(state => state.auth);

    return <Route {...rest}>
        {   user ? 
            user.role === 'admin' ? 
            children : 
        <Redirect to="/error" /> : 
        <Redirect to="/login" />}
    </Route>
};

export default OnlyAdmin;