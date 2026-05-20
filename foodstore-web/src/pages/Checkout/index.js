import * as React from 'react';
import styled from '@emotion/styled';
import { Link, useHistory, useLocation, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import BounceLoader from 'react-spinners/BounceLoader';
import { useAddressData } from '../../hooks/address';
import { sumPrice } from '../../utils/sum-price';
import { formatRupiah } from '../../utils/format-rupiah';
import { config } from '../../config';
import { getImageUrl } from '../../utils/image-url';
import { createOrder } from '../../api/orders';
import { setItems } from '../../features/Cart/actions';
import { saveCart } from '../../api/cart';

const STEPS = ['Item Pesanan', 'Pilih Alamat', 'Konfirmasi'];

export default function Checkout() {
    const location = useLocation();
    const history  = useHistory();
    const dispatch = useDispatch();

    const cart          = useSelector(state => state.cart);
    const checkoutItems = cart.filter(i => i.checked !== false);

    const { data: addresses, status: addrStatus, limit, page, count, setPage } = useAddressData();

    const [activeStep,       setActiveStep]       = React.useState(0);
    const [selectedAddress,  setSelectedAddress]  = React.useState(null);
    const [ordering,         setOrdering]         = React.useState(false);

    React.useEffect(() => {
        const params   = new URLSearchParams(location.search);
        const step     = params.get('step');
        const addrId   = params.get('address');
        setActiveStep(step === '2' ? 1 : 0);
        if (addrId && addresses.length) {
            const found = addresses.find(a => a._id === addrId);
            if (found) setSelectedAddress(found);
        }
    }, [location.search, addresses]);

    const handleCreateOrder = async () => {
        setOrdering(true);
        const { token } = localStorage.getItem('auth')
            ? JSON.parse(localStorage.getItem('auth'))
            : {};
        await saveCart(token, checkoutItems);
        const { data } = await createOrder({
            delivery_fee: config.global_ongkir,
            delivery_address: selectedAddress._id,
        });
        if (data?.error) { setOrdering(false); return; }
        const orderedIds = new Set(checkoutItems.map(i => i._id));
        dispatch(setItems(cart.filter(i => !orderedIds.has(i._id))));
        history.push(`/invoice/${data._id}`);
    };

    if (!checkoutItems.length) return <Redirect to="/" />;

    const subtotal = sumPrice(checkoutItems);
    const ongkir   = parseInt(config.global_ongkir) || 0;
    const total    = subtotal + ongkir;

    return (
        <PageBg>
            <PageInner>

                {/* ── Step Bar ── */}
                <StepBar>
                    {STEPS.map((label, i) => (
                        <React.Fragment key={i}>
                            <StepItem>
                                <StepCircle done={i < activeStep} active={i === activeStep}>
                                    {i < activeStep ? '✓' : i + 1}
                                </StepCircle>
                                <StepLabel active={i === activeStep} done={i < activeStep}>
                                    {label}
                                </StepLabel>
                            </StepItem>
                            {i < STEPS.length - 1 && <StepConnector done={i < activeStep} />}
                        </React.Fragment>
                    ))}
                </StepBar>

                {/* ── Body ── */}
                <Body>

                    {/* ── Main Content ── */}
                    <MainPanel>

                        {/* STEP 0 — Items */}
                        {activeStep === 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>🛒 Item Pesanan</CardTitle>
                                    <CardSub>{checkoutItems.length} produk dipilih</CardSub>
                                </CardHeader>
                                <ItemList>
                                    {checkoutItems.map((item, i) => (
                                        <ItemRow key={item._id || i}>
                                            <ItemImg src={getImageUrl(item.image_url)} alt={item.name} />
                                            <ItemInfo>
                                                <ItemName>{item.name}</ItemName>
                                                <ItemPriceSub>@ {formatRupiah(item.price)}</ItemPriceSub>
                                            </ItemInfo>
                                            <QtyBadge>×{item.qty}</QtyBadge>
                                            <ItemSubtotal>{formatRupiah(item.price * item.qty)}</ItemSubtotal>
                                        </ItemRow>
                                    ))}
                                </ItemList>
                                <NavRow>
                                    <div />
                                    <NextBtn onClick={() => setActiveStep(1)}>
                                        Selanjutnya →
                                    </NextBtn>
                                </NavRow>
                            </Card>
                        )}

                        {/* STEP 1 — Address */}
                        {activeStep === 1 && (
                            <Card>
                                <CardHeader>
                                    <div>
                                        <CardTitle>📍 Pilih Alamat Pengiriman</CardTitle>
                                        <CardSub>Pilih salah satu alamat di bawah</CardSub>
                                    </div>
                                    <AddAddrBtn as={Link} to="/alamat-pengiriman/tambah?from=checkout&step=2">
                                        + Tambah Alamat
                                    </AddAddrBtn>
                                </CardHeader>

                                {addrStatus === 'process' ? (
                                    <LoadWrap><BounceLoader color="#c0392b" size={28} /></LoadWrap>
                                ) : addresses.length === 0 ? (
                                    <EmptyAddr>
                                        <span>📍</span>
                                        <p>Belum ada alamat pengiriman</p>
                                        <small>Tambah alamat untuk melanjutkan</small>
                                        <AddAddrBtn as={Link} to="/alamat-pengiriman/tambah?from=checkout&step=2" style={{ marginTop: '1rem' }}>
                                            + Tambah Alamat
                                        </AddAddrBtn>
                                    </EmptyAddr>
                                ) : (
                                    <AddrList>
                                        {addresses.map(addr => (
                                            <AddrCard
                                                key={addr._id}
                                                selected={selectedAddress?._id === addr._id}
                                                onClick={() => setSelectedAddress(addr)}
                                            >
                                                <AddrRadio selected={selectedAddress?._id === addr._id}>
                                                    {selectedAddress?._id === addr._id && <AddrRadioDot />}
                                                </AddrRadio>
                                                <AddrBody>
                                                    <AddrName>{addr.nama}</AddrName>
                                                    <AddrDetail>
                                                        {[addr.kelurahan, addr.kecamatan, addr.kabupaten, addr.provinsi]
                                                            .filter(Boolean).join(', ')}
                                                    </AddrDetail>
                                                    {addr.detail && <AddrDetailFull>{addr.detail}</AddrDetailFull>}
                                                </AddrBody>
                                                {selectedAddress?._id === addr._id && <AddrCheckmark>✓</AddrCheckmark>}
                                            </AddrCard>
                                        ))}
                                        {count > limit && (
                                            <PaginationRow>
                                                {Array.from({ length: Math.ceil(count / limit) }, (_, i) => i + 1).map(p => (
                                                    <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
                                                ))}
                                            </PaginationRow>
                                        )}
                                    </AddrList>
                                )}

                                <NavRow>
                                    <PrevBtn onClick={() => setActiveStep(0)}>← Sebelumnya</PrevBtn>
                                    <NextBtn onClick={() => setActiveStep(2)} disabled={!selectedAddress}>
                                        Selanjutnya →
                                    </NextBtn>
                                </NavRow>
                            </Card>
                        )}

                        {/* STEP 2 — Confirmation */}
                        {activeStep === 2 && selectedAddress && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>✅ Konfirmasi Pesanan</CardTitle>
                                    <CardSub>Periksa kembali sebelum membayar</CardSub>
                                </CardHeader>

                                <ConfirmBlock>
                                    <ConfirmBlockTitle>Alamat Pengiriman</ConfirmBlockTitle>
                                    <ConfirmAddrCard>
                                        <span>📍</span>
                                        <div>
                                            <ConfirmAddrName>{selectedAddress.nama}</ConfirmAddrName>
                                            <ConfirmAddrDetail>
                                                {[selectedAddress.kelurahan, selectedAddress.kecamatan,
                                                  selectedAddress.kabupaten, selectedAddress.provinsi]
                                                    .filter(Boolean).join(', ')}
                                            </ConfirmAddrDetail>
                                            {selectedAddress.detail && <ConfirmAddrFull>{selectedAddress.detail}</ConfirmAddrFull>}
                                        </div>
                                    </ConfirmAddrCard>
                                </ConfirmBlock>

                                <ConfirmBlock>
                                    <ConfirmBlockTitle>Item Pesanan</ConfirmBlockTitle>
                                    {checkoutItems.map((item, i) => (
                                        <ConfirmItemRow key={i}>
                                            <ConfirmItemImg src={getImageUrl(item.image_url)} alt={item.name} />
                                            <ConfirmItemName>{item.name}</ConfirmItemName>
                                            <ConfirmItemQty>×{item.qty}</ConfirmItemQty>
                                            <ConfirmItemTotal>{formatRupiah(item.price * item.qty)}</ConfirmItemTotal>
                                        </ConfirmItemRow>
                                    ))}
                                </ConfirmBlock>

                                <ConfirmBlock>
                                    <ConfirmBlockTitle>Rincian Harga</ConfirmBlockTitle>
                                    <PriceBreakdown>
                                        <PriceRow>
                                            <PriceLabel>Subtotal</PriceLabel>
                                            <PriceVal>{formatRupiah(subtotal)}</PriceVal>
                                        </PriceRow>
                                        <PriceRow>
                                            <PriceLabel>Ongkos Kirim</PriceLabel>
                                            <PriceVal>{formatRupiah(ongkir)}</PriceVal>
                                        </PriceRow>
                                        <PriceTotalRow>
                                            <PriceTotalLabel>Total Pembayaran</PriceTotalLabel>
                                            <PriceTotalVal>{formatRupiah(total)}</PriceTotalVal>
                                        </PriceTotalRow>
                                    </PriceBreakdown>
                                </ConfirmBlock>

                                <NavRow>
                                    <PrevBtn onClick={() => setActiveStep(1)}>← Sebelumnya</PrevBtn>
                                    <PayBtn onClick={handleCreateOrder} disabled={ordering}>
                                        {ordering ? 'Memproses...' : '🔒 Bayar Sekarang'}
                                    </PayBtn>
                                </NavRow>
                            </Card>
                        )}

                    </MainPanel>

                    {/* ── Order Summary Sidebar ── */}
                    <SidePanel>
                        <SideTitle>Ringkasan Pesanan</SideTitle>
                        <SideItemList>
                            {checkoutItems.map((item, i) => (
                                <SideItem key={i}>
                                    <SideItemImg src={getImageUrl(item.image_url)} alt={item.name} />
                                    <SideItemInfo>
                                        <SideItemName>{item.name}</SideItemName>
                                        <SideItemMeta>×{item.qty} · {formatRupiah(item.price * item.qty)}</SideItemMeta>
                                    </SideItemInfo>
                                </SideItem>
                            ))}
                        </SideItemList>
                        <SideDivider />
                        <SidePriceRow><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></SidePriceRow>
                        <SidePriceRow><span>Ongkos Kirim</span><span>{formatRupiah(ongkir)}</span></SidePriceRow>
                        <SideDivider />
                        <SideTotalRow>
                            <SideTotalLabel>Total</SideTotalLabel>
                            <SideTotalVal>{formatRupiah(total)}</SideTotalVal>
                        </SideTotalRow>
                    </SidePanel>

                </Body>
            </PageInner>
        </PageBg>
    );
}

/* ─── Layout ─────────────────────────────────────────────────────────────── */

const PageBg = styled('div')({
    background: '#f5f5f5',
    height: 'calc(100vh - 3.75rem)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
});

const PageInner = styled('div')({
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '68rem',
    width: '100%',
    margin: '0 auto',
    padding: '1.5rem 1.25rem 0',
    boxSizing: 'border-box',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
        padding: '1rem 0.75rem 0',
    },
});

/* ─── Step bar ────────────────────────────────────────────────────────────── */

const StepBar = styled('div')({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    padding: '1.25rem 2rem',
    marginBottom: '1.25rem',
    '@media (max-width: 640px)': {
        padding: '1rem 1rem',
        marginBottom: '0.75rem',
    },
});

const StepItem = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    flexShrink: 0,
});

const StepCircle = styled('div')(({ done, active }) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: done ? 14 : 13,
    fontWeight: 700,
    flexShrink: 0,
    background: done ? '#27ae60' : active ? '#c0392b' : '#e9ecef',
    color: done || active ? '#fff' : '#aaa',
    transition: 'all 0.2s',
}));

const StepLabel = styled('div')(({ active, done }) => ({
    fontSize: '0.8125rem',
    fontWeight: active ? 700 : 500,
    color: done ? '#27ae60' : active ? '#c0392b' : '#aaa',
    whiteSpace: 'nowrap',
    '@media (max-width: 480px)': { display: 'none' },
}));

