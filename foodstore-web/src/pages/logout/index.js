import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { LayoutOne } from 'upkit';
import { useDispatch } from 'react-redux';
import BounceLoader from 'react-spinners/BounceLoader';
import { userLogout } from '../../features/Auth/actions';
import { logout } from '../../api/auth';

export default function Logout() {
    // // (1) definisikan `history` dan `dispatch`
    let history = useHistory();
    let dispatch = useDispatch();

    // (1) gunakan `logout` di dalam `useEffect`
    // (2) jika sudah dispatch Redux _action_ `useLogout`
    // (3) kemudian redirect ke `Home`
    React.useEffect(() => {
        logout()
            .then(() => dispatch(userLogout()))
            .then(() => history.push('/'))
    }, [history, logout])

    return (
        <LayoutOne size="small">
            <div className="text-center flex flex-col justify-center items-center">
                <BounceLoader color="red" />
                <br />
                Logging out ...
            </div>
        </LayoutOne>
    )
}