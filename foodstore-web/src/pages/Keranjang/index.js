import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader';
import { addItem, removeItem, setItems, toggleCheck } from '../../features/Cart/actions';
import { formatRupiah } from '../../utils/format-rupiah';
import { getImageUrl } from '../../utils/image-url';
import { config } from '../../config';
import { getCart } from '../../api/cart';
import { CART_RESET } from '../../app/constants';

export default function Keranjang() {
    const cart        = useSelector(state => state.cart);
    const cartLoaded  = useSelector(state => state.cartLoaded);
    const cartSaving  = useSelector(state => state.cartSaving);
    const dispatch   = useDispatch();
    const history    = useHistory();

    React.useEffect(() => {
        dispatch({ type: CART_RESET });
        getCart();
    }, [dispatch]);

    const allSelected  = cart.length > 0 && cart.every(i => i.checked !== false);
    const someSelected = cart.some(i => i.checked !== false);

    const toggleSelect = (id) => dispatch(toggleCheck(id));

    const toggleAll = () => {
        dispatch(setItems(cart.map(i => ({ ...i, checked: !allSelected }))));
    };

    const handleDeleteSelected = () => {
        dispatch(setItems(cart.filter(i => i.checked === false)));
    };

    const handleDeleteOne = (id) => {
        dispatch(setItems(cart.filter(i => i._id !== id)));
    };

    const selectedItems = cart.filter(i => i.checked !== false);
    const subTotal  = selectedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const ongkir    = selectedItems.length ? parseInt(config.global_ongkir) || 0 : 0;
    const total     = subTotal + ongkir;
    const totalQty  = selectedItems.reduce((sum, i) => sum + i.qty, 0);

    const handleBeli = () => {
        if (!selectedItems.length) return;
        history.push('/checkout');
    };

    // ref untuk indeterminate state "Pilih Semua"
    const selectAllRef = React.useRef(null);
    React.useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = someSelected && !allSelected;
        }
    }, [someSelected, allSelected]);

    if (!cartLoaded) {
        return (
            <PageBg>
                <PageInner>
                    <PageTitle>Keranjang</PageTitle>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <BounceLoader color="#c0392b" />
                    </div>
                </PageInner>
            </PageBg>
        );
    }

    return (
        <PageBg>
            <PageInner>
                <PageTitle>Keranjang</PageTitle>

                {cart.length === 0 ? (
                    <EmptyWrap>
                        <EmptyIcon>🛒</EmptyIcon>
                        <EmptyTitle>Keranjang masih kosong</EmptyTitle>
                        <EmptyDesc>Yuk, tambahkan makanan favoritmu!</EmptyDesc>
                        <BackBtn onClick={() => history.push('/')}>Mulai Belanja</BackBtn>
                    </EmptyWrap>
                ) : (
                    <Layout>
                        {/* Kiri */}
                        <ItemsCol>
                            {/* Bar pilih semua */}
                            <SelectAllBar>
                                <Checkbox
                                    ref={selectAllRef}
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                />
                                <SelectAllLabel onClick={toggleAll}>
                                    Pilih Semua ({cart.length})
                                </SelectAllLabel>
                                {someSelected && (
                                    <DeleteSelBtn onClick={handleDeleteSelected}>
                                        Hapus
                                    </DeleteSelBtn>
                                )}
                            </SelectAllBar>

                            {/* Item cards */}
                            {cart.map(item => {
                                const checked = item.checked !== false;
                                return (
                                    <ItemCard key={item._id} checked={checked} onClick={() => toggleSelect(item._id)}>
                                        <Checkbox
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleSelect(item._id)}
                                            onClick={e => e.stopPropagation()}
                                        />

                                        <ItemImg
                                            src={getImageUrl(item.image_url)}
                                            alt={item.name}
                                            onError={e => { e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'; }}
                                        />

                                        <ItemInfo>
                                            <ItemName>{item.name}</ItemName>
                                            <ItemPriceRow>
                                                <ItemPrice>{formatRupiah(item.price)}</ItemPrice>
                                                <span style={{ color: '#ccc', fontSize: '0.75rem' }}>/ pcs</span>
                                            </ItemPriceRow>
                                        </ItemInfo>

                                        <ItemActions onClick={e => e.stopPropagation()}>
                                            <DeleteBtn onClick={() => handleDeleteOne(item._id)} title="Hapus">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                    <path d="M10 11v6M14 11v6" />
                                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                </svg>
                                            </DeleteBtn>

                                            <Stepper>
                                                <StepBtn
                                                    onClick={() => dispatch(removeItem(item))}
                                                    disabled={item.qty <= 1}
                                                >−</StepBtn>
                                                <QtyNum>{item.qty}</QtyNum>
                                                <StepBtn onClick={() => dispatch(addItem(item))}>+</StepBtn>
                                            </Stepper>

                                            <ItemSubtotal>{formatRupiah(item.price * item.qty)}</ItemSubtotal>
                                        </ItemActions>
                                    </ItemCard>
                                );
                            })}
                        </ItemsCol>

                        {/* Kanan — ringkasan */}
                        <SummaryCol>
                            <SummaryCard>
                                <SummaryTitle>Ringkasan belanja</SummaryTitle>

                                <SummaryRow>
                                    <SummaryLabel>Subtotal ({totalQty} item)</SummaryLabel>
                                    <SummaryVal>{formatRupiah(subTotal)}</SummaryVal>
                                </SummaryRow>
                                <SummaryRow>
                                    <SummaryLabel>Ongkos kirim</SummaryLabel>
                                    <SummaryVal>{selectedItems.length ? formatRupiah(ongkir) : '—'}</SummaryVal>
                                </SummaryRow>

                                <Divider />

                                <SummaryRow>
                                    <TotalLabel>Total</TotalLabel>
                                    <TotalVal>{formatRupiah(total)}</TotalVal>
                                </SummaryRow>

                                {cartSaving && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '6px 0' }}>
                                        <BounceLoader color="#c0392b" size={16} />
                                        <span style={{ fontSize: '0.75rem', color: '#999' }}>Menyimpan...</span>
                                    </div>
                                )}

                                <BeliBtn onClick={handleBeli} disabled={!selectedItems.length || cartSaving}>
                                    Beli ({totalQty})
                                </BeliBtn>

                                {!selectedItems.length && (
                                    <NoneSelectedHint>Pilih item yang ingin dibeli</NoneSelectedHint>
                                )}
                            </SummaryCard>
                        </SummaryCol>
                    </Layout>
                )}
            </PageInner>
        </PageBg>
    );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const PageBg = styled.div`
    background: #f5f5f5;
    min-height: calc(100vh - 3.75rem);
    padding: 1.5rem 0 3rem;
`;

