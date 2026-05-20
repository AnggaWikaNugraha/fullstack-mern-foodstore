import * as React from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import FaSignOutAlt from "@meronex/icons/fa/FaSignOutAlt";
import styled from '@emotion/styled';

export default function TopBar() {
    const auth = useSelector(state => state.auth);
    const cart = useSelector(state => state.cart);
    const history = useHistory();
    const user = auth?.user;

    const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : null;

    return (
        <NavBar>
            <Inner>
                {/* Kiri: Logo + Search */}
                <Left>
                    <Brand to="/">
                        <BrandIcon>🍽️</BrandIcon>
                        <BrandName>FoodStore</BrandName>
                    </Brand>

                    <SearchWrap>
                        <SearchIcon>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </SearchIcon>
                        <SearchInput placeholder="Cari makanan, minuman, dan lainnya..." readOnly />
                    </SearchWrap>
                </Left>

                {/* Kanan: Actions */}
                <Actions>
                    {/* Cart */}
                    <CartBtn onClick={() => history.push('/keranjang')} title="Keranjang">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cartQty > 0 && <CartBadge>{cartQty > 99 ? '99+' : cartQty}</CartBadge>}
                    </CartBtn>

                    {user ? (
                        <>
                            <ProfileLink to="/account" title={user.full_name}>
                                <Avatar>{initials}</Avatar>
                                <UserName>{user.full_name}</UserName>
                            </ProfileLink>
                            <LogoutBtn onClick={() => history.push('/logout')} title="Logout">
                                <FaSignOutAlt />
                            </LogoutBtn>
                        </>
                    ) : (
                        <>
                            <MasukBtn to="/login">Masuk</MasukBtn>
                            <DaftarBtn to="/register">Daftar</DaftarBtn>
                        </>
                    )}
                </Actions>
            </Inner>
        </NavBar>
    );
}

const NavBar = styled('div')({
    backgroundColor: '#c0392b',
    position: 'sticky',
    top: 0,
    zIndex: 200,
    boxShadow: '0 0.125rem 0.375rem rgba(0,0,0,0.2)',
});

const Inner = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '3.75rem',
});

const Left = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
    minWidth: 0,
});

const Brand = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    flexShrink: 0,
});

const BrandIcon = styled('span')({
    fontSize: '1.375rem',
});

const BrandName = styled('span')({
    fontSize: '1.125rem',
    fontWeight: 700,
    color: 'white',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
});

const SearchWrap = styled('div')({
    position: 'relative',
    flex: 1,
    minWidth: 0,
    '@media (max-width: 640px)': { display: 'none' },
});

const SearchIcon = styled('span')({
    position: 'absolute',
    left: '0.875rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
});

const SearchInput = styled('input')({
    width: '100%',
    height: '2.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0 1rem 0 2.625rem',
    fontSize: '0.875rem',
    color: '#333',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'default',
    '&::placeholder': { color: '#aaa' },
});

const Actions = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
});

const CartBtn = styled('button')({
    position: 'relative',
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    color: 'white',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s',
    flexShrink: 0,
    '&:hover': { background: 'rgba(255,255,255,0.22)' },
});

const CartBadge = styled('span')({
    position: 'absolute',
    top: '-0.3rem',
    right: '-0.3rem',
    background: '#fff',
    color: '#c0392b',
    fontSize: '0.625rem',
    fontWeight: 800,
    borderRadius: '999px',
    minWidth: '1.1rem',
    height: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.25rem',
    lineHeight: 1,
});

const ProfileLink = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    background: 'rgba(255,255,255,0.12)',
    padding: '0.3rem 0.75rem 0.3rem 0.375rem',
    borderRadius: '999px',
    transition: 'background 0.15s',
    '&:hover': { background: 'rgba(255,255,255,0.22)' },
});

const Avatar = styled('div')({
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
});

const UserName = styled('span')({
    fontSize: '0.875rem',
    color: 'white',
    fontWeight: 500,
    maxWidth: '7.5rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const LogoutBtn = styled('button')({
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9375rem',
    transition: 'background 0.15s, color 0.15s',
    '&:hover': { background: 'rgba(255,255,255,0.25)', color: 'white' },
});


const MasukBtn = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    color: 'white',
    border: '1.5px solid rgba(255,255,255,0.7)',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    padding: '0.375rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'border-color 0.15s, background 0.15s',
    whiteSpace: 'nowrap',
    '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' },
});

const DaftarBtn = styled(Link)({
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    color: '#c0392b',
    border: 'none',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    padding: '0.375rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    transition: 'background 0.15s',
    whiteSpace: 'nowrap',
    '&:hover': { background: '#f5f5f5' },
});
