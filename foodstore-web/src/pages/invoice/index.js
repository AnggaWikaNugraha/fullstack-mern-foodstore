import * as React from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import BounceLoader from 'react-spinners/BounceLoader';
import { getPusher } from '../../pusher';
import { getInvoiceByOrderId } from '../../api/invoice';
import { createReview, getMyOrderReviews } from '../../api/review';
import { getSnapToken, verifyPayment } from '../../api/payment';
import { updateOrderStatus } from '../../api/orders';
import StarRating from '../../component/StarRating';
import { formatRupiah } from '../../utils/format-rupiah';
import { config } from '../../config';
import { getImageUrl } from '../../utils/image-url';

/* ─── Status helpers ─────────────────────────────────────────────────────── */

function getPaymentInfo(status) {
    switch (status) {
        case 'waiting_payment':
        case 'pending':
            return { label: 'Menunggu Pembayaran', emoji: '⏳', color: '#e67e22', bg: '#fff9f0', border: '#f5cba7' };
        case 'paid':
        case 'settlement':
        case 'capture':
            return { label: 'Lunas', emoji: '✅', color: '#27ae60', bg: '#f0fdf4', border: '#a9dfbf' };
        case 'failed':
        case 'deny':
        case 'cancel':
        case 'expire':
            return { label: 'Pembayaran Gagal', emoji: '❌', color: '#c0392b', bg: '#fff5f5', border: '#f5b7b1' };
        default:
            return { label: status || '-', emoji: '•', color: '#999', bg: '#f5f5f5', border: '#e0e0e0' };
    }
}

function getStatusContent(payStatus, orderStatus) {
    if (['failed','deny','cancel','expire'].includes(payStatus)) return {
        icon: '❌', title: 'Pembayaran Gagal',
        desc: 'Terjadi kendala pada pembayaran. Silakan coba lagi atau hubungi kami.',
        color: '#c0392b', bg: '#fff5f5', border: '#f5b7b1', btn: null,
    };
    if (['waiting_payment','pending'].includes(payStatus)) return {
        icon: '⏳', title: 'Menunggu Pembayaran',
        desc: 'Segera selesaikan pembayaranmu agar pesanan dapat segera diproses.',
        color: '#e67e22', bg: '#fff9f0', border: '#f5cba7', btn: 'pay',
    };
    if (['paid','settlement','capture'].includes(payStatus)) {
        if (orderStatus === 'delivered') return {
            icon: '🎉', title: 'Pesanan Berhasil Diterima!',
            desc: 'Terima kasih sudah berbelanja di FoodStore. Jangan lupa beri penilaian untuk produk yang kamu beli ya!',
            color: '#27ae60', bg: '#f0fdf4', border: '#a9dfbf', btn: null,
        };
        if (orderStatus === 'in_delivery') return {
            icon: '🚚', title: 'Pesanan Dalam Pengiriman',
            desc: 'Paket sudah dalam perjalanan menuju alamatmu. Pastikan ada yang menerima di tempat ya!',
            color: '#2980b9', bg: '#ebf5fb', border: '#aed6f1', btn: 'confirm_delivery',
        };
        if (orderStatus === 'processing') return {
            icon: '🔄', title: 'Pesanan Sedang Diproses',
            desc: 'Tim kami sedang menyiapkan pesananmu dengan penuh semangat. Tunggu sebentar ya!',
            color: '#8e44ad', bg: '#f9f0ff', border: '#d7bde2', btn: null,
        };
        return {
            icon: '✅', title: 'Pembayaran Dikonfirmasi',
            desc: 'Pembayaranmu berhasil diterima! Pesanan akan segera diproses oleh tim kami.',
            color: '#27ae60', bg: '#f0fdf4', border: '#a9dfbf', btn: null,
        };
    }
    return null;
}

const ORDER_TIMELINE = [
    { key: 'payment',     label: 'Pembayaran',    icon: '💳' },
    { key: 'processing',  label: 'Diproses',       icon: '🔄' },
    { key: 'in_delivery', label: 'Dikirim',         icon: '🚚' },
    { key: 'delivered',   label: 'Diterima',        icon: '📦' },
];

function getTimelineStep(payStatus, orderStatus) {
    if (['failed','deny','cancel','expire'].includes(payStatus)) return -1;
    if (['waiting_payment','pending'].includes(payStatus)) return 0;
    if (['paid','settlement','capture'].includes(payStatus)) {
        if (orderStatus === 'delivered')   return 3;
        if (orderStatus === 'in_delivery') return 2;
        if (orderStatus === 'processing')  return 1;
        return 1;
    }
    return 0;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function Invoice() {
    const [invoice,    setInvoice]    = React.useState(null);
    const [error,      setError]      = React.useState('');
    const [status,     setStatus]     = React.useState('process');
    const [ratingTarget, setRatingTarget] = React.useState(null);
    const [rating,     setRating]     = React.useState(0);
    const [comment,    setComment]    = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [submitMsg,  setSubmitMsg]  = React.useState('');
    const [reviewedIds,setReviewedIds]= React.useState([]);
    const [payLoading,  setPayLoading]  = React.useState(false);
    const [confirming,  setConfirming]  = React.useState(false);

    const { params } = useRouteMatch();

    const handleConfirmDelivery = async () => {
        setConfirming(true);
        try {
            const { data } = await updateOrderStatus(params?.order_id, 'delivered');
            if (!data?.error) {
                setInvoice(prev => ({ ...prev, order: { ...prev.order, status: 'delivered' } }));
            } else {
                alert(data.message);
            }
        } catch {
            alert('Gagal mengkonfirmasi penerimaan, coba lagi.');
        }
        setConfirming(false);
    };

    const handlePayment = async () => {
        setPayLoading(true);
        try {
            const { data } = await getSnapToken(params?.order_id);
            if (data?.error) { alert(data.message); setPayLoading(false); return; }
            window.snap.pay(data.snap_token, {
                onSuccess: async () => {
                    setInvoice(prev => ({ ...prev, payment_status: 'settlement' }));
                    try {
                        const { data } = await verifyPayment(params?.order_id);
                        if (data?.payment_status) setInvoice(prev => ({ ...prev, payment_status: data.payment_status }));
                    } catch {}
                },
                onPending: () => setInvoice(prev => ({ ...prev, payment_status: 'pending' })),
                onError:   () => alert('Pembayaran gagal, coba lagi.'),
                onClose:   () => {},
            });
        } catch {
            alert('Gagal memuat payment, coba lagi.');
        }
        setPayLoading(false);
    };

    React.useEffect(() => {
        getInvoiceByOrderId(params?.order_id)
            .then(({ data }) => {
                if (data?.error) setError(data.message || 'Terjadi kesalahan');
                setInvoice(data);
                return getMyOrderReviews(params?.order_id);
            })
            .then(({ data }) => {
                const ids = (data?.data || []).map(r => String(r.product?._id || r.product));
                setReviewedIds(ids);
            })
            .catch(() => {})
            .finally(() => setStatus('idle'));
    }, [params]);

    React.useEffect(() => {
        if (!params?.order_id) return;
        const pusher = getPusher();
        if (!pusher) return;
        const channel = pusher.subscribe(`private-order-${params.order_id}`);
        channel.bind('order:status_updated', ({ status }) => {
            setInvoice(prev => prev ? { ...prev, order: { ...prev.order, status } } : prev);
        });
        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`private-order-${params.order_id}`);
        };
    }, [params?.order_id]);

    const openModal  = (item) => { setRatingTarget({ product_id: String(item.product._id), name: item.name }); setRating(0); setComment(''); setSubmitMsg(''); };
    const closeModal = () => { setRatingTarget(null); setSubmitting(false); setSubmitMsg(''); };

    const handleSubmitReview = async () => {
        if (!rating) return setSubmitMsg('Pilih bintang dulu ya!');
        setSubmitting(true);
        try {
            const { data } = await createReview({ product_id: ratingTarget.product_id, order_id: invoice.order._id, rating, comment });
            if (data?.error) { setSubmitMsg(data.message); }
            else { setReviewedIds(prev => [...prev, ratingTarget.product_id]); closeModal(); }
        } catch { setSubmitMsg('Gagal menyimpan rating, coba lagi.'); }
        setSubmitting(false);
    };

    /* loading */
    if (status === 'process') {
        return (
            <PageBg>
                <LoadCenter><BounceLoader color="#c0392b" size={36} /></LoadCenter>
            </PageBg>
        );
    }

    /* error */
    if (error) {
        return (
            <PageBg>
                <LoadCenter>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                        <p style={{ fontWeight: 700, color: '#333', margin: '0 0 6px' }}>Terjadi Kesalahan</p>
                        <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>{error}</p>
                    </div>
                </LoadCenter>
            </PageBg>
        );
    }

    /* not found */
    if (!invoice) {
        return (
            <PageBg>
                <LoadCenter>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 52, marginBottom: 12 }}>🧾</div>
                        <p style={{ fontWeight: 700, color: '#333', margin: '0 0 6px' }}>Invoice tidak ditemukan</p>
                        <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>Order mungkin belum diproses atau ID tidak valid</p>
                    </div>
                </LoadCenter>
            </PageBg>
        );
    }

    const orderItems   = invoice?.order?.order_items || [];
    const payStatus    = invoice?.payment_status;
    const orderStatus  = invoice?.order?.status;
    const payInfo       = getPaymentInfo(payStatus);
    const statusContent = getStatusContent(payStatus, orderStatus);
    const timelineStep  = getTimelineStep(payStatus, orderStatus);
    const addr          = invoice?.delivery_address;
    const subtotal      = orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);
    const ongkir        = invoice?.delivery_fee ? parseInt(invoice.delivery_fee) : 0;

    return (
        <>
            <PageBg>
                <InnerScroll>
                    <Container>

                        {/* Back link */}
                        <BackRow>
                            <BackLink to="/account?tab=riwayat">← Riwayat Belanja</BackLink>
                        </BackRow>

                        {/* ── Invoice Card ── */}
                        <InvoiceCard>

                            {/* Header */}
                            <InvoiceHead>
                                <HeadLeft>
                                    <HeadBrand>🍱 FoodStore</HeadBrand>
                                    <HeadOrderNum>Invoice #{invoice?.order?.order_number || params?.order_id?.slice(-8).toUpperCase()}</HeadOrderNum>
                                </HeadLeft>
                                <StatusPill color={payInfo.color} bg={payInfo.bg} border={payInfo.border}>
                                    {payInfo.emoji} {payInfo.label}
                                </StatusPill>
                            </InvoiceHead>

                            {/* Timeline */}
                            <TimelineWrap>
                                {ORDER_TIMELINE.map((step, i) => {
                                    const done   = timelineStep > i;
                                    const active = timelineStep === i;
                                    const failed = timelineStep === -1;
                                    return (
                                        <React.Fragment key={step.key}>
                                            <TimelineItem>
                                                <TimelineDot done={done} active={active && !failed} failed={failed && i === 0}>
                                                    {done ? '✓' : step.icon}
                                                </TimelineDot>
                                                <TimelineLabel done={done} active={active && !failed}>{step.label}</TimelineLabel>
                                            </TimelineItem>
                                            {i < ORDER_TIMELINE.length - 1 && (
                                                <TimelineLine done={done} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TimelineWrap>

                            {/* Status banner */}
                            {statusContent && (
                                <StatusBanner bg={statusContent.bg} border={statusContent.border}>
                                    <StatusBannerIcon>{statusContent.icon}</StatusBannerIcon>
                                    <StatusBannerBody>
                                        <StatusBannerTitle color={statusContent.color}>{statusContent.title}</StatusBannerTitle>
                                        <StatusBannerDesc>{statusContent.desc}</StatusBannerDesc>
                                    </StatusBannerBody>
                                    {statusContent.btn === 'pay' && (
                                        <PayBtn onClick={handlePayment} disabled={payLoading}>
                                            {payLoading ? 'Memuat...' : '🔒 Bayar Sekarang'}
                                        </PayBtn>
                                    )}
                                    {statusContent.btn === 'confirm_delivery' && (
                                        <ConfirmDeliveryBtn onClick={handleConfirmDelivery} disabled={confirming}>
                                            {confirming ? 'Memproses...' : '✓ Konfirmasi Diterima'}
                                        </ConfirmDeliveryBtn>
                                    )}
                                </StatusBanner>
                            )}

                            <InvoiceBody>
                                {/* Info grid */}
                                <InfoGrid>
                                    <InfoBlock>
                                        <InfoBlockTitle>Dikirim ke</InfoBlockTitle>
                                        <InfoName>{invoice?.user?.full_name}</InfoName>
                                        <InfoText>{invoice?.user?.email}</InfoText>
                                        {addr && (
                                            <InfoText style={{ marginTop: 6 }}>
                                                {addr.detail && <>{addr.detail}<br /></>}
                                                {[addr.kelurahan, addr.kecamatan, addr.kabupaten, addr.provinsi].filter(Boolean).join(', ')}
                                            </InfoText>
                                        )}
                                    </InfoBlock>
                                    <InfoBlock>
                                        <InfoBlockTitle>Pembayaran ke</InfoBlockTitle>
                                        <InfoName>{config.owner}</InfoName>
                                        <InfoText>{config.contact}</InfoText>
                                        {config.billing?.bank_name && (
                                            <InfoBankBadge>
                                                🏦 {config.billing.bank_name} — {config.billing.account_no}
                                            </InfoBankBadge>
                                        )}
                                    </InfoBlock>
                                </InfoGrid>

                                <SectionDivider />

                                {/* Items */}
                                <SectionTitle>Item Pesanan</SectionTitle>
                                <ItemList>
                                    {orderItems.map((item, i) => {
                                        const pid = String(item.product?._id || item.product);
                                        const alreadyReviewed = reviewedIds.includes(pid);
                                        return (
                                            <ItemRow key={i}>
                                                <ItemImg
                                                    src={item.product?.image_url ? getImageUrl(item.product.image_url) : ''}
                                                    alt={item.name}
                                                />
                                                <ItemInfo>
                                                    <ItemName>{item.name}</ItemName>
                                                    <ItemMeta>@ {formatRupiah(item.price)} × {item.qty}</ItemMeta>
                                                </ItemInfo>
                                                <ItemTotal>{formatRupiah(item.price * item.qty)}</ItemTotal>
                                                {payStatus === 'settlement' || payStatus === 'paid' || payStatus === 'capture' ? (
                                                    alreadyReviewed ? (
                                                        <RatedBadge>⭐ Dinilai</RatedBadge>
                                                    ) : (
                                                        <RateBtn onClick={() => openModal(item)}>Beri Rating</RateBtn>
                                                    )
                                                ) : (
                                                    <div style={{ width: 90 }} />
                                                )}
                                            </ItemRow>
                                        );
                                    })}
                                </ItemList>

                                <SectionDivider />

                                {/* Price summary */}
                                <PriceSummary>
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
                                        <PriceTotalVal>{formatRupiah(invoice?.total || subtotal + ongkir)}</PriceTotalVal>
                                    </PriceTotalRow>
                                </PriceSummary>

                            </InvoiceBody>
                        </InvoiceCard>
                    </Container>
                </InnerScroll>
            </PageBg>

            {/* ── Rating Modal ── */}
            {ratingTarget && (
                <Overlay onClick={closeModal}>
                    <Modal onClick={e => e.stopPropagation()}>
                        <ModalTitle>Beri Rating</ModalTitle>
                        <ModalProductName>{ratingTarget.name}</ModalProductName>
                        <StarRow>
                            <StarRating value={rating} onChange={setRating} size={36} />
                        </StarRow>
                        <RatingHint>
                            {['', 'Sangat buruk', 'Kurang memuaskan', 'Cukup baik', 'Bagus!', 'Sempurna! 🎉'][rating] || 'Pilih bintang'}
                        </RatingHint>
                        <CommentBox
                            placeholder="Tulis komentar (opsional)..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        {submitMsg && <ModalErr>{submitMsg}</ModalErr>}
                        <ModalFooter>
                            <ModalSubmitBtn onClick={handleSubmitReview} disabled={submitting || !rating}>
                                {submitting ? 'Menyimpan...' : 'Kirim Rating'}
                            </ModalSubmitBtn>
                            <ModalCancelBtn onClick={closeModal}>Batal</ModalCancelBtn>
                        </ModalFooter>
                    </Modal>
                </Overlay>
            )}
        </>
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

const InnerScroll = styled('div')({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
});

const Container = styled('div')({
    maxWidth: '52rem',
    margin: '0 auto',
    padding: '1.5rem 1.25rem 3rem',
    boxSizing: 'border-box',
    '@media (max-width: 640px)': {
        padding: '1rem 0.75rem 2rem',
    },
});

const LoadCenter = styled('div')({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
});

/* ─── Back link ──────────────────────────────────────────────────────────── */

const BackRow = styled('div')({ marginBottom: '1rem' });

const BackLink = styled(Link)({
    fontSize: '0.8125rem',
    color: '#c0392b',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
});

/* ─── Invoice Card ───────────────────────────────────────────────────────── */

const InvoiceCard = styled('div')({
    background: '#fff',
    borderRadius: '1rem',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    overflow: 'hidden',
});

const InvoiceHead = styled('div')({
    background: 'linear-gradient(135deg, #a93226 0%, #c0392b 50%, #e74c3c 100%)',
    padding: '1.75rem 1.75rem 1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
});

const HeadLeft = styled('div')({});

const HeadBrand = styled('div')({
    fontSize: '1rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '0.375rem',
});

const HeadOrderNum = styled('div')({
    fontSize: '1.375rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
});

const StatusPill = styled('div')(({ color, bg, border }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: bg,
    color: color,
    border: `1px solid ${border}`,
    borderRadius: 999,
    padding: '0.375rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap',
}));

/* ─── Timeline ───────────────────────────────────────────────────────────── */

const TimelineWrap = styled('div')({
    display: 'flex',
    alignItems: 'center',
    padding: '1.25rem 1.75rem',
    borderBottom: '1px solid #f5f5f5',
    '@media (max-width: 480px)': {
        padding: '1rem',
    },
});

const TimelineItem = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.375rem',
    flexShrink: 0,
});

const TimelineDot = styled('div')(({ done, active, failed }) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: done ? 14 : 18,
    fontWeight: 700,
    background: failed ? '#fee2e2' : done ? '#27ae60' : active ? '#c0392b' : '#f5f5f5',
    color: done ? '#fff' : active ? '#fff' : '#ccc',
    border: `2px solid ${failed ? '#f5b7b1' : done ? '#27ae60' : active ? '#c0392b' : '#e9ecef'}`,
    transition: 'all 0.2s',
    '@media (max-width: 480px)': { width: 30, height: 30, fontSize: done ? 12 : 15 },
}));

const TimelineLabel = styled('div')(({ done, active }) => ({
    fontSize: '0.6875rem',
    fontWeight: active || done ? 700 : 400,
    color: done ? '#27ae60' : active ? '#c0392b' : '#bbb',
    textAlign: 'center',
    maxWidth: 56,
    lineHeight: 1.3,
    '@media (max-width: 480px)': { fontSize: '0.625rem', maxWidth: 40 },
}));

const TimelineLine = styled('div')(({ done }) => ({
    flex: 1,
    height: 2,
    background: done ? '#27ae60' : '#e9ecef',
    margin: '0 0.5rem',
    marginBottom: 22,
    transition: 'background 0.2s',
}));

/* ─── Status banner ──────────────────────────────────────────────────────── */

const StatusBanner = styled('div')(({ bg, border }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 1.75rem',
    background: bg,
    borderBottom: `1px solid ${border}`,
    flexWrap: 'wrap',
}));

const StatusBannerIcon = styled('div')({
    fontSize: 36,
    flexShrink: 0,
    lineHeight: 1,
});

const StatusBannerBody = styled('div')({
    flex: 1,
    minWidth: 180,
});

const StatusBannerTitle = styled('div')(({ color }) => ({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: color,
    marginBottom: '0.25rem',
}));

const StatusBannerDesc = styled('div')({
    fontSize: '0.8125rem',
    color: '#777',
    lineHeight: 1.55,
});

const ConfirmDeliveryBtn = styled('button')({
    background: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.6875rem 1.5rem',
    fontSize: '0.9375rem',
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s',
    '&:hover': { background: '#219a52' },
    '&:disabled': { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' },
});

const PayBtn = styled('button')({
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.6875rem 1.5rem',
    fontSize: '0.9375rem',
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s',
    '&:hover': { background: '#a93226' },
    '&:disabled': { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' },
});

/* ─── Invoice body ───────────────────────────────────────────────────────── */

const InvoiceBody = styled('div')({
    padding: '1.5rem 1.75rem',
    '@media (max-width: 640px)': {
        padding: '1.25rem 1rem',
    },
});

/* ─── Info grid ──────────────────────────────────────────────────────────── */

const InfoGrid = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    '@media (max-width: 480px)': {
        gridTemplateColumns: '1fr',
        gap: '1rem',
    },
});

const InfoBlock = styled('div')({});

const InfoBlockTitle = styled('div')({
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#bbb',
    marginBottom: '0.5rem',
});

const InfoName = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: 2,
});

