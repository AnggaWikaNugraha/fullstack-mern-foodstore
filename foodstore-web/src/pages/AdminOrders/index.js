import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { LayoutSidebar } from 'upkit';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AppSidebar from '../../component/AppSidebar';
import { getOrders, getOrderStats, exportAllOrders, updateOrderStatus } from '../../api/orders';
import { formatRupiah } from '../../utils/format-rupiah';

const STATUS_FLOW = {
    waiting_payment: { label: 'Menunggu Bayar', color: '#e67e22', next: null },
    processing:      { label: 'Diproses',        color: '#2980b9', next: 'in_delivery' },
    in_delivery:     { label: 'Dikirim',          color: '#8e44ad', next: 'delivered' },
    delivered:       { label: 'Diterima',         color: '#27ae60', next: null },
    pending:         { label: 'Pending',           color: '#95a5a6', next: null },
};

const STATUS_TABS = [
    { key: '',                label: 'Semua' },
    { key: 'waiting_payment', label: 'Menunggu Bayar' },
    { key: 'processing',      label: 'Diproses' },
    { key: 'in_delivery',     label: 'Dikirim' },
    { key: 'delivered',       label: 'Diterima' },
    { key: 'pending',         label: 'Pending' },
];

function orderTotal(order) {
    const sub = (order.order_items || []).reduce((s, i) => s + (i.price * i.qty), 0);
    return sub + (order.delivery_fee || 0);
}

function exportToExcel(orders) {
    const wb = XLSX.utils.book_new();

    const orderRows = orders.map(o => ({
        'No. Order':       `#${o.order_number}`,
        'Tanggal':         new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        'Customer':        o.user?.full_name || '-',
        'Email':           o.user?.email || '-',
        'Jumlah Item':     (o.order_items || []).reduce((s, i) => s + (i.qty || 0), 0),
        'Sub Total':       (o.order_items || []).reduce((s, i) => s + i.price * i.qty, 0),
        'Ongkir':          o.delivery_fee || 0,
        'Total':           orderTotal(o),
        'Status':          STATUS_FLOW[o.status]?.label || o.status,
        'Provinsi':        o.delivery_address?.provinsi || '',
        'Kabupaten':       o.delivery_address?.kabupaten || '',
        'Kecamatan':       o.delivery_address?.kecamatan || '',
        'Kelurahan':       o.delivery_address?.kelurahan || '',
        'Alamat Detail':   o.delivery_address?.detail || '',
    }));

    const itemRows = orders.flatMap(o =>
        (o.order_items || []).map(i => ({
            'No. Order':     `#${o.order_number}`,
            'Tanggal':       new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            'Customer':      o.user?.full_name || '-',
            'Nama Produk':   i.name,
            'Qty':           i.qty,
            'Harga Satuan':  i.price,
            'Subtotal':      i.price * i.qty,
        }))
    );

    const ws1 = XLSX.utils.json_to_sheet(orderRows);
    const ws2 = XLSX.utils.json_to_sheet(itemRows);

    // Column widths
    ws1['!cols'] = [12,18,22,28,12,14,12,14,16,18,20,18,18,30].map(w => ({ wch: w }));
    ws2['!cols'] = [12,18,22,28,8,14,14].map(w => ({ wch: w }));

    XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan Order');
    XLSX.utils.book_append_sheet(wb, ws2, 'Detail Items');

    const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    XLSX.writeFile(wb, `laporan-order-${date}.xlsx`);
}

