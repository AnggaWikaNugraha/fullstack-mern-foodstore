import React from 'react';
import { LayoutSidebar } from 'upkit';
import styled from '@emotion/styled';
import BounceLoader from 'react-spinners/BounceLoader';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import AppSidebar from '../../component/AppSidebar';
import { getDashboardSummary, getDashboardRevenue, getDashboardTopProducts } from '../../api/dashboard';
import { formatRupiah } from '../../utils/format-rupiah';
import { getImageUrl } from '../../utils/image-url';

export default function Dashboard() {
    const [summary, setSummary] = React.useState(null);
    const [revenue, setRevenue] = React.useState([]);
    const [topProducts, setTopProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        Promise.all([
            getDashboardSummary(),
            getDashboardRevenue(),
            getDashboardTopProducts(),
        ]).then(([s, r, t]) => {
            setSummary(s.data);
            setRevenue(r.data.data || []);
            setTopProducts(t.data.data || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <Center><BounceLoader color="#c0392b" /></Center>
    );

    const summaryCards = [
        { label: 'Total Revenue', value: formatRupiah(summary?.total_revenue || 0), color: '#27ae60', bg: '#e8f8f0' },
        { label: 'Total Orders', value: summary?.total_orders || 0, color: '#2980b9', bg: '#eaf4fd' },
        { label: 'Total Produk', value: summary?.total_products || 0, color: '#e67e22', bg: '#fff8e1' },
        { label: 'Total User', value: summary?.total_users || 0, color: '#8e44ad', bg: '#f5eef8' },
    ];

    const chartData = revenue.map(d => ({
        date: d._id.slice(5),
        revenue: d.revenue,
        orders: d.orders,
    }));

    return (
        <LayoutSidebar
            sidebar={<AppSidebar />}
            sidebarSize={80}
            content={
                <Page>
                    <Title>Dashboard</Title>

                    {/* Summary cards */}
                    <SummaryGrid>
                        {summaryCards.map((c, i) => (
                            <SummaryCard key={i} style={{ backgroundColor: c.bg }}>
                                <SummaryValue style={{ color: c.color }}>{c.value}</SummaryValue>
                                <SummaryLabel>{c.label}</SummaryLabel>
                            </SummaryCard>
                        ))}
                    </SummaryGrid>

                    {/* Revenue chart */}
                    <Section>
                        <SectionTitle>Revenue 30 Hari Terakhir</SectionTitle>
                        {chartData.length === 0 ? (
                            <Empty>Belum ada data revenue</Empty>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#c0392b" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={v => formatRupiah(v)} />
                                    <Area type="monotone" dataKey="revenue" stroke="#c0392b" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Section>

                    <BottomGrid>
                        {/* Orders per day chart */}
                        <Section style={{ flex: 1 }}>
                            <SectionTitle>Orders per Hari</SectionTitle>
                            {chartData.length === 0 ? (
                                <Empty>Belum ada data order</Empty>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="orders" fill="#3498db" radius={[4, 4, 0, 0]} name="Orders" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Section>

                        {/* Top products */}
                        <Section style={{ flex: 1 }}>
                            <SectionTitle>Produk Terlaris</SectionTitle>
                            {topProducts.length === 0 ? (
                                <Empty>Belum ada data penjualan</Empty>
                            ) : (
                                <TopList>
                                    {topProducts.map((p, i) => (
                                        <TopItem key={i}>
                                            <Rank>{i + 1}</Rank>
                                            {p.image_url && (
                                                <TopImg src={getImageUrl(p.image_url)} alt={p.name} />
                                            )}
                                            <TopInfo>
                                                <TopName>{p.name}</TopName>
                                                <TopMeta>{p.total_qty} terjual · {formatRupiah(p.total_revenue)}</TopMeta>
                                            </TopInfo>
                                        </TopItem>
                                    ))}
                                </TopList>
                            )}
                        </Section>
                    </BottomGrid>
                </Page>
            }
        />
    );
}

const Page = styled('div')({
    maxWidth: 960,
    margin: '0 auto',
    padding: '32px 20px',
    minHeight: '100vh',
});

const Title = styled('h2')({
    fontSize: 22,
    fontWeight: 700,
    color: '#222',
    marginBottom: 24,
});

const Center = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
});

const SummaryGrid = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
    '@media (max-width: 640px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
});

const SummaryCard = styled('div')({
    borderRadius: 12,
    padding: '20px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
});

const SummaryValue = styled('p')({
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 4px',
});

const SummaryLabel = styled('p')({
    fontSize: 12,
    color: '#888',
    margin: 0,
    fontWeight: 600,
});

const Section = styled('div')({
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: 20,
});

const SectionTitle = styled('h3')({
    fontSize: 14,
    fontWeight: 700,
    color: '#555',
    margin: '0 0 16px',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
});

const BottomGrid = styled('div')({
    display: 'flex',
    gap: 20,
    '@media (max-width: 640px)': { flexDirection: 'column' },
});

const Empty = styled('p')({
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    padding: '24px 0',
    margin: 0,
});

const TopList = styled('div')({ display: 'flex', flexDirection: 'column', gap: 12 });

const TopItem = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
});

const Rank = styled('span')({
    fontSize: 16,
    fontWeight: 700,
    color: '#ddd',
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
});

const TopImg = styled('img')({
    width: 40,
    height: 40,
    objectFit: 'cover',
    borderRadius: 8,
    flexShrink: 0,
});

const TopInfo = styled('div')({ flex: 1, minWidth: 0 });

const TopName = styled('p')({
    fontSize: 13,
    fontWeight: 600,
    color: '#222',
    margin: '0 0 2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const TopMeta = styled('p')({
    fontSize: 12,
    color: '#aaa',
    margin: 0,
});
