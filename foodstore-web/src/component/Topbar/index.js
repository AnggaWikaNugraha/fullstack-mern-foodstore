import * as React from 'react';
import { useSelector } from 'react-redux';
import { Responsive, ButtonCircle } from 'upkit';
import { Link } from 'react-router-dom';
import FaUser from "@meronex/icons/fa/FaUser";
import styled from '@emotion/styled';

export default function TopBar() {

    let auth = useSelector(state => state.auth);

    return <Responsive desktop={1} justify="end" items="center">

        <Link style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginRight: '50px'
        }} to={auth?.user ? '/account' : '/login'}>

            <ButtonCircle
                icon={<FaUser />}
            />
            <WrapName >
                {auth?.user ? auth?.user?.full_name : 'login'}
            </WrapName>
        </Link>

    </Responsive>
}

const WrapName = styled('div')((props) => ({
    marginLeft: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
}))