const InfoText = styled('div')({
    fontSize: '0.8125rem',
    color: '#666',
    lineHeight: 1.65,
});

const InfoBankBadge = styled('div')({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.5rem',
    background: '#f5f5f5',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.625rem',
    fontSize: '0.8125rem',
    color: '#555',
    fontWeight: 600,
});

const SectionDivider = styled('div')({
    height: 1,
    background: '#f5f5f5',
    margin: '1.25rem 0',
});

/* ─── Items ──────────────────────────────────────────────────────────────── */

const SectionTitle = styled('div')({
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#bbb',
    marginBottom: '0.875rem',
});

const ItemList = styled('div')({ display: 'flex', flexDirection: 'column' });

const ItemRow = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f9f9f9',
    '&:last-child': { borderBottom: 'none' },
    '@media (max-width: 480px)': { flexWrap: 'wrap' },
});

const ItemImg = styled('img')({
    width: 52,
    height: 52,
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
});

const ItemMeta = styled('div')({
    fontSize: '0.8125rem',
    color: '#aaa',
});

const ItemTotal = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#333',
    flexShrink: 0,
    minWidth: 80,
    textAlign: 'right',
});

const RateBtn = styled('button')({
    flexShrink: 0,
    background: '#fff8e1',
    color: '#e67e22',
    border: '1px solid #f0c040',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': { background: '#fdeeba' },
});