const PageInner = styled.div`
    max-width: 75rem;
    margin: 0 auto;
    padding: 0 1.5rem;
`;

const PageTitle = styled.h2`
    font-size: 1.375rem;
    font-weight: 700;
    color: #111;
    margin: 0 0 1.25rem;
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 1fr 22rem;
    gap: 1rem;
    align-items: start;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const ItemsCol = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

/* ─── Pilih Semua bar ─────────────────────────────────────────────────────── */

const SelectAllBar = styled.div`
    background: #fff;
    border-radius: 0.75rem;
    padding: 0.875rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 0.0625rem 0.25rem rgba(0,0,0,0.06);
`;

const SelectAllLabel = styled.span`
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111;
    cursor: pointer;
    flex: 1;
    user-select: none;
`;

const DeleteSelBtn = styled.button`
    background: none;
    border: none;
    color: #c0392b;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    &:hover { background: #fef2f2; }
`;

/* ─── Checkbox ────────────────────────────────────────────────────────────── */

const Checkbox = styled.input`
    width: 1.1875rem;
    height: 1.1875rem;
    accent-color: #c0392b;
    cursor: pointer;
    flex-shrink: 0;
`;

/* ─── Item card ───────────────────────────────────────────────────────────── */

const ItemCard = styled.div`
    background: #fff;
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 0.0625rem 0.25rem rgba(0,0,0,0.06);
    opacity: ${p => p.checked ? 1 : 0.55};
    transition: opacity 0.15s;
    cursor: pointer;
    user-select: none;
