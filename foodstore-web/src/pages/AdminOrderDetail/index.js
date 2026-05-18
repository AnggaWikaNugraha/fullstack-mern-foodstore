import React, { useState, useEffect } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { LayoutSidebar } from 'upkit';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader';
import AppSidebar from '../../component/AppSidebar';
import { getOrderById, updateOrderStatus } from '../../api/orders';
import { formatRupiah } from '../../utils/format-rupiah';

const STATUS_FLOW = {
    waiting_payment: { label: 'Menunggu Bayar', color: '#e67e22', next: null },
    processing:      { label: 'Diproses',        color: '#2980b9', next: 'in_delivery' },
    in_delivery:     { label: 'Dikirim',          color: '#8e44ad', next: 'delivered' },
    delivered:       { label: 'Diterima',         color: '#27ae60', next: null },
    pending:         { label: 'Pending',           color: '#95a5a6', next: null },
};

const PAYMENT_LABELS = {
    waiting_payment: { label: 'Belum Bayar',  color: '#e67e22' },
    settlement:      { label: 'Lunas',         color: '#27ae60' },
    capture:         { label: 'Lunas',         color: '#27ae60' },
    pending:         { label: 'Menunggu',      color: '#f39c12' },
    deny:            { label: 'Ditolak',       color: '#e74c3c' },
    cancel:          { label: 'Dibatalkan',    color: '#e74c3c' },
    expire:          { label: 'Kedaluwarsa',   color: '#e74c3c' },
    failed:          { label: 'Gagal',         color: '#e74c3c' },
};