const RatedBadge = styled('div')({
    flexShrink: 0,
    color: '#27ae60',
    fontSize: '0.8125rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
});

/* ─── Price summary ──────────────────────────────────────────────────────── */

const PriceSummary = styled('div')({
    background: '#f9f9f9',
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    marginTop: '0.25rem',
});

const PriceRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
});

const PriceLabel = styled('div')({
    fontSize: '0.875rem',
    color: '#777',
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
    borderTop: '1px solid #ebebeb',
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
});

const PriceTotalLabel = styled('div')({
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111',
});

const PriceTotalVal = styled('div')({
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#c0392b',
});

/* ─── Rating Modal ───────────────────────────────────────────────────────── */

const Overlay = styled('div')({
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
});

const Modal = styled('div')({
    background: '#fff',
    borderRadius: '1rem',
    padding: '1.75rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
});

const ModalTitle = styled('h2')({
    fontSize: '1.125rem',
    fontWeight: 800,
    color: '#111',
    margin: '0 0 4px',
});

const ModalProductName = styled('p')({
    fontSize: '0.875rem',
    color: '#888',
    margin: '0 0 12px',
});

const StarRow = styled('div')({ margin: '0.75rem 0 0.375rem' });

const RatingHint = styled('p')({
    fontSize: '0.8125rem',
    color: '#f39c12',
    fontWeight: 600,
    margin: '0 0 0.875rem',
    minHeight: 18,
});

const CommentBox = styled('textarea')({
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '0.625rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': { borderColor: '#c0392b', boxShadow: '0 0 0 3px rgba(192,57,43,0.1)' },
});

const ModalErr = styled('p')({
    color: '#c0392b',
    fontSize: '0.8125rem',
    margin: '0.5rem 0 0',
});

const ModalFooter = styled('div')({
    display: 'flex',
    gap: '0.625rem',
    marginTop: '1rem',
});

const ModalSubmitBtn = styled('button')({
    flex: 1,
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.75rem 0',
    fontSize: '0.9375rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' },
});

const ModalCancelBtn = styled('button')({
    background: '#f5f5f5',
    color: '#555',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.75rem 1.25rem',
    fontSize: '0.9375rem',
    cursor: 'pointer',
    '&:hover': { background: '#ebebeb' },
});
