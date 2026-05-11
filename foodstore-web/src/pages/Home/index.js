import React from 'react'
import TopBar from '../../component/Topbar';
import BounceLoader from 'react-spinners/BounceLoader';
import Cart from '../../component/Cart';
import AppSidebar from '../../component/AppSidebar';

import { useHistory } from 'react-router-dom';
import { addItem, removeItem } from '../../features/Cart/actions';
import { LayoutSidebar, Responsive, CardProduct, Pagination, InputText, Pill } from 'upkit';
import { useDispatch, useSelector } from 'react-redux';
import { config } from '../../config';
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
                content={<div className="md:flex md:flex-row-reverse w-full mr-5 h-full min-h-screen">

                    <div className="w-full md:w-3/4 pl-5 pb-10">
                        <TopBar />

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
                            {products.data.map((product, index) => (
                                <div key={index} className="p-2">
                                    <CardProduct
                                        title={product.name}
                                        imgUrl={`${config.api_host}/upload/${product.image_url}`}
                                        price={product.price}
                                        onAddToCart={() => dispatch(addItem(product))}
                                    />
                                </div>
                            ))}
                        </Responsive>

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
