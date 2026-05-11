import * as React from 'react';
import FaArrowRight from '@meronex/icons/fa/FaArrowRight';
import FaCartPlus from '@meronex/icons/fa/FaCartPlus';
import FaShoppingBasket from '@meronex/icons/fa/FaShoppingBasket';

import { formatRupiah } from '../../utils/format-rupiah';
import { sumPrice } from '../../utils/sum-price';
import { arrayOf, string, shape, oneOfType, number, func } from 'prop-types';
import { CardItem } from 'upkit';
import { config } from '../../config';
import styled from '@emotion/styled';

export default function Cart({ items, onItemInc, onItemDec, onCheckout }) {
    let total = sumPrice(items);
    let totalQty = items.reduce((sum, i) => sum + Number(i.qty), 0);

    return (
        <Wrapper>
            <Header>
                <HeaderIcon><FaCartPlus /></HeaderIcon>
                <HeaderTitle>Keranjang</HeaderTitle>
                {totalQty > 0 && <Badge>{totalQty}</Badge>}
            </Header>

            <Body>
                {items.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon><FaShoppingBasket /></EmptyIcon>
                        <EmptyText>Keranjang masih kosong</EmptyText>
                        <EmptyHint>Tambahkan menu favoritmu!</EmptyHint>
                    </EmptyState>
                ) : (
                    <ItemList>
                        {items.map((item, index) => (
                            <ItemRow key={index}>
                                <CardItem
                                    imgUrl={`${config.api_host}/upload/${item.image_url}`}
                                    name={item.name}
                                    qty={item.qty}
                                    color="orange"
                                    onInc={() => onItemInc(item)}
                                    onDec={() => onItemDec(item)}
                                />
                            </ItemRow>
                        ))}
                    </ItemList>
                )}
            </Body>

            <Footer>
                <TotalBox>
                    <TotalLabel>Total</TotalLabel>
                    <TotalValue>{formatRupiah(total)}</TotalValue>
                </TotalBox>
                <CheckoutBtn disabled={!items.length} onClick={onCheckout}>
                    <span>Checkout</span>
                    <FaArrowRight />
                </CheckoutBtn>
            </Footer>
        </Wrapper>
    );
}

Cart.propTypes = {
    items: arrayOf(shape({
        _id: string.isRequired,
        name: string.isRequired,
        qty: oneOfType([string, number]).isRequired,
    })),
    onItemInc: func,
    onItemDec: func,
    onCheckout: func,
};

const Wrapper = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '100vh',
    backgroundColor: '#fff',
});

const Header = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#c0392b',
    color: 'white',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
});

const HeaderIcon = styled('div')({
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
});

const HeaderTitle = styled('span')({
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.3,
    flex: 1,
});

const Badge = styled('span')({
    backgroundColor: 'white',
    color: '#c0392b',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    minWidth: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
});

const Body = styled('div')({
    flex: 1,
    overflowY: 'auto',
    padding: '12px 0',
});

const EmptyState = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    color: '#aaa',
});

const EmptyIcon = styled('div')({
    fontSize: 56,
    marginBottom: 16,
    color: '#ddd',
});

const EmptyText = styled('p')({
    fontSize: 15,
    fontWeight: 600,
    color: '#bbb',
    margin: 0,
});

const EmptyHint = styled('p')({
    fontSize: 13,
    color: '#ccc',
    marginTop: 6,
});

const ItemList = styled('div')({
    padding: '0 12px',
});

const ItemRow = styled('div')({
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
});

const Footer = styled('div')({
    borderTop: '1px solid #f0f0f0',
    padding: '16px 16px 20px',
    backgroundColor: '#fff',
    position: 'sticky',
    bottom: 0,
});

const TotalBox = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef9f9',
    border: '1px solid #f5c6c6',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 12,
});

const TotalLabel = styled('span')({
    fontSize: 13,
    color: '#888',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
});

const TotalValue = styled('span')({
    fontSize: 16,
    fontWeight: 700,
    color: '#c0392b',
});

const CheckoutBtn = styled('button')(props => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: props.disabled ? '#e0e0e0' : '#c0392b',
    color: props.disabled ? '#aaa' : 'white',
    border: 'none',
    borderRadius: 10,
    padding: '13px 20px',
    fontSize: 15,
    fontWeight: 700,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
    letterSpacing: 0.3,
    '&:hover': {
        backgroundColor: props.disabled ? '#e0e0e0' : '#a93226',
    },
}));
