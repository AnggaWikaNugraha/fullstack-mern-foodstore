import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import StoreIcon from '../../component/StoreIcon';
import { getImageUrl } from '../../utils/image-url';
import { formatRupiah } from '../../utils/format-rupiah';
import { get as getCategoryList } from '../../api/category';
import { getTags } from '../../api/tag';
import { getWishlist, addToWishlist, removeFromWishlist } from '../../api/wishlist';
import { saveCart, cartState } from '../../api/cart';
import { addItem, removeItem } from '../../features/Cart/actions';
import { fetchProducts, setPage, setCategory, toggleTag } from '../../features/products/actions';
import './home.css';

const defaultIcon = '/images/menus/semua.png';
const categoryDetails = {
    utama: { icon: 'utama', label: 'Makanan utama', description: 'Bikin kenyang & senang' },
    minuman: { icon: 'minuman', label: 'Minuman', description: 'Segarkan harimu' },
    snack: { icon: 'snack', label: 'Camilan', description: 'Teman di segala suasana' },
    pastry: { icon: 'pastry', label: 'Roti & pastry', description: 'Manisnya momen kecil' },
};
const allCategory = { id: '', label: 'Semua menu', icon: defaultIcon, description: 'Temukan favoritmu' };

function ProductImage({ product }) {
    const [failed, setFailed] = React.useState(false);
    React.useEffect(() => setFailed(false), [product.image_url]);
    if (failed || !product.image_url)
        return (
            <div className="home-image-fallback">
                <StoreIcon name="dish" size={48} />
                <span>Foto belum tersedia</span>
            </div>
        );
    return (
        <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
}

export default function Home() {
    const dispatch = useDispatch();
    const history = useHistory();
    const store = useStore();
    const products = useSelector((state) => state.products);
    const auth = useSelector((state) => state.auth);
    const cart = useSelector((state) => state.cart);
    const [categories, setCategories] = React.useState([allCategory]);
    const [availableTags, setAvailableTags] = React.useState([]);
    const [wishlistIds, setWishlistIds] = React.useState([]);
    const [wishPending, setWishPending] = React.useState(null);
    const [addingId, setAddingId] = React.useState(null);
    const [notice, setNotice] = React.useState(null);
    const cartLock = React.useRef(false);
    const wishlistLock = React.useRef(false);
    const noticeTimer = React.useRef(null);

    React.useEffect(() => {
        let active = true;
        getCategoryList({ limit: 100 })
            .then((res) => {
                if (!active) return;
                setCategories([
                    allCategory,
                    ...(res.data?.data || []).map((category) => {
                        const details = categoryDetails[category.name.toLowerCase()];
                        return {
                            id: category.name,
                            label: details?.label || category.name,
                            icon: details ? `/images/menus/${details.icon}.png` : defaultIcon,
                            description: details?.description || 'Pilihan untuk kamu',
                        };
                    }),
                ]);
            })
            .catch(() => {});
        getTags({ limit: 100 })
            .then((res) => {
                if (active) setAvailableTags(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    React.useEffect(() => {
        let active = true;
        setWishlistIds([]);
        if (auth?.token)
            getWishlist()
                .then((res) => {
                    if (active)
                        setWishlistIds((res.data.data || []).map((item) => String(item.product?._id)));
                })
                .catch(() => {});
        return () => {
            active = false;
        };
    }, [auth?.token]);

    React.useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch, products.currentPage, products.keyword, products.category, products.tags]);
    React.useEffect(() => () => clearTimeout(noticeTimer.current), []);

    function showNotice(message, error = false) {
        clearTimeout(noticeTimer.current);
        setNotice({ message, error });
        noticeTimer.current = setTimeout(() => setNotice(null), 5000);
    }

    function browseMenu(category) {
        if (category !== undefined) dispatch(setCategory(category));
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function handleAddToCart(product) {
        if (!auth?.token) {
            history.push('/login');
            return;
        }
        if (cartLock.current || product.stock === 0) return;
        cartLock.current = true;
        setAddingId(product._id);
        cartState.skipNextSave = true;
        dispatch(addItem(product));
        try {
            const response = await saveCart(auth.token, store.getState().cart);
            if (response.data?.error) throw new Error('Cart save failed');
            showNotice(`${product.name} ditambahkan ke keranjang.`);
        } catch {
            cartState.skipNextSave = true;
            dispatch(removeItem(product));
            showNotice('Belum berhasil menambahkan menu. Silakan coba lagi.', true);
        } finally {
            cartLock.current = false;
            setAddingId(null);
        }
    }

    async function toggleWishlist(product) {
        if (!auth?.token) {
            history.push('/login');
            return;
        }
        if (wishlistLock.current) return;
        wishlistLock.current = true;
        const id = String(product._id);
        const selected = wishlistIds.includes(id);
        setWishPending(id);
        setWishlistIds((prev) => (selected ? prev.filter((item) => item !== id) : [...prev, id]));
        try {
            const response = selected ? await removeFromWishlist(id) : await addToWishlist(id);
            if (response.data?.error) throw new Error('Wishlist save failed');
        } catch {
            setWishlistIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
            showNotice('Favorit belum tersimpan. Silakan coba lagi.', true);
        } finally {
            wishlistLock.current = false;
            setWishPending(null);
        }
    }

    const filtered = !!(products.keyword || products.category || products.tags.length);
    const pageCount = Math.max(1, Math.ceil(products.totalItems / products.perPage));
    const activeCategory = categories.find((category) => category.id === products.category);
    const firstPage = Math.max(1, Math.min(products.currentPage - 2, pageCount - 4));
    const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstPage + index);

    return (
        <main className="storefront">
            <div className="home-container">
                <section className="home-hero" aria-labelledby="home-title">
                    <div className="home-hero-copy">
                        <span className="home-eyebrow">
                            <span /> GOOD FOOD, GOOD MOOD
                        </span>
                        <h1 id="home-title">
                            Enaknya sampai
                            <br />
                            bikin <span>happy.</span>
                        </h1>
                        <p>
                            Dari suapan pertama sampai gigitan terakhir.
                            <br className="home-desktop-break" /> Temukan menu favorit untuk setiap suasana.
                        </p>
                        <button className="home-button home-button-primary" onClick={() => browseMenu('')}>
                            Jelajahi menu <StoreIcon name="arrow" size={18} />
                        </button>
                        <div className="home-hero-note">
                            <StoreIcon name="heart" size={15} /> Pilihan lezat, untuk momen yang hangat.
                        </div>
                    </div>
                    <div className="home-hero-visual">
                        <img
                            className="home-hero-image"
                            src="/images/home/hero-burger.jpg"
                            alt="Burger dengan keju, sayuran segar, dan kentang goreng di atas piring"
                            width="1536"
                            height="1024"
                        />
                        <span className="home-hero-sticker">
                            A little bite.
                            <br />
                            <strong>A lot of joy.</strong>
                            <StoreIcon name="sparkles" size={20} />
                        </span>
                        <span className="home-image-caption">Inspirasi sajian FoodStore</span>
                    </div>
                </section>

                <div className="home-benefits">
                    <div>
                        <StoreIcon name="dish" size={24} />
                        <span>
                            <strong>Banyak pilihan, satu tempat</strong>
                            <small>Makanan, minuman, dan camilan favorit</small>
                        </span>
                    </div>
                    <div>
                        <StoreIcon name="bag" size={24} />
                        <span>
                            <strong>Pesan tanpa ribet</strong>
                            <small>Pilih menu, masukkan keranjang, checkout</small>
                        </span>
                    </div>
                    <div>
                        <StoreIcon name="heart" size={24} />
                        <span>
                            <strong>Simpan yang kamu suka</strong>
                            <small>Menu favorit lebih mudah ditemukan lagi</small>
                        </span>
                    </div>
                </div>

                <section className="home-categories" aria-labelledby="category-title">
                    <div className="home-section-heading">
                        <div>
                            <span className="home-kicker">MULAI DARI YANG KAMU SUKA</span>
                            <h2 id="category-title">Lagi pengin apa?</h2>
                        </div>
                        <button className="home-text-button" onClick={() => browseMenu('')}>
                            Lihat semua menu <StoreIcon name="arrow" size={17} />
                        </button>
                    </div>
                    <div className="home-category-grid">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`home-category ${products.category === category.id ? 'is-active' : ''}`}
                                aria-pressed={products.category === category.id}
                                onClick={() => browseMenu(category.id)}
                            >
                                <span className="home-category-icon">
                                    <img src={category.icon} alt="" width="32" height="32" />
                                </span>
                                <span>
                                    <strong>{category.label}</strong>
                                    <small>{category.description}</small>
                                </span>
                                <StoreIcon name="chevron" size={16} />
                            </button>
                        ))}
                    </div>
                </section>

                <section className="home-menu" id="menu" aria-labelledby="menu-title">
                    <div className="home-section-heading">
                        <div>
                            <span className="home-kicker">DIBUAT UNTUK SELERAMU</span>
                            <h2 id="menu-title">
                                {products.keyword
                                    ? `Hasil untuk “${products.keyword}”`
                                    : products.category
                                      ? activeCategory?.label || products.category
                                      : 'Menu untuk hari ini'}
                            </h2>
                            <p>
                                {filtered
                                    ? 'Temukan pilihan yang paling pas untukmu.'
                                    : 'Makan enak nggak perlu menunggu momen spesial.'}
                            </p>
                        </div>
                        {products.status === 'success' && (
                            <span className="home-result-count">{products.totalItems} menu tersedia</span>
                        )}
                    </div>
                    {(availableTags.length > 0 || filtered) && (
                        <div className="home-filters">
                            <span className="home-filter-label">
                                <StoreIcon name="filter" size={16} /> Selera kamu
                            </span>
                            <div className="home-tag-list">
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag._id || tag.name}
                                        className={`home-tag ${products.tags.includes(tag.name) ? 'is-active' : ''}`}
                                        aria-pressed={products.tags.includes(tag.name)}
                                        onClick={() => dispatch(toggleTag(tag.name))}
                                    >
                                        {tag.name}
                                        {products.tags.includes(tag.name) && (
                                            <StoreIcon name="check" size={13} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            {filtered && (
                                <button className="home-reset" onClick={() => dispatch(setCategory(''))}>
                                    Reset filter <StoreIcon name="close" size={14} />
                                </button>
                            )}
                        </div>
                    )}

                    {(products.status === 'process' || products.status === 'idle') && (
                        <div className="home-product-grid" role="status" aria-label="Memuat menu">
                            <span className="home-sr-only">Sedang memuat menu…</span>
                            {Array.from({ length: products.perPage }, (_, index) => (
                                <div className="home-skeleton" key={index}>
                                    <div />
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            ))}
                        </div>
                    )}
                    {products.status === 'error' && (
                        <div className="home-empty" role="alert">
                            <StoreIcon name="dish" size={42} />
                            <h3>Menu belum bisa dimuat</h3>
                            <p>Periksa koneksi kamu, lalu coba sekali lagi.</p>
                            <button
                                className="home-button home-button-primary"
                                onClick={() => dispatch(fetchProducts())}
                            >
                                Coba lagi <StoreIcon name="arrow" size={16} />
                            </button>
                        </div>
                    )}
                    {products.status === 'success' && !products.data.length && (
                        <div className="home-empty">
                            <StoreIcon name="search" size={42} />
                            <h3>Menu yang kamu cari belum ketemu</h3>
                            <p>Coba kata kunci lain atau jelajahi semua menu kami.</p>
                            <button
                                className="home-button home-button-primary"
                                onClick={() => dispatch(setCategory(''))}
                            >
                                Lihat semua menu <StoreIcon name="arrow" size={16} />
                            </button>
                        </div>
                    )}
                    {products.status === 'success' && products.data.length > 0 && (
                        <div className="home-product-grid">
                            {products.data.map((product) => {
                                const outOfStock = product.stock === 0;
                                const quantity = cart.find((item) => item._id === product._id)?.qty || 0;
                                const stockLimit =
                                    typeof product.stock === 'number' && quantity >= product.stock;
                                const wishlisted = wishlistIds.includes(String(product._id));
                                return (
                                    <article
                                        className={`home-product ${outOfStock ? 'is-sold-out' : ''}`}
                                        key={product._id}
                                    >
                                        <div className="home-product-image">
                                            <ProductImage product={product} />
                                            <button
                                                className={`home-wishlist ${wishlisted ? 'is-selected' : ''}`}
                                                onClick={() => toggleWishlist(product)}
                                                disabled={!!wishPending}
                                                aria-pressed={wishlisted}
                                                aria-label={`${wishlisted ? 'Hapus' : 'Simpan'} ${product.name} ${wishlisted ? 'dari' : 'ke'} favorit`}
                                            >
                                                <StoreIcon
                                                    name="heart"
                                                    size={19}
                                                    fill={wishlisted ? 'currentColor' : 'none'}
                                                />
                                            </button>
                                            {outOfStock ? (
                                                <span className="home-stock-badge is-empty">Stok habis</span>
                                            ) : product.stock > 0 && product.stock <= 5 ? (
                                                <span className="home-stock-badge">
                                                    Tersisa {product.stock} porsi
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="home-product-body">
                                            <div className="home-product-meta">
                                                <span>{product.category?.name || 'Menu pilihan'}</span>
                                                <span className="home-rating">
                                                    {product.review_count > 0 ? (
                                                        <>
                                                            <span aria-hidden="true">★</span>{' '}
                                                            {Number(product.avg_rating).toFixed(1)}{' '}
                                                            <small>({product.review_count} ulasan)</small>
                                                        </>
                                                    ) : (
                                                        <small>Belum ada ulasan</small>
                                                    )}
                                                </span>
                                            </div>
                                            <h3>{product.name}</h3>
                                            <p className="home-product-description">
                                                {product.description ||
                                                    'Pilihan lezat untuk menemani harimu.'}
                                            </p>
                                            <div className="home-product-bottom">
                                                <div>
                                                    <small>Harga per porsi</small>
                                                    <strong>{formatRupiah(product.price)}</strong>
                                                </div>
                                                <button
                                                    className="home-add-button"
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={outOfStock || stockLimit || !!addingId}
                                                    aria-label={`Tambah ${product.name} ke keranjang`}
                                                >
                                                    {addingId === product._id ? (
                                                        <>
                                                            <span className="home-spinner" /> Menambah
                                                        </>
                                                    ) : outOfStock ? (
                                                        'Habis'
                                                    ) : stockLimit ? (
                                                        'Stok maksimal'
                                                    ) : (
                                                        <>
                                                            <StoreIcon name="plus" size={16} /> Tambah
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {products.status === 'success' && products.totalItems > 0 && (
                        <div className="home-pagination-row">
                            <span>
                                Menampilkan {(products.currentPage - 1) * products.perPage + 1}–
                                {Math.min(products.currentPage * products.perPage, products.totalItems)} dari{' '}
                                {products.totalItems} menu
                            </span>
                            {pageCount > 1 && (
                                <nav className="home-pagination" aria-label="Halaman menu">
                                    <button
                                        aria-label="Halaman sebelumnya"
                                        disabled={products.currentPage <= 1}
                                        onClick={() => {
                                            dispatch(setPage(products.currentPage - 1));
                                            browseMenu();
                                        }}
                                    >
                                        <StoreIcon name="chevron" className="home-chevron-back" size={16} />
                                    </button>
                                    {pages.map((page) => (
                                        <button
                                            key={page}
                                            aria-label={`Halaman ${page}`}
                                            aria-current={page === products.currentPage ? 'page' : undefined}
                                            onClick={() => {
                                                dispatch(setPage(page));
                                                browseMenu();
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        aria-label="Halaman berikutnya"
                                        disabled={products.currentPage >= pageCount}
                                        onClick={() => {
                                            dispatch(setPage(products.currentPage + 1));
                                            browseMenu();
                                        }}
                                    >
                                        <StoreIcon name="chevron" size={16} />
                                    </button>
                                </nav>
                            )}
                        </div>
                    )}
                </section>

                <section className="home-discover" aria-label="Jelajahi FoodStore">
                    <div className="home-discover-card">
                        <div>
                            <span className="home-kicker">SEDIKIT JEDA, BANYAK RASA</span>
                            <h2>
                                Waktunya me-time
                                <br />
                                yang lebih manis.
                            </h2>
                            <p>Cari teman untuk waktu santaimu.</p>
                            <button
                                className="home-text-button"
                                onClick={() =>
                                    browseMenu(
                                        categories.find((category) => category.id.toLowerCase() === 'pastry')
                                            ?.id || ''
                                    )
                                }
                            >
                                Temukan menu <StoreIcon name="arrow" size={17} />
                            </button>
                        </div>
                        <img
                            src="/images/home/pastry.png"
                            alt="Muffin dengan kepingan cokelat"
                            loading="lazy"
                            width="250"
                            height="218"
                        />
                    </div>
                    <div className="home-discover-card home-discover-favorites">
                        <div>
                            <span className="home-kicker">SUKA? SIMPAN DULU.</span>
                            <h2>
                                Favoritmu punya
                                <br />
                                tempat sendiri.
                            </h2>
                            <p>Tinggal simpan, pesan lagi kapan saja.</p>
                            <Link className="home-text-button" to="/wishlist">
                                Lihat favorit <StoreIcon name="arrow" size={17} />
                            </Link>
                        </div>
                        <span className="home-discover-heart">
                            <StoreIcon name="heart" size={70} />
                        </span>
                    </div>
                </section>
                <footer className="home-footer">
                    <div>
                        <Link className="home-footer-brand" to="/">
                            FoodStore<span>.</span>
                        </Link>
                        <p>Seporsi bahagia, setiap hari.</p>
                    </div>
                    <nav aria-label="Tautan FoodStore">
                        <button onClick={() => browseMenu('')}>Jelajahi menu</button>
                        <Link to="/wishlist">Favorit saya</Link>
                        <Link to="/account">Akun saya</Link>
                    </nav>
                    <span>© {new Date().getFullYear()} FoodStore</span>
                </footer>
            </div>
            {notice && (
                <div
                    className={`home-toast ${notice.error ? 'is-error' : ''}`}
                    role={notice.error ? 'alert' : 'status'}
                >
                    <StoreIcon name={notice.error ? 'close' : 'check'} size={20} />
                    <span>{notice.message}</span>
                    {!notice.error && <Link to="/keranjang">Lihat keranjang</Link>}
                    <button onClick={() => setNotice(null)} aria-label="Tutup notifikasi">
                        <StoreIcon name="close" size={16} />
                    </button>
                </div>
            )}
        </main>
    );
}
