import * as React from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import FaUser from "@meronex/icons/fa/FaUser";
import FaSignOutAlt from "@meronex/icons/fa/FaSignOutAlt";
import FaShieldAlt from "@meronex/icons/fa/FaShieldAlt";
import styled from '@emotion/styled';

export default function TopBar() {
    let auth = useSelector(state => state.auth);
    let history = useHistory();
    const user = auth?.user;

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : null;

    return (
        <NavBar>
            <Brand to="/">
                <BrandIcon>🍽️</BrandIcon>
                <BrandName>FoodStore</BrandName>
            </Brand>

            <NavRight>
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <AdminBtn onClick={() => history.push('/admin/product')}>
                                <FaShieldAlt style={{ marginRight: 6 }} />
                                Admin
                            </AdminBtn>
                        )}
                        <ProfileLink to="/account">
                            <Avatar>{initials}</Avatar>
                            <UserName>{user.full_name}</UserName>
                        </ProfileLink>
                        <LogoutBtn onClick={() => history.push('/logout')}>
                            <FaSignOutAlt />
                        </LogoutBtn>
                    </>
                ) : (
                    <LoginLink to="/login">
                        <FaUser style={{ marginRight: 6 }} />
                        Login
                    </LoginLink>
                )}
            </NavRight>
        </NavBar>
    );
}

const NavBar = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#c0392b',
    padding: '0 24px',
    height: 56,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 200,
    margin: 0,
});

const Brand = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: 'white',
});

const BrandIcon = styled('span')({
    fontSize: 22,
});

const BrandName = styled('span')({
    fontSize: 18,
    fontWeight: 700,
    color: 'white',
    letterSpacing: 0.3,
});

const NavRight = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
});

const Avatar = styled('div')({
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#c0392b',
    color: 'white',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
});

const ProfileLink = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: '5px 12px 5px 6px',
    borderRadius: 999,
    transition: 'background 0.15s',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
});

const UserName = styled('span')({
    fontSize: 14,
    color: 'white',
    fontWeight: 500,
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const LogoutBtn = styled('button')({
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: '#ccc',
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 15,
    transition: 'background 0.15s, color 0.15s',
    '&:hover': { backgroundColor: '#c0392b', color: 'white' },
});

const AdminBtn = styled('button')({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { backgroundColor: '#a93226' },
});

const LoginLink = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    color: 'white',
    textDecoration: 'none',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background 0.15s',
    '&:hover': { backgroundColor: '#a93226' },
});
