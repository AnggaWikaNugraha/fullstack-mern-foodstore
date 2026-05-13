import React from 'react'
import BounceLoader from 'react-spinners/BounceLoader';
import Cart from '../../component/Cart';
import AppSidebar from '../../component/AppSidebar';
import StarRating from '../../component/StarRating';
import { getImageUrl } from '../../utils/image-url';

import { useHistory } from 'react-router-dom';
import { addItem, removeItem } from '../../features/Cart/actions';
import { LayoutSidebar, Responsive, CardProduct, Pagination, InputText, Pill } from 'upkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setPage, goToNextPage, goToPrevPage, setKeyword, setCategory, toggleTag } from '../../features/products/actions';
import { getTags } from '../../api/tag';

const Home = () => {

    let dispatch = useDispatch();
    let history = useHistory();

    let products = useSelector(state => state.products);
    let cart = useSelector(state => state.cart);

    const [availableTags, setAvailableTags] = React.useState([]);

    React.useEffect(() => {
        getTags({ limit: 100 })
            .then(res => setAvailableTags(res.data))
            .catch(() => setAvailableTags([]));
    }, []);

    React.useEffect(() => {
        dispatch(fetchProducts());
    }, [
        dispatch,
        products.currentPage,
        products.keyword,
        products.category,
        products.tags
    ])

    return (
        <div>
            <LayoutSidebar
                sidebar={<AppSidebar onCategoryChange={category => dispatch(setCategory(category))} />}
                content={<div className="md:flex md:flex-row-reverse w-full mr-5 h-full">

                    <div className="w-full md:w-3/4 pl-5 pb-10">

                        <div className="mb-5 mt-5 pl-2 flex w-3/3 overflow-auto pb-5">
                            {availableTags.map((tag, index) => (
                                <div key={index}>
                                    <Pill
                                        text={tag.name}
                                        icon={tag.name.slice(0, 1).toUpperCase()}
                                        isActive={products.tags.includes(tag.name)}
                                        onClick={() => dispatch(toggleTag(tag.name))}
                                    />
                                </div>
                            ))}
                        </div>

                        {products.status === 'process' && !products.data.length ?
                            <div className="flex justify-center">
                                <BounceLoader color="red" />
                            </div>
                            : null
                        }

                        <div className="w-full text-center mb-10 mt-5">
                            <InputText
                                fullRound
                                value={products.keyword}
                                placeholder="cari makanan favoritmu..."
                                fitContainer
                                onChange={e => dispatch(setKeyword(e.target.value))}
                            />
                        </div>

                        <Responsive desktop={3} items="stretch">
                            {products.data.map((product, index) => {
                                const outOfStock = product.stock === 0;
                                return (
                                    <div key={index} className="p-2" style={{ position: 'relative' }}>
                                        <CardProduct
                                            title={product.name}
                                            imgUrl={getImageUrl(product.image_url)}
                                            price={product.price}
                                            onAddToCart={outOfStock ? () => {} : () => dispatch(addItem(product))}
                                        />
                                        {outOfStock && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                backgroundColor: 'rgba(255,255,255,0.78)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: 8, zIndex: 1,
                                            }}>
                                                <span style={{
                                                    backgroundColor: '#c0392b', color: 'white',
                                                    borderRadius: 6, padding: '6px 16px',
                                                    fontWeight: 700, fontSize: 14,
                                                }}>Stok Habis</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 2px' }}>
                                            {product.review_count > 0 ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <StarRating value={Math.round(product.avg_rating)} readonly size={13} />
                                                    <span style={{ fontSize: 12, color: '#888' }}>
                                                        {product.avg_rating} ({product.review_count})
                                                    </span>
                                                </div>
                                            ) : <span />}
                                            {product.stock > 0 && product.stock <= 5 && (
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700,
                                                    color: '#e67e22',
                                                    backgroundColor: '#fff8e1',
                                                    border: '1px solid #f0c040',
                                                    borderRadius: 4,
                                                    padding: '2px 7px',
                                                }}>
                                                    Sisa {product.stock}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </Responsive>

                        {products.status === 'success' && !products.data.length ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <img src="/images/menus/semua.png" alt="empty" style={{ width: 64, opacity: 0.3, marginBottom: 16 }} />
                                <p style={{ fontSize: 16, fontWeight: 600 }}>Produk tidak ditemukan</p>
                                <p style={{ fontSize: 13, marginTop: 4 }}>Coba kata kunci atau filter lain</p>
                            </div>
                        ) : null}

                        <div className="text-center my-10">
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

                    <div className="w-full md:w-1/4 h-full shadow-lg border-r border-white bg-gray-100">
                        <Cart
                            items={cart}
                            onItemInc={item => dispatch(addItem(item))}
                            onItemDec={item => dispatch(removeItem(item))}
                            onCheckout={() => history.push("/checkout")}
                        />
                    </div>

                </div>}
                sidebarSize={80}
            />
        </div>
    )
}

export default Home