const StepConnector = styled('div')(({ done }) => ({
    flex: 1,
    height: 2,
    background: done ? '#27ae60' : '#e9ecef',
    margin: '0 0.75rem',
    transition: 'background 0.2s',
    '@media (max-width: 480px)': { margin: '0 0.375rem' },
}));

/* ─── Body ────────────────────────────────────────────────────────────────── */

const Body = styled('div')({
    flex: 1,
    minHeight: 0,
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'flex-start',
    overflow: 'hidden',
    paddingBottom: '1.5rem',
    '@media (max-width: 768px)': {
        gap: 0,
        paddingBottom: 0,
    },
});

const MainPanel = styled('div')({
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '@media (max-width: 768px)': {
        paddingBottom: '1.5rem',
    },
});

/* ─── Card wrapper ────────────────────────────────────────────────────────── */

const Card = styled('div')({
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    overflow: 'hidden',
});

const CardHeader = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f5f5f5',
    gap: '1rem',
    flexWrap: 'wrap',
});

const CardTitle = styled('h2')({
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 2px',
});

const CardSub = styled('p')({
    fontSize: '0.8125rem',
    color: '#999',
    margin: 0,
});

/* ─── Step 0: Items ───────────────────────────────────────────────────────── */

const ItemList = styled('div')({ padding: '0.375rem 0' });

