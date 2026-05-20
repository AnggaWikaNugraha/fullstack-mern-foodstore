import React from 'react';
import BounceLoader from 'react-spinners/BounceLoader';
import StarRating from '../../component/StarRating';
import { getImageUrl } from '../../utils/image-url';
import { get as getCategoryList } from '../../api/category';

import { useHistory } from 'react-router-dom';
import { addItem } from '../../features/Cart/actions';
import { Responsive, Pagination, Pill } from 'upkit';
import { formatRupiah } from '../../utils/format-rupiah';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setPage, goToNextPage, goToPrevPage, setKeyword, setCategory, toggleTag } from '../../features/products/actions';
import { getTags } from '../../api/tag';
import { getWishlist, addToWishlist, removeFromWishlist } from '../../api/wishlist';
import { saveCart, cartState } from '../../api/cart';
import store from '../../app/store';

const banners = [
    {
        badge: '🍽️ Menu Terpopuler',
        title: 'Pesan Makanan\nFavoritmu!',
        subtitle: 'Nikmati kemudahan pesan makanan kapan saja & di mana saja',
        gradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 60%, #ff6b6b 100%)',
        circle1: 'rgba(255,255,255,0.12)',
        circle2: 'rgba(255,255,255,0.07)',
        emojis: ['🍜', '🍣', '🍕'],
    },
    {
        badge: '🔥 Promo Spesial',
        title: 'Diskon Hingga\n30% Hari Ini!',
        subtitle: 'Minuman segar pilihan dengan harga terbaik untukmu',
        gradient: 'linear-gradient(135deg, #c0392b 0%, #d35400 55%, #e67e22 100%)',
        circle1: 'rgba(255,255,255,0.12)',
        circle2: 'rgba(255,255,255,0.07)',
        emojis: ['🥤', '🧋', '🍹'],
    },
    {
        badge: '🌿 Pilihan Sehat',
        title: 'Fresh & Lezat\nSetiap Hari!',
        subtitle: 'Bahan-bahan segar langsung dari sumber terpercaya',
        gradient: 'linear-gradient(135deg, #16a085 0%, #1abc9c 55%, #48c9b0 100%)',
        circle1: 'rgba(255,255,255,0.12)',
        circle2: 'rgba(255,255,255,0.07)',
        emojis: ['🥗', '🥑', '🍎'],
    },
];

const iconMap = {
    utama:   '/images/menus/utama.png',
    minuman: '/images/menus/minuman.png',
    snack:   '/images/menus/snack.png',
    pastry:  '/images/menus/pastry.png',
};
const defaultIcon = '/images/menus/semua.png';