export default function AdminOrderDetail() {
    const { params } = useRouteMatch();
    const history = useHistory();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        getOrderById(params.id)
            .then(({ data }) => setOrder(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            await updateOrderStatus(params.id, newStatus);
            setOrder(prev => ({ ...prev, status: newStatus }));
        } catch {}
        setUpdating(false);
    };

    const s = order ? STATUS_FLOW[order.status] : null;
    const p = order?.invoice ? PAYMENT_LABELS[order.invoice.payment_status] : null;

    const subTotal = order?.order_items?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;

    return (
        <LayoutSidebar
            sidebar={<AppSidebar />}
            sidebarSize={80}
            content={
                <Page>
                    <Header>
                        <BackBtn onClick={() => history.push('/admin/orders')}>← Kembali</BackBtn>
                        <Title>Detail Order</Title>
                    </Header>

                    {loading && (
                        <Center><BounceLoader color="#c0392b" size={32} /></Center>
                    )}

                    {!loading && order && (
                        <>
                            {/* Info utama */}
                            <Card>
                                <Row>
                                    <InfoBlock>
                                        <Label>Order #</Label>
                                        <Value>#{order.order_number}</Value>
                                    </InfoBlock>
                                    <InfoBlock>
                                        <Label>Tanggal</Label>
                                        <Value>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Value>
                                    </InfoBlock>
                                    <InfoBlock>
                                        <Label>Status Order</Label>
                                        <StatusBadge color={s?.color}>{s?.label || order.status}</StatusBadge>
                                    </InfoBlock>
                                    {p && (
                                        <InfoBlock>
                                            <Label>Status Bayar</Label>
                                            <StatusBadge color={p.color}>{p.label}</StatusBadge>
                                        </InfoBlock>
                                    )}
                                    {order.user && (
                                        <InfoBlock>
                                            <Label>Customer</Label>
                                            <Value>{order.user.full_name || order.user.email}</Value>
                                        </InfoBlock>
                                    )}
                                </Row>
                            </Card>

                            {/* Item produk */}
                            <SectionTitle>Produk Dipesan</SectionTitle>
                            <Card>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <Th>Produk</Th>
                                            <Th style={{ textAlign: 'center' }}>Qty</Th>
                                            <Th style={{ textAlign: 'right' }}>Harga</Th>
                                            <Th style={{ textAlign: 'right' }}>Subtotal</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.order_items?.map((item, i) => (
                                            <tr key={i}>
                                                <Td>{item.name}</Td>
                                                <Td style={{ textAlign: 'center' }}>{item.qty}</Td>
                                                <Td style={{ textAlign: 'right' }}>{formatRupiah(item.price)}</Td>
                                                <Td style={{ textAlign: 'right' }}>{formatRupiah(item.price * item.qty)}</Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <Td colSpan={3} style={{ textAlign: 'right', paddingTop: 12, color: '#666' }}>Subtotal</Td>
                                            <Td style={{ textAlign: 'right', paddingTop: 12 }}>{formatRupiah(subTotal)}</Td>
                                        </tr>
                                        <tr>
                                            <Td colSpan={3} style={{ textAlign: 'right', color: '#666' }}>Ongkir</Td>
                                            <Td style={{ textAlign: 'right' }}>{formatRupiah(order.delivery_fee || 0)}</Td>
                                        </tr>
                                        <tr>
                                            <Td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total</Td>
                                            <Td style={{ textAlign: 'right', fontWeight: 700, color: '#c0392b' }}>
                                                {formatRupiah((order.invoice?.total) || subTotal + (order.delivery_fee || 0))}
                                            </Td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </Card>

                            {/* Alamat */}
                            <SectionTitle>Alamat Pengiriman</SectionTitle>
                            <Card>
                                <Value>{order.delivery_address?.detail}</Value>
                                <Value style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                                    {order.delivery_address?.kelurahan}, {order.delivery_address?.kecamatan},{' '}
                                    {order.delivery_address?.kabupaten}, {order.delivery_address?.provinsi}
                                </Value>
                            </Card>

                            {/* Aksi update status */}
                            {s?.next && (
                                <UpdateBtn
                                    disabled={updating}
                                    onClick={() => handleUpdateStatus(s.next)}
                                >
                                    {updating ? 'Memproses...' : `→ Update ke ${STATUS_FLOW[s.next]?.label}`}
                                </UpdateBtn>
                            )}
                        </>
                    )}
                </Page>
            }
        />
    );
}

const Page = styled.div`padding: 32px 24px; min-height: 100vh;`;
const Header = styled.div`display: flex; align-items: center; gap: 16px; margin-bottom: 24px;`;
const Title = styled.h2`font-size: 22px; font-weight: 700; color: #222; margin: 0;`;
const BackBtn = styled.button`
    background: none; border: 1px solid #ddd; border-radius: 6px;
    padding: 6px 14px; cursor: pointer; font-size: 13px; color: #555;
    &:hover { background: #f5f5f5; }
`;
const Card = styled.div`background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin-bottom: 16px;`;
const SectionTitle = styled.h3`font-size: 14px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;`;
const Row = styled.div`display: flex; flex-wrap: wrap; gap: 24px;`;
const InfoBlock = styled.div`min-width: 120px;`;
const Label = styled.div`font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;`;
const Value = styled.div`font-size: 14px; font-weight: 600; color: #222;`;
const StatusBadge = styled.span`
    background: ${p => p.color}22; color: ${p => p.color};
    font-size: 11px; font-weight: 700; padding: 4px 10px;
    border-radius: 999px; white-space: nowrap;
`;
const Th = styled.th`font-size: 11px; color: #aaa; text-transform: uppercase; padding: 0 8px 10px; text-align: left; border-bottom: 1px solid #eee;`;
const Td = styled.td`font-size: 13px; padding: 10px 8px; border-bottom: 1px solid #f5f5f5; color: #333;`;
const Center = styled.div`display: flex; justify-content: center; padding: 60px;`;
const UpdateBtn = styled.button`
    background: #c0392b; color: white; border: none; border-radius: 8px;
    padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px;
    opacity: ${p => p.disabled ? 0.5 : 1};
    &:hover { background: #a93226; }
`;
