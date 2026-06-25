import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from '@emotion/styled';
import BounceLoader from 'react-spinners/BounceLoader';
import AccountLayout from '../../component/AccountLayout';
import { getWishlist, removeFromWishlist } from '../../api/wishlist';
import { addItem } from '../../features/Cart/actions';
import { formatRupiah } from '../../utils/format-rupiah';
import { getImageUrl } from '../../utils/image-url';

export default function Wishlist() {
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const history = useHistory();

    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [removingId, setRemovingId] = React.useState(null);

    React.useEffect(() => {
        if (!auth?.token) { history.push('/login'); return; }
        getWishlist()
            .then(res => setItems(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [auth, history]);

    const handleRemove = async (productId) => {
        setRemovingId(productId);
        try {
            await removeFromWishlist(productId);
            setItems(prev => prev.filter(i => String(i.product?._id) !== String(productId)));
        } catch {}
        setRemovingId(null);
    };

    const handleAddToCart = (product) => {
        dispatch(addItem(product));
    };

    return (
        <AccountLayout activeTab="wishlist">
            <Section>
                <SectionTitle>Wishlist Saya</SectionTitle>

                {loading ? (
                    <Center><BounceLoader color="#c0392b" size={36} /></Center>
                ) : items.length === 0 ? (
                    <Empty>
                        <span style={{ fontSize: 52 }}>🤍</span>
                        <p>Belum ada produk di wishlist</p>
                        <BackBtn onClick={() => history.push('/')}>Mulai Belanja</BackBtn>
                    </Empty>
                ) : (
                    <Grid>
                        {items.map((item) => {
                            const product = item.product;
                            if (!product) return null;
                            return (
                                <Card key={item._id}>
                                    <Img
                                        src={getImageUrl(product.image_url)}
                                        alt={product.name}
                                        onClick={() => history.push('/')}
                                    />
                                    <CardBody>
                                        <ProductName>{product.name}</ProductName>
                                        <Price>{formatRupiah(product.price)}</Price>
                                        <Actions>
                                            <CartBtn onClick={() => handleAddToCart(product)}>
                                                + Keranjang
                                            </CartBtn>
                                            <RemoveBtn
                                                onClick={() => handleRemove(product._id)}
                                                disabled={removingId === product._id}
                                            >
                                                {removingId === product._id ? '...' : '🗑'}
                                            </RemoveBtn>
                                        </Actions>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </Grid>
                )}
            </Section>
        </AccountLayout>
    );
}

const Section = styled('div')({
    padding: '1.5rem',
    '@media (max-width: 640px)': { padding: '1rem 0.75rem' },
});

const SectionTitle = styled('h2')({
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 1.25rem',
});

const Center = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 80,
});

const Empty = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    paddingTop: 80,
    color: '#aaa',
    '& p': { fontSize: 16, margin: 0 },
});

const BackBtn = styled('button')({
    marginTop: 8,
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
});

const Grid = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
});

const Card = styled('div')({
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
});

const Img = styled('img')({
    width: '100%',
    height: 140,
    objectFit: 'cover',
    cursor: 'pointer',
});

const CardBody = styled('div')({
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
});

const ProductName = styled('p')({
    fontSize: 14,
    fontWeight: 600,
    color: '#222',
    margin: 0,
    lineHeight: 1.3,
});

const Price = styled('span')({
    fontSize: 14,
    fontWeight: 700,
    color: '#c0392b',
});

const Actions = styled('div')({
    display: 'flex',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 8,
});

const CartBtn = styled('button')({
    flex: 1,
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '7px 0',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#a93226' },
});

const RemoveBtn = styled('button')({
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: 6,
    padding: '7px 10px',
    fontSize: 14,
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#ffe0e0' },
});