const ItemRow = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 1.5rem',
    borderBottom: '1px solid #f9f9f9',
    '&:last-child': { borderBottom: 'none' },
});

const ItemImg = styled('img')({
    width: 56,
    height: 56,
    objectFit: 'cover',
    borderRadius: '0.5rem',
    flexShrink: 0,
    background: '#f5f5f5',
});

const ItemInfo = styled('div')({ flex: 1, minWidth: 0 });

const ItemName = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#111',
    marginBottom: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

const ItemPriceSub = styled('div')({
    fontSize: '0.8125rem',
    color: '#aaa',
});

const QtyBadge = styled('div')({
    flexShrink: 0,
    background: '#f5f5f5',
    borderRadius: '0.375rem',
    padding: '0.25rem 0.625rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#555',
});

const ItemSubtotal = styled('div')({
    flexShrink: 0,
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#c0392b',
    minWidth: 90,
    textAlign: 'right',
});

/* ─── Step 1: Address ─────────────────────────────────────────────────────── */

const AddAddrBtn = styled('div')({
    background: '#c0392b',
    color: '#fff',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    '&:hover': { background: '#a93226' },
});

const LoadWrap = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem 0',
});

const EmptyAddr = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 1rem',
    gap: '0.375rem',
    '& span': { fontSize: 40 },
    '& p': { fontSize: '0.9375rem', fontWeight: 600, color: '#bbb', margin: 0 },
    '& small': { fontSize: '0.8125rem', color: '#ccc' },
});

const AddrList = styled('div')({ padding: '0.75rem 1.5rem 0' });

const AddrCard = styled('div')(({ selected }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.125rem',
    borderRadius: '0.75rem',
    border: `2px solid ${selected ? '#c0392b' : '#f0f0f0'}`,
    background: selected ? '#fff9f9' : '#fff',
    cursor: 'pointer',
    marginBottom: '0.75rem',
    transition: 'border-color 0.15s, background 0.15s',
    '&:hover': { borderColor: selected ? '#c0392b' : '#ddd' },
}));