export default function AdminOrders() {
    const [orders, setOrders]       = useState([]);
    const [count, setCount]         = useState(0);
    const [page, setPage]           = useState(1);
    const [loading, setLoading]     = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [activeTab, setActiveTab] = useState('');
    const [stats, setStats]         = useState({ total: 0, by_status: {} });
    const [exporting, setExporting] = useState(false);
    const history = useHistory();
    const perPage = 10;

    useEffect(() => {
        getOrderStats()
            .then(({ data }) => { if (!data.error) setStats(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getOrders({ limit: perPage, page, status: activeTab })
            .then(({ data }) => {
                if (cancelled) return;
                setOrders(data.data || []);
                setCount(data.count || 0);
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [page, activeTab]); // eslint-disable-line

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPage(1);
    };

    const handleUpdateStatus = async (order, newStatus, e) => {
        e.stopPropagation();
        setUpdatingId(order._id);
        try {
            await updateOrderStatus(order._id, newStatus);
            setOrders(prev => prev.map(o =>
                o._id === order._id ? { ...o, status: newStatus } : o
            ));
            getOrderStats().then(({ data }) => { if (!data.error) setStats(data); }).catch(() => {});
        } catch {}
        setUpdatingId(null);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const { data } = await exportAllOrders();
            exportToExcel(data.data || []);
        } catch {
            alert('Gagal mengunduh data, coba lagi.');
        }
        setExporting(false);
    };

    const columns = [
        {
            name: 'Order #',
            selector: row => `#${row.order_number}`,
            width: '90px',
            cell: row => <OrderNum>#{row.order_number}</OrderNum>,
        },
        {
            name: 'Tanggal',
            selector: row => row.createdAt,
            width: '115px',
            cell: row => (
                <DateCell>
                    {new Date(row.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </DateCell>
            ),
        },
        {
            name: 'Customer',
            cell: row => (
                <CustomerCell>
                    <span className="name">{row.user?.full_name || '-'}</span>
                    <span className="email">{row.user?.email || ''}</span>
                </CustomerCell>
            ),
            grow: 2,
        },
        {
            name: 'Items',
            selector: row => (row.order_items || []).reduce((s, i) => s + (i.qty || 0), 0),
            width: '70px',
            cell: row => {
                const totalQty = (row.order_items || []).reduce((s, i) => s + (i.qty || 0), 0);
                return <ItemCount>{totalQty} item</ItemCount>;
            },
        },
        {
            name: 'Total',
            width: '120px',
            cell: row => <TotalCell>{formatRupiah(orderTotal(row))}</TotalCell>,
        },
        {
            name: 'Status',
            width: '140px',
            cell: row => {
                const s = STATUS_FLOW[row.status] || { label: row.status, color: '#aaa' };
                return <StatusBadge color={s.color}>{s.label}</StatusBadge>;
            },
        },
        {
            name: 'Aksi',
            width: '140px',
            cell: row => {
                const s = STATUS_FLOW[row.status];
                if (!s?.next) return <span style={{ color: '#ccc', fontSize: 12 }}>—</span>;
                const nextLabel = STATUS_FLOW[s.next]?.label || s.next;
                return (
                    <UpdateBtn
                        disabled={updatingId === row._id}
                        onClick={(e) => handleUpdateStatus(row, s.next, e)}
                    >
                        {updatingId === row._id ? '...' : `→ ${nextLabel}`}
                    </UpdateBtn>
                );
            },
        },
    ];

    const statCards = [
        { label: 'Total Order',       value: stats.total,                                  color: '#2c3e50', icon: '📦' },
        { label: 'Menunggu Bayar',    value: stats.by_status?.waiting_payment || 0,         color: '#e67e22', icon: '⏳' },
        { label: 'Diproses / Dikirim', value: (stats.by_status?.processing || 0) + (stats.by_status?.in_delivery || 0), color: '#2980b9', icon: '🚚' },
        { label: 'Diterima',          value: stats.by_status?.delivered || 0,               color: '#27ae60', icon: '✅' },
    ];

    return (
        <LayoutSidebar
            sidebar={<AppSidebar />}
            sidebarSize={80}
            content={
                <Page>
                    <Header>
                        <div>
                            <Title>Manajemen Order</Title>
                            <Subtitle>Kelola dan pantau semua pesanan pelanggan</Subtitle>
                        </div>
                        <ExportBtn onClick={handleExport} disabled={exporting}>
                            {exporting ? '⏳ Mengunduh...' : '⬇ Export Excel'}
                        </ExportBtn>
                    </Header>

                    <StatsRow>
                        {statCards.map(card => (
                            <StatCard key={card.label} color={card.color}>
                                <StatIcon>{card.icon}</StatIcon>
                                <StatValue>{card.value}</StatValue>
                                <StatLabel>{card.label}</StatLabel>
                            </StatCard>
                        ))}
                    </StatsRow>

                    <TableCard>
                        <TabRow>
                            {STATUS_TABS.map(tab => (
                                <Tab
                                    key={tab.key}
                                    active={activeTab === tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                >
                                    {tab.label}
                                    {tab.key && stats.by_status?.[tab.key] != null && (
                                        <TabCount active={activeTab === tab.key}>
                                            {stats.by_status[tab.key] || 0}
                                        </TabCount>
                                    )}
                                    {!tab.key && (
                                        <TabCount active={activeTab === tab.key}>{stats.total}</TabCount>
                                    )}
                                </Tab>
                            ))}
                        </TabRow>

                        <DataTable
                            columns={columns}
                            data={orders}
                            progressPending={loading}
                            progressComponent={
                                <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
                                    <BounceLoader color="#c0392b" size={32} />
                                </div>
                            }
                            pagination
                            paginationServer
                            paginationTotalRows={count}
                            paginationPerPage={perPage}
                            paginationComponentOptions={{ noRowsPerPage: true }}
                            onChangePage={p => setPage(p)}
                            onRowClicked={row => history.push(`/admin/orders/${row._id}`)}
                            pointerOnHover
                            highlightOnHover
                            noDataComponent={<Empty>Belum ada order</Empty>}
                            customStyles={tableStyles}
                        />
                    </TableCard>
                </Page>
            }
        />
    );
}

const tableStyles = {
    headRow: {
        style: {
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e9ecef',
            minHeight: '44px',
        },
    },
    headCells: {
        style: {
            fontSize: '12px',
            fontWeight: '700',
            color: '#495057',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            paddingLeft: '16px',
            paddingRight: '8px',
        },
    },
    rows: {
        style: {
            minHeight: '64px',
            borderBottom: '1px solid #f1f3f5',
            '&:last-child': { borderBottom: 'none' },
        },
        highlightOnHoverStyle: {
            backgroundColor: '#fff8f8',
            cursor: 'pointer',
        },
    },
    cells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '8px',
        },
    },
    pagination: {
        style: {
            borderTop: '1px solid #e9ecef',
            paddingTop: '12px',
            paddingBottom: '12px',
        },
    },
};

const Page = styled.div`
    padding: 28px 28px 40px;
    min-height: 100vh;
    background: #f4f6f9;
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
`;

const Title = styled.h2`
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
`;

const Subtitle = styled.p`
    font-size: 13px;
    color: #888;
    margin: 0;
`;

const ExportBtn = styled.button`
    background: ${p => p.disabled ? '#e0e0e0' : '#27ae60'};
    color: ${p => p.disabled ? '#aaa' : '#fff'};
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
    white-space: nowrap;
    transition: background 0.15s;
    &:hover { background: ${p => p.disabled ? '#e0e0e0' : '#219a52'}; }
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const StatCard = styled.div`
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    border-left: 4px solid ${p => p.color};
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const StatIcon = styled.div`
    font-size: 22px;
    margin-bottom: 6px;
`;

const StatValue = styled.div`
    font-size: 28px;
    font-weight: 800;
    color: #1a1a2e;
    line-height: 1;
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: #888;
    margin-top: 2px;
`;

const TableCard = styled.div`
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    overflow: hidden;
`;

const TabRow = styled.div`
    display: flex;
    gap: 4px;
    padding: 16px 16px 0;
    border-bottom: 1px solid #e9ecef;
    overflow-x: auto;
`;

const Tab = styled.button`
    background: none;
    border: none;
    border-bottom: 2px solid ${p => p.active ? '#c0392b' : 'transparent'};
    color: ${p => p.active ? '#c0392b' : '#888'};
    font-size: 13px;
    font-weight: ${p => p.active ? '700' : '500'};
    padding: 8px 12px 12px;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.15s;
    &:hover { color: #c0392b; }
`;

const TabCount = styled.span`
    background: ${p => p.active ? '#c0392b' : '#e9ecef'};
    color: ${p => p.active ? '#fff' : '#666'};
    font-size: 11px;
    font-weight: 700;
    border-radius: 999px;
    padding: 1px 7px;
    min-width: 20px;
    text-align: center;
`;

const OrderNum = styled.span`
    font-weight: 700;
    color: #1a1a2e;
    font-size: 13px;
`;

const DateCell = styled.span`
    font-size: 12px;
    color: #666;
`;

const CustomerCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    .name {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a2e;
    }
    .email {
        font-size: 11px;
        color: #aaa;
    }
`;

const ItemCount = styled.span`
    font-size: 12px;
    color: #555;
    background: #f0f0f0;
    padding: 3px 8px;
    border-radius: 999px;
    white-space: nowrap;
`;

const TotalCell = styled.span`
    font-size: 13px;
    font-weight: 700;
    color: #c0392b;
`;

const StatusBadge = styled.span`
    background: ${p => p.color}22;
    color: ${p => p.color};
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
    border: 1px solid ${p => p.color}44;
`;

const UpdateBtn = styled.button`
    background: #c0392b;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    opacity: ${p => p.disabled ? 0.5 : 1};
    transition: background 0.15s;
    &:hover { background: ${p => p.disabled ? '#c0392b' : '#a93226'}; }
`;

const Empty = styled.div`
    padding: 48px;
    color: #ccc;
    font-size: 14px;
    text-align: center;
`;
