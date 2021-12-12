import * as React from 'react';
import { useSelector } from 'react-redux';
import { ButtonCircle } from 'upkit';
import { Link, useHistory } from 'react-router-dom';
import FaUser from "@meronex/icons/fa/FaUser";
import styled from '@emotion/styled';

export default function TopBar() {

    let auth = useSelector(state => state.auth);
    let history = useHistory();

    return <Responsive>

        <Link style={{ display: 'flex' }} to={auth?.user ? '/account' : '/login'}>
            <ButtonCircle icon={<FaUser />} />
            <WrapName >
                {auth?.user ? auth?.user?.full_name : 'login'}
            </WrapName>
        </Link>
        {
            auth?.user && <Button onClick={() => history.push("/logout")}>
                Logout
            </Button>
        }

    </Responsive>
}

const WrapName = styled('div')((props) => ({
    marginLeft: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
}))

const Responsive = styled('div')((props) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 50px'
}))

const Button = styled('button')((props) => ({
    backgroundColor: 'brown',
    marginLeft: '20px',
    color: 'white',
    borderRadius: '10px',
    padding: '5px 20px'
}))