const AddrRadio = styled('div')(({ selected }) => ({
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: `2px solid ${selected ? '#c0392b' : '#ccc'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'border-color 0.15s',
}));

const AddrRadioDot = styled('div')({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#c0392b',
});

const AddrBody = styled('div')({ flex: 1, minWidth: 0 });

const AddrName = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: 3,
});

const AddrDetail = styled('div')({
    fontSize: '0.8125rem',
    color: '#666',
    lineHeight: 1.5,
});

const AddrDetailFull = styled('div')({
    fontSize: '0.75rem',
    color: '#aaa',
    marginTop: 2,
});

const AddrCheckmark = styled('div')({
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#c0392b',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
});

const PaginationRow = styled('div')({
    display: 'flex',
    gap: 6,
    padding: '0.75rem 0 1rem',
});

const PageBtn = styled('button')(({ active }) => ({
    width: 32,
    height: 32,
    borderRadius: 6,
    border: `1px solid ${active ? '#c0392b' : '#e0e0e0'}`,
    background: active ? '#c0392b' : '#fff',
    color: active ? '#fff' : '#555',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
}));

/* ─── Step 2: Confirmation ────────────────────────────────────────────────── */

const ConfirmBlock = styled('div')({
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f5f5f5',
    '&:last-of-type': { borderBottom: 'none' },
});

const ConfirmBlockTitle = styled('div')({
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#bbb',
    marginBottom: '0.75rem',
});

const ConfirmAddrCard = styled('div')({
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    background: '#f9f9f9',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    fontSize: 20,
});

const ConfirmAddrName = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: 3,
});

const ConfirmAddrDetail = styled('div')({
    fontSize: '0.8125rem',
    color: '#666',
    lineHeight: 1.5,
});

const ConfirmAddrFull = styled('div')({
    fontSize: '0.75rem',
    color: '#aaa',
    marginTop: 2,
});

const ConfirmItemRow = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.625rem 0',
    borderBottom: '1px solid #f9f9f9',
    '&:last-child': { borderBottom: 'none' },
});

const ConfirmItemImg = styled('img')({
    width: 44,
    height: 44,
    objectFit: 'cover',
    borderRadius: '0.5rem',
    flexShrink: 0,
    background: '#f5f5f5',
});

const ConfirmItemName = styled('div')({
    flex: 1,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#333',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const ConfirmItemQty = styled('div')({
    fontSize: '0.8125rem',
    color: '#aaa',
    flexShrink: 0,
});

const ConfirmItemTotal = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#111',
    flexShrink: 0,
    minWidth: 80,
    textAlign: 'right',
});

const PriceBreakdown = styled('div')({
    background: '#f9f9f9',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
});

const PriceRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.375rem 0',
});

const PriceLabel = styled('div')({
    fontSize: '0.875rem',
    color: '#666',
});

const PriceVal = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#333',
});

const PriceTotalRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.625rem 0 0.25rem',
    borderTop: '1px solid #e9ecef',
    marginTop: '0.375rem',
});

const PriceTotalLabel = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#111',
});

const PriceTotalVal = styled('div')({
    fontSize: '1.125rem',
    fontWeight: 800,
    color: '#c0392b',
});

/* ─── Nav buttons ─────────────────────────────────────────────────────────── */

const NavRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid #f5f5f5',
    gap: '1rem',
});

const PrevBtn = styled('button')({
    background: 'none',
    border: '1px solid #e0e0e0',
    borderRadius: '0.625rem',
    padding: '0.6875rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#666',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    '&:hover': { background: '#f9f9f9', borderColor: '#ccc' },
});

const NextBtn = styled('button')({
    background: '#c0392b',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.6875rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { background: '#a93226' },
    '&:disabled': { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' },
});

const PayBtn = styled('button')({
    background: '#27ae60',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { background: '#219a52' },
    '&:disabled': { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' },
});

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */

const SidePanel = styled('div')({
    width: '19rem',
    flexShrink: 0,
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    padding: '1.25rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    alignSelf: 'stretch',
    height: '100%',
    boxSizing: 'border-box',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '@media (max-width: 768px)': { display: 'none' },
});

const SideTitle = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #f5f5f5',
});

const SideItemList = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '0.75rem',
});

const SideItem = styled('div')({
    display: 'flex',
    gap: '0.625rem',
    alignItems: 'center',
});

const SideItemImg = styled('img')({
    width: 40,
    height: 40,
    objectFit: 'cover',
    borderRadius: '0.375rem',
    flexShrink: 0,
    background: '#f5f5f5',
});

const SideItemInfo = styled('div')({ flex: 1, minWidth: 0 });

const SideItemName = styled('div')({
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#222',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

const SideItemMeta = styled('div')({
    fontSize: '0.75rem',
    color: '#aaa',
    marginTop: 1,
});

const SideDivider = styled('div')({
    height: 1,
    background: '#f5f5f5',
    margin: '0.75rem 0',
});

const SidePriceRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    color: '#777',
    padding: '0.25rem 0',
});

const SideTotalRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.25rem 0',
});

const SideTotalLabel = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#111',
});

const SideTotalVal = styled('div')({
    fontSize: '1.125rem',
    fontWeight: 800,
    color: '#c0392b',
});
