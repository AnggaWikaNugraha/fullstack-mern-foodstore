import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setKeyword } from '../../features/products/actions';
import StoreIcon from '../StoreIcon';
import './storefront-header.css';

export default function StorefrontHeader() {
    const dispatch = useDispatch();
    const keyword = useSelector((state) => state.products.keyword);
    const user = useSelector((state) => state.auth?.user);
    const cart = useSelector((state) => state.cart);
    const [search, setSearch] = React.useState(keyword);
    React.useEffect(() => setSearch(keyword), [keyword]);
    const quantity = cart.reduce((sum, item) => sum + item.qty, 0);

    function handleSearch(event) {
        event.preventDefault();
        dispatch(setKeyword(search.trim()));
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <header className="store-header">
            <div className="store-announcement">
                <span>Makanan enak, hari jadi lebih baik.</span>
                <span>
                    Dari menu favorit sampai camilan untuk berbagi <StoreIcon name="sparkles" size={14} />
                </span>
            </div>
            <div className="store-navigation">
                <Link to="/" className="store-brand" aria-label="FoodStore beranda">
                    <span className="store-brand-mark">
                        <StoreIcon name="dish" size={25} />
                    </span>
                    Food
                    <span>
                        Store<span className="store-brand-dot">.</span>
                    </span>
                </Link>
                <form className="store-search" role="search" onSubmit={handleSearch}>
                    <StoreIcon name="search" size={20} />
                    <input
                        aria-label="Cari menu"
                        placeholder="Lagi pengin makan apa?"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        type="search"
                    />
                    <button type="submit">Cari</button>
                </form>
                <nav className="store-actions" aria-label="Navigasi akun">
                    <Link
                        className="store-icon-link store-wishlist-link"
                        to="/wishlist"
                        aria-label="Menu favorit"
                    >
                        <StoreIcon name="heart" />
                    </Link>
                    <Link
                        className="store-icon-link"
                        to="/keranjang"
                        aria-label={`Keranjang, ${quantity} item`}
                    >
                        <StoreIcon name="bag" />
                        {quantity > 0 && (
                            <span className="store-cart-count">{quantity > 99 ? '99+' : quantity}</span>
                        )}
                    </Link>
                    <span className="store-nav-divider" />
                    {user ? (
                        <Link className="store-account" to="/account">
                            <span className="store-avatar">
                                {user.full_name?.slice(0, 1).toUpperCase() || 'A'}
                            </span>
                            <span className="store-account-name">{user.full_name || 'Akun saya'}</span>
                        </Link>
                    ) : (
                        <>
                            <Link className="store-login" to="/login">
                                Masuk
                            </Link>
                            <Link className="store-register" to="/register">
                                Daftar
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
