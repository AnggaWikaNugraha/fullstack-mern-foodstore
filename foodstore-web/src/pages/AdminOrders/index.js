import React, { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import { LayoutSidebar } from 'upkit';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader';
import AppSidebar from '../../component/AppSidebar';
import { getOrders, updateOrderStatus } from '../../api/orders';
import { formatRupiah } from '../../utils/format-rupiah';

const STATUS_FLOW = {
    waiting_payment: { label: 'Menunggu Bayar', color: '#e67e22', next: null },
    processing:      { label: 'Diproses',        color: '#2980b9', next: 'in_delivery' },
    in_delivery:     { label: 'Dikirim',          color: '#8e44ad', next: 'delivered' },
    delivered:       { label: 'Diterima',         color: '#27ae60', next: null },
    pending:         { label: 'Pending',           color: '#95a5a6', next: null },
};

const STATUS_LABELS = {
    waiting_payment: 'Menunggu Bayar',
    processing:      'Diproses',
    in_delivery:     'Dikirim',
    delivered:       'Diterima',
    pending:         'Pending',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const perPage = 10;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getOrders({ limit: perPage, page });
            setOrders(data.data || []);
            setCount(data.count || 0);
        } catch {}
        setLoading(false);
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdateStatus = async (order, newStatus) => {
        setUpdatingId(order._id);
        try {
            await updateOrderStatus(order._id, newStatus);
            setOrders(prev => prev.map(o =>
                o._id === order._id ? { ...o, status: newStatus } : o
            ));
        } catch {}
        setUpdatingId(null);
    };

    const columns = [
        {
            name: 'Order #',
            selector: row => `#${row.order_number}`,
            width: '90px',
            fontWeight: 700,
        },
        {
            name: 'Tanggal',
            selector: row => new Date(row.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            }),
            width: '120px',
        },
        {
            name: 'Items',
            selector: row => `${row.items_count || row.order_items?.length || 0} item`,
            width: '80px',
        },
        {
            name: 'Ongkir',
            selector: row => formatRupiah(row.delivery_fee || 0),
            width: '110px',
        },
        {
            name: 'Status',
            cell: row => {
                const s = STATUS_FLOW[row.status] || { label: row.status, color: '#aaa' };
                return <StatusBadge color={s.color}>{s.label}</StatusBadge>;
            },
            width: '130px',
        },
        {
            name: 'Aksi',
            cell: row => {
                const s = STATUS_FLOW[row.status];
                if (!s?.next) return <span style={{ color: '#ccc', fontSize: 12 }}>—</span>;
                return (
                    <UpdateBtn
                        disabled={updatingId === row._id}
                        onClick={() => handleUpdateStatus(row, s.next)}
                    >
                        {updatingId === row._id ? '...' : `→ ${STATUS_LABELS[s.next]}`}
                    </UpdateBtn>
                );
            },
        },
        {
            name: 'Alamat',
            cell: row => (
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>
                    {row.delivery_address?.detail}<br />
                    {row.delivery_address?.kecamatan}, {row.delivery_address?.kabupaten}
                </div>
            ),
            grow: 2,
        },
    ];

    return (
        <LayoutSidebar
            sidebar={<AppSidebar />}
            sidebarSize={80}
            content={
                <Page>
                    <Title>Manajemen Order</Title>
                    <DataTable
                        columns={columns}
                        data={orders}
                        progressPending={loading}
                        progressComponent={<div style={{ padding: 40 }}><BounceLoader color="#c0392b" size={32} /></div>}
                        pagination
                        paginationServer
                        paginationTotalRows={count}
                        paginationPerPage={perPage}
                        paginationComponentOptions={{ noRowsPerPage: true }}
                        onChangePage={p => setPage(p)}
                        noDataComponent={<Empty>Belum ada order</Empty>}
                    />
                </Page>
            }
        />
    );
}

const Page = styled.div`
    padding: 32px 24px;
    min-height: 100vh;
`;

const Title = styled.h2`
    font-size: 22px;
    font-weight: 700;
    color: #222;
    margin-bottom: 24px;
`;

const StatusBadge = styled.span`
    background: ${p => p.color}22;
    color: ${p => p.color};
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
`;

const UpdateBtn = styled.button`
    background: #c0392b;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    opacity: ${p => p.disabled ? 0.5 : 1};
    &:hover { background: #a93226; }
`;

const Empty = styled.div`
    padding: 32px;
    color: #ccc;
    font-size: 14px;
`;