`;

const ItemImg = styled.img`
    width: 5rem;
    height: 5rem;
    object-fit: cover;
    border-radius: 0.5rem;
    flex-shrink: 0;
    background: #f5f5f5;
`;

const ItemInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ItemName = styled.div`
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111;
    margin-bottom: 0.375rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ItemPriceRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
`;

const ItemPrice = styled.div`
    font-size: 0.875rem;
    color: #888;
`;

const ItemActions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.625rem;
    flex-shrink: 0;
`;

const DeleteBtn = styled.button`
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    border-radius: 0.375rem;
    transition: color 0.15s, background 0.15s;
    &:hover { color: #c0392b; background: #fef2f2; }
`;

const Stepper = styled.div`
    display: flex;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 999px;
    overflow: hidden;
`;

const StepBtn = styled.button`
    background: none;
    border: none;
    width: 2rem;
    height: 2rem;
    font-size: 1.125rem;
    cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
    color: ${p => p.disabled ? '#ccc' : '#c0392b'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.12s;
    &:hover { background: ${p => p.disabled ? 'none' : '#fef2f2'}; }
`;

const QtyNum = styled.span`
    font-size: 0.9375rem;
    font-weight: 700;
    color: #111;
    min-width: 1.75rem;
    text-align: center;
`;

const ItemSubtotal = styled.div`
    font-size: 0.9375rem;
    font-weight: 700;
    color: #c0392b;
`;

/* ─── Summary ─────────────────────────────────────────────────────────────── */

const SummaryCol = styled.div`
    position: sticky;
    top: 5.5rem;
`;

const SummaryCard = styled.div`
    background: #fff;
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 0.0625rem 0.25rem rgba(0,0,0,0.06);
`;

const SummaryTitle = styled.div`
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.625rem;
`;

const SummaryLabel = styled.span`
    font-size: 0.875rem;
    color: #666;
`;

const SummaryVal = styled.span`
    font-size: 0.875rem;
    color: #111;
    font-weight: 500;
`;

const Divider = styled.div`
    height: 1px;
    background: #f0f0f0;
    margin: 0.875rem 0;
`;

const TotalLabel = styled.span`
    font-size: 0.9375rem;
    font-weight: 700;
    color: #111;
`;

const TotalVal = styled.span`
    font-size: 1.125rem;
    font-weight: 800;
    color: #111;
`;

const BeliBtn = styled.button`
    width: 100%;
    background: ${p => p.disabled ? '#e0e0e0' : '#c0392b'};
    color: ${p => p.disabled ? '#aaa' : '#fff'};
    border: none;
    border-radius: 0.5rem;
    padding: 0.875rem 0;
    font-size: 1rem;
    font-weight: 700;
    cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
    margin-top: 1rem;
    transition: background 0.15s;
    &:hover { background: ${p => p.disabled ? '#e0e0e0' : '#a93226'}; }
`;

const NoneSelectedHint = styled.div`
    text-align: center;
    font-size: 0.8125rem;
    color: #aaa;
    margin-top: 0.625rem;
`;

/* ─── Empty ───────────────────────────────────────────────────────────────── */

const EmptyWrap = styled.div`
    background: #fff;
    border-radius: 0.75rem;
    padding: 4rem 2rem;
    text-align: center;
    box-shadow: 0 0.0625rem 0.25rem rgba(0,0,0,0.06);
`;

const EmptyIcon = styled.div`font-size: 4rem; margin-bottom: 1rem;`;
const EmptyTitle = styled.div`font-size: 1.125rem; font-weight: 700; color: #333; margin-bottom: 0.5rem;`;
const EmptyDesc = styled.div`font-size: 0.875rem; color: #999; margin-bottom: 1.5rem;`;

const BackBtn = styled.button`
    background: #c0392b;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.75rem 2rem;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    &:hover { background: #a93226; }
`;