const Home = () => {
    const dispatch = useDispatch();
    const history  = useHistory();

    const products = useSelector(state => state.products);
    const auth     = useSelector(state => state.auth);

    const [bannerIdx,      setBannerIdx]      = React.useState(0);
    const [categories,     setCategories]     = React.useState([{ icon: defaultIcon, label: 'Semua', id: '' }]);
    const [activeCategory, setActiveCategory] = React.useState('');
    const [availableTags,  setAvailableTags]  = React.useState([]);
    const [wishlistIds,    setWishlistIds]    = React.useState([]);
    const [addingId,       setAddingId]       = React.useState(null);
    const [successId,      setSuccessId]      = React.useState(null);

    // Auto-rotate banner
    React.useEffect(() => {
        const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
        return () => clearInterval(t);
    }, []);

    // Fetch categories
    React.useEffect(() => {
        getCategoryList({ limit: 100 })
            .then(res => {
                setCategories([
                    { icon: defaultIcon, label: 'Semua', id: '' },
                    ...(res.data?.data || []).map(cat => ({
                        icon: iconMap[cat.name] || defaultIcon,
                        label: cat.name,
                        id: cat.name,
                    })),
                ]);
            })
            .catch(() => {});
    }, []);

    // Fetch tags
    React.useEffect(() => {
        getTags({ limit: 100 })
            .then(res => setAvailableTags(res.data))
            .catch(() => setAvailableTags([]));
    }, []);

    // Fetch wishlist
    React.useEffect(() => {
        if (!auth?.token) return;
        getWishlist()
            .then(res => setWishlistIds((res.data.data || []).map(i => String(i.product?._id))))
            .catch(() => {});
    }, [auth]);

    // Fetch products on filter change
    React.useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch, products.currentPage, products.keyword, products.category, products.tags]);

    const handleCategoryChange = (id) => {
        setActiveCategory(id);
        dispatch(setCategory(id));
    };

    const handleAddToCart = async (product) => {
        if (addingId) return;
        setAddingId(product._id);
        cartState.skipNextSave = true;
        dispatch(addItem(product));
        try {
            const { token } = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')) : {};
            await saveCart(token, store.getState().cart);
            setSuccessId(product._id);
            setTimeout(() => setSuccessId(null), 1500);
        } catch { /* listener retry */ } finally {
            setAddingId(null);
        }
    };

    const toggleWishlist = async (product) => {
        if (!auth?.token) { history.push('/login'); return; }
        const pid = String(product._id);
        const isWishlisted = wishlistIds.includes(pid);
        setWishlistIds(prev => isWishlisted ? prev.filter(id => id !== pid) : [...prev, pid]);
        try {
            if (isWishlisted) await removeFromWishlist(pid);
            else await addToWishlist(pid);
        } catch {
            setWishlistIds(prev => isWishlisted ? [...prev, pid] : prev.filter(id => id !== pid));
        }
    };

    return (
        <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 3.75rem)' }}>
            <div style={{ maxWidth: '95rem', margin: '0 auto', padding: '1.25rem 1.5rem' }}>

                {/* ── Banner carousel ── */}
                <div className="banner-wrap" style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden', marginBottom: '1.25rem', height: '17rem' }}>
                    {banners.map((b, idx) => (
                        <div key={idx} className="banner-slide" style={{
                            position: 'absolute', inset: 0,
                            background: b.gradient,
                            opacity: idx === bannerIdx ? 1 : 0,
                            transition: 'opacity 0.6s ease',
                            display: 'flex', alignItems: 'center',
                            padding: '0 2.5rem', gap: '1.5rem',
                            pointerEvents: idx === bannerIdx ? 'auto' : 'none',
                            overflow: 'hidden',
                        }}>
                            {/* Decorative circles */}
                            <div style={{
                                position: 'absolute', width: '22rem', height: '22rem',
                                borderRadius: '50%', background: b.circle1,
                                top: '-8rem', right: '-4rem', pointerEvents: 'none',
                            }} />
                            <div style={{
                                position: 'absolute', width: '14rem', height: '14rem',
                                borderRadius: '50%', background: b.circle2,
                                bottom: '-5rem', right: '8rem', pointerEvents: 'none',
                            }} />
                            <div style={{
                                position: 'absolute', width: '8rem', height: '8rem',
                                borderRadius: '50%', background: b.circle1,
                                top: '1rem', right: '13rem', pointerEvents: 'none',
                            }} />

                            {/* Text content */}
                            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                <div className="banner-badge" style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                                    borderRadius: '999px', padding: '0.25rem 0.875rem',
                                    fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                                    marginBottom: '0.75rem', letterSpacing: '0.01em',
                                }}>
                                    {b.badge}
                                </div>
                                <div className="banner-title" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '0.5rem', whiteSpace: 'pre-line' }}>
                                    {b.title}
                                </div>
                                <div className="banner-subtitle" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                                    {b.subtitle}
                                </div>
                                <button className="banner-btn" style={{
                                    background: '#fff', color: '#c0392b',
                                    border: 'none', borderRadius: '2rem',
                                    padding: '0.55rem 1.5rem',
                                    fontWeight: 700, fontSize: '0.8125rem',
                                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}>
                                    Pesan Sekarang →
                                </button>
                            </div>

                            {/* Emoji cluster */}
                            <div className="banner-emoji-cluster" style={{ position: 'relative', flexShrink: 0, width: '9rem', height: '9rem', zIndex: 1 }}>
                                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '4rem', lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
                                    {b.emojis[0]}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '2.5rem', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                                    {b.emojis[1]}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, fontSize: '2.5rem', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                                    {b.emojis[2]}
                                </div>
                            </div>
                        </div>
                    ))}


                    {/* Dots */}
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.375rem', zIndex: 2 }}>
                        {banners.map((_, idx) => (
                            <button key={idx} onClick={() => setBannerIdx(idx)} style={{
                                width: idx === bannerIdx ? '1.5rem' : '0.5rem',
                                height: '0.5rem', borderRadius: '999px',
                                border: 'none', padding: 0,
                                background: idx === bannerIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', transition: 'all 0.3s',
                            }} />
                        ))}
                    </div>
                </div>

                {/* ── Category icons ── */}
                <div style={{
                    background: '#fff', borderRadius: '0.75rem',
                    padding: '1rem 1.25rem', marginBottom: '1rem',
                    boxShadow: '0 0.0625rem 0.25rem rgba(0,0,0,0.06)',
                }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111', marginBottom: '0.75rem' }}>Kategori</div>
                    <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: '0.375rem', padding: '0.5rem 1rem',
                                background: activeCategory === cat.id ? '#fef2f2' : 'transparent',
                                border: `1.5px solid ${activeCategory === cat.id ? '#c0392b' : 'transparent'}`,
                                borderRadius: '0.75rem', cursor: 'pointer',
                                minWidth: '4.5rem', flexShrink: 0,
                                transition: 'all 0.15s',
                            }}>
                                <div style={{
                                    width: '2.75rem', height: '2.75rem',
                                    borderRadius: '0.75rem',
                                    background: '#c0392b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <img
                                        src={cat.icon} alt={cat.label}
                                        onError={e => { e.target.src = defaultIcon; }}
                                        style={{ width: '1.75rem', height: '1.75rem', objectFit: 'contain' }}
                                    />
                                </div>
                                <span style={{
                                    fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap',
                                    color: activeCategory === cat.id ? '#c0392b' : '#555',
                                    textTransform: 'capitalize',
                                }}>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tags ── */}
                {availableTags.length > 0 && (
                    <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                        {availableTags.map((tag, i) => (
                            <div key={i} style={{ flexShrink: 0 }}>
                                <Pill
                                    text={tag.name}
                                    icon={tag.name.slice(0, 1).toUpperCase()}
                                    isActive={products.tags.includes(tag.name)}
                                    onClick={() => dispatch(toggleTag(tag.name))}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Loading ── */}
                {products.status === 'process' && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                        <BounceLoader color="#c0392b" />
                    </div>
                )}

                {/* ── Product grid ── */}
                {products.status !== 'process' && (
                <Responsive desktop={6} tablet={3} mobile={2} items="stretch">
                    {products.data.map((product, index) => {
                        const outOfStock = product.stock === 0;
                        return (
                            <div key={index} style={{ padding: '0.375rem' }}>
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '1rem',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 12px rgba(192,57,43,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                                    border: '1px solid #f5eded',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}>
                                    {/* Image area */}
                                    <div style={{
                                        position: 'relative',
                                        paddingTop: '72%',
                                        background: 'linear-gradient(145deg, #fff9f7 0%, #fef0ec 100%)',
                                        flexShrink: 0,
                                    }}>
                                        <img
                                            src={getImageUrl(product.image_url)}
                                            alt={product.name}
                                            onError={e => { e.target.src = 'https://via.placeholder.com/200x150?text=No+Image'; }}
                                            style={{
                                                position: 'absolute', inset: 0,
                                                width: '100%', height: '100%',
                                                objectFit: 'cover',
                                                filter: outOfStock ? 'grayscale(40%)' : 'none',
                                            }}
                                        />
                                        {/* Bottom gradient fade */}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            height: '40%',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 100%)',
                                            pointerEvents: 'none',
                                        }} />

                                        {/* Wishlist */}
                                        <button onClick={() => toggleWishlist(product)} style={{
                                            position: 'absolute', top: 8, right: 8,
                                            background: 'rgba(255,255,255,0.95)',
                                            border: 'none', borderRadius: '50%',
                                            width: 30, height: 30,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
                                            fontSize: 14, zIndex: 3, padding: 0,
                                        }}>
                                            {wishlistIds.includes(String(product._id)) ? '❤️' : '🤍'}
                                        </button>

                                        {/* Sisa stok badge on image */}
                                        {product.stock > 0 && product.stock <= 5 && (
                                            <div style={{
                                                position: 'absolute', top: 8, left: 8,
                                                background: '#e67e22', color: '#fff',
                                                borderRadius: 6, padding: '2px 8px',
                                                fontSize: 10, fontWeight: 700, zIndex: 3,
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                            }}>Sisa {product.stock}</div>
                                        )}

                                        {/* Stok habis overlay */}
                                        {outOfStock && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(240,240,240,0.72)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                zIndex: 2,
                                            }}>
                                                <span style={{
                                                    background: '#c0392b', color: '#fff',
                                                    borderRadius: 8, padding: '6px 16px',
                                                    fontWeight: 700, fontSize: 13,
                                                    boxShadow: '0 2px 8px rgba(192,57,43,0.4)',
                                                    letterSpacing: '0.02em',
                                                }}>Stok Habis</span>
                                            </div>
                                        )}

                                        {/* Adding toast */}
                                        {addingId === product._id && (
                                            <div style={{
                                                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                                                background: 'rgba(0,0,0,0.75)', color: '#fff',
                                                borderRadius: 20, padding: '4px 12px',
                                                fontSize: 11, fontWeight: 600,
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                whiteSpace: 'nowrap', zIndex: 5,
                                            }}>
                                                <span style={{
                                                    width: 10, height: 10, border: '2px solid #fff',
                                                    borderTopColor: 'transparent', borderRadius: '50%',
                                                    display: 'inline-block', animation: 'spin 0.6s linear infinite',
                                                }} />
                                                Menambahkan...
                                            </div>
                                        )}
                                        {/* Success toast */}
                                        {successId === product._id && (
                                            <div style={{
                                                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                                                background: '#27ae60', color: '#fff',
                                                borderRadius: 20, padding: '4px 12px',
                                                fontSize: 11, fontWeight: 600,
                                                whiteSpace: 'nowrap', zIndex: 5,
                                            }}>
                                                ✓ Ditambahkan
                                            </div>
                                        )}
                                    </div>

                                    {/* Card body */}
                                    <div style={{ padding: '0.625rem 0.75rem 0.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.875rem', fontWeight: 700, color: '#111',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            marginBottom: '0.2rem',
                                        }}>
                                            {product.name}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9375rem', fontWeight: 800, color: '#c0392b',
                                            marginBottom: '0.5rem',
                                        }}>
                                            {formatRupiah(product.price)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                            <div>
                                                {product.review_count > 0 ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        <StarRating value={Math.round(product.avg_rating)} readonly size={11} />
                                                        <span style={{ fontSize: 10, color: '#999' }}>
                                                            {product.avg_rating} <span style={{ color: '#ccc' }}>({product.review_count})</span>
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 10, color: '#ccc' }}>Belum ada ulasan</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={outOfStock ? undefined : () => handleAddToCart(product)}
                                                disabled={outOfStock || !!addingId}
                                                style={{
                                                    background: outOfStock ? '#f0f0f0' : 'linear-gradient(135deg, #e74c3c, #c0392b)',
                                                    color: outOfStock ? '#bbb' : '#fff',
                                                    border: 'none',
                                                    borderRadius: '0.625rem',
                                                    width: 34, height: 34, flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                                                    fontSize: 22, fontWeight: 700, lineHeight: 1,
                                                    boxShadow: outOfStock ? 'none' : '0 2px 8px rgba(192,57,43,0.35)',
                                                }}
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Responsive>
                )}

                {/* Empty state */}
                {products.status === 'success' && !products.data.length && (
                    <div style={{
                        background: '#fff', borderRadius: '0.75rem',
                        padding: '3rem 2rem', textAlign: 'center',
                        boxShadow: '0 0.0625rem 0.25rem rgba(0,0,0,0.06)',
                    }}>
                        <img src="/images/menus/semua.png" alt="empty"
                            style={{ width: 64, opacity: 0.3, marginBottom: 16 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#555' }}>Produk tidak ditemukan</p>
                        <p style={{ fontSize: 13, marginTop: 4, color: '#999' }}>Coba kata kunci atau filter lain</p>
                    </div>
                )}

                {/* ── Pagination ── */}
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <Pagination
                        totalItems={products.totalItems}
                        page={products.currentPage}
                        perPage={products.perPage}
                        onChange={page => dispatch(setPage(page))}
                        onNext={() => dispatch(goToNextPage())}
                        onPrev={() => dispatch(goToPrevPage())}
                    />
                </div>

            </div>
        </div>
    );
};

export default Home;
