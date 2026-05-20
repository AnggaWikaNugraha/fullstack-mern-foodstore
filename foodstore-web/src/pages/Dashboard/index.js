import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import BounceLoader from 'react-spinners/BounceLoader';
import { useSelector } from 'react-redux';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { getDashboardSummary, getDashboardRevenue, getDashboardTopProducts } from '../../api/dashboard';
import { formatRupiah } from '../../utils/format-rupiah';
import { getImageUrl } from '../../utils/image-url';

const ADMIN_NAV = [
    { label: 'Dashboard',  icon: '📊', to: '/admin/dashboard'  },
    { label: 'Produk',     icon: '🍱', to: '/admin/product'    },
    { label: 'Kategori',   icon: '🗂️', to: '/admin/categories' },
    { label: 'Tag',        icon: '🏷️', to: '/admin/tag'        },
    { label: 'Pesanan',    icon: '📦', to: '/admin/orders'     },
];

export default function Dashboard() {
    const auth     = useSelector(state => state.auth);
    const user     = auth?.user;
    const location = useLocation();

    const [summary,     setSummary]     = React.useState(null);
    const [revenue,     setRevenue]     = React.useState([]);
    const [topProducts, setTopProducts] = React.useState([]);
    const [loading,     setLoading]     = React.useState(true);

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

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'A';

    const summaryCards = [
        { label: 'Total Revenue', value: formatRupiah(summary?.total_revenue || 0), icon: '💰', color: '#27ae60', bg: '#e8f8f0' },
        { label: 'Total Orders',  value: summary?.total_orders  || 0,                icon: '📦', color: '#2980b9', bg: '#eaf4fd' },
        { label: 'Total Produk',  value: summary?.total_products || 0,               icon: '🍱', color: '#e67e22', bg: '#fff8e1' },
        { label: 'Total User',    value: summary?.total_users   || 0,                icon: '👤', color: '#8e44ad', bg: '#f5eef8' },
    ];

    const chartData = revenue.map(d => ({
        date: d._id.slice(5),
        revenue: d.revenue,
        orders: d.orders,
    }));

    return (
        <PageBg>
            <PageInner>

                {/* ── MOBILE top bar ── */}
                <MobileTopBar>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>⚙️ Admin Panel</span>
                    <MobileNavScroll>
                        {ADMIN_NAV.map(n => (
                            <MobileNavItem key={n.to} as={Link} to={n.to} active={location.pathname === n.to}>
                                {n.icon} {n.label}
                            </MobileNavItem>
                        ))}
                    </MobileNavScroll>
                </MobileTopBar>

                {/* ── LEFT SIDEBAR ── */}
                <Sidebar>
                    <SidebarBrand>
                        <BrandAvatar>{initials}</BrandAvatar>
                        <div>
                            <BrandName>{user?.full_name || 'Admin'}</BrandName>
                            <BrandRole>Administrator</BrandRole>
                        </div>
                    </SidebarBrand>

                    <NavSection>Admin Menu</NavSection>
                    {ADMIN_NAV.map(n => (
                        <NavItem key={n.to} as={Link} to={n.to} active={location.pathname === n.to}>
                            <NavIcon>{n.icon}</NavIcon>
                            <NavLabel active={location.pathname === n.to}>{n.label}</NavLabel>
                        </NavItem>
                    ))}

                    <Divider />

                    <NavItem as={Link} to="/account" style={{ textDecoration: 'none' }}>
                        <NavIcon>👤</NavIcon>
                        <NavLabel>Profil</NavLabel>
                    </NavItem>
                    <NavItem as={Link} to="/" style={{ textDecoration: 'none' }}>
                        <NavIcon>🏠</NavIcon>
                        <NavLabel>Kembali ke Toko</NavLabel>
                    </NavItem>
                    <NavItem as={Link} to="/logout" danger style={{ textDecoration: 'none' }}>
                        <NavIcon>🚪</NavIcon>
                        <NavLabel danger>Logout</NavLabel>
                    </NavItem>
                </Sidebar>

                {/* ── MAIN CONTENT ── */}
                <Content>
                    {/* Bagian fixed: judul + summary cards */}
                    <ContentFixed>
                        <PageHeader>
                            <PageTitle>Dashboard</PageTitle>
                            <PageSub>Selamat datang, {user?.full_name || 'Admin'} 👋</PageSub>
                        </PageHeader>
                        {!loading && (
                            <SummaryGrid>
                                {summaryCards.map((c, i) => (
                                    <SummaryCard key={i} style={{ background: c.bg }}>
                                        <CardIcon style={{ color: c.color }}>{c.icon}</CardIcon>
                                        <CardValue style={{ color: c.color }}>{c.value}</CardValue>
                                        <CardLabel>{c.label}</CardLabel>
                                    </SummaryCard>
                                ))}
                            </SummaryGrid>
                        )}
                    </ContentFixed>

                    {/* Bagian scroll: charts */}
                    <ContentScroll>
                        {loading ? (
                            <LoadingWrap>
                                <BounceLoader color="#c0392b" />
                            </LoadingWrap>
                        ) : (
                            <>
                                {/* Revenue chart */}
                                <Section>
                                    <SectionTitle>Revenue 30 Hari Terakhir</SectionTitle>
                                    {chartData.length === 0 ? (
                                        <Empty>Belum ada data revenue</Empty>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
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
                                    {/* Orders per day */}
                                    <Section style={{ flex: 1 }}>
                                        <SectionTitle>Orders per Hari</SectionTitle>
                                        {chartData.length === 0 ? (
                                            <Empty>Belum ada data order</Empty>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={180}>
                                                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                                                        <Rank>#{i + 1}</Rank>
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
                            </>
                        )}
                    </ContentScroll>
                </Content>
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
    gap: '1.25rem',
    alignItems: 'stretch',
    overflow: 'hidden',
    maxWidth: '72rem',
    width: '100%',
    margin: '0 auto',
    padding: '1.5rem 1.25rem 2rem',
    boxSizing: 'border-box',
    '@media (max-width: 768px)': {
        flexDirection: 'column',
        padding: 0,
        gap: 0,
    },
});

/* ─── Mobile top bar ─────────────────────────────────────────────────────── */

const MobileTopBar = styled('div')({
    display: 'none',
    '@media (max-width: 768px)': {
        display: 'block',
        flexShrink: 0,
        background: '#c0392b',
        padding: '0.875rem 1rem 0',
        width: '100%',
    },
});

const MobileNavScroll = styled('div')({
    display: 'flex',
    overflowX: 'auto',
    marginTop: '0.625rem',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
});

const MobileNavItem = styled('div')(({ active }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.625rem 0.875rem',
    flexShrink: 0,
    fontSize: '0.8125rem',
    fontWeight: active ? 700 : 500,
    color: active ? '#fff' : 'rgba(255,255,255,0.75)',
    borderBottom: active ? '2px solid #fff' : '2px solid transparent',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
}));

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */

const Sidebar = styled('div')({
    width: '15rem',
    flexShrink: 0,
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    overflowY: 'auto',
    overflowX: 'hidden',
    alignSelf: 'stretch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '@media (max-width: 768px)': { display: 'none' },
});

const SidebarBrand = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.25rem',
    borderBottom: '1px solid #f5f5f5',
    background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
});

const BrandAvatar = styled('div')({
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.4)',
});

const BrandName = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.3,
});

const BrandRole = styled('div')({
    fontSize: '0.6875rem',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
});

const NavSection = styled('div')({
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '1rem 1.25rem 0.375rem',
});

const NavItem = styled('div')(({ active, danger }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.7rem 1.25rem',
    cursor: 'pointer',
    borderLeft: active ? '3px solid #c0392b' : '3px solid transparent',
    background: active ? '#fff5f5' : 'transparent',
    textDecoration: 'none',
    transition: 'background 0.12s',
    '&:hover': { background: danger ? '#fff5f5' : '#f9f9f9' },
}));

const NavIcon = styled('span')({ fontSize: 16, flexShrink: 0 });

const NavLabel = styled('span')(({ active, danger }) => ({
    fontSize: '0.875rem',
    fontWeight: active ? 700 : 500,
    color: danger ? '#e74c3c' : active ? '#c0392b' : '#333',
}));

const Divider = styled('div')({
    height: 1,
    background: '#f0f0f0',
    margin: '0.375rem 0',
});

/* ─── Content ─────────────────────────────────────────────────────────────── */

const Content = styled('div')({
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
        width: '100%',
        padding: '0.75rem 0.75rem 0',
        boxSizing: 'border-box',
    },
});

const ContentFixed = styled('div')({
    flexShrink: 0,
    paddingBottom: '1rem',
    '@media (max-width: 768px)': { paddingBottom: '0.75rem' },
});

const ContentScroll = styled('div')({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '2rem',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '@media (max-width: 768px)': { paddingBottom: '1rem' },
});

const PageHeader = styled('div')({
    marginBottom: '1.25rem',
});

const PageTitle = styled('h2')({
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#111',
    margin: '0 0 2px',
});

const PageSub = styled('p')({
    fontSize: '0.8125rem',
    color: '#999',
    margin: 0,
});

const LoadingWrap = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    padding: '4rem 0',
});

/* ─── Summary cards ───────────────────────────────────────────────────────── */

const SummaryGrid = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.25rem',
    '@media (max-width: 640px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
});

const SummaryCard = styled('div')({
    borderRadius: '0.875rem',
    padding: '1.25rem 1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
});

const CardIcon = styled('div')({ fontSize: 24, marginBottom: '0.5rem' });
const CardValue = styled('div')({ fontSize: '1.375rem', fontWeight: 800, marginBottom: 2 });
const CardLabel = styled('div')({ fontSize: '0.75rem', color: '#888', fontWeight: 600 });

/* ─── Charts & sections ───────────────────────────────────────────────────── */

const Section = styled('div')({
    background: '#fff',
    borderRadius: '0.875rem',
    padding: '1.25rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    marginBottom: '1.25rem',
});

const SectionTitle = styled('h3')({
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 1rem',
});

const BottomGrid = styled('div')({
    display: 'flex',
    gap: '1.25rem',
    '@media (max-width: 640px)': { flexDirection: 'column' },
});

const Empty = styled('p')({
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    padding: '2rem 0',
    margin: 0,
});

/* ─── Top products ────────────────────────────────────────────────────────── */

const TopList = styled('div')({ display: 'flex', flexDirection: 'column', gap: '0.75rem' });

const TopItem = styled('div')({ display: 'flex', alignItems: 'center', gap: '0.75rem' });

const Rank = styled('span')({
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#ccc',
    width: 24,
    textAlign: 'center',
    flexShrink: 0,
});

const TopImg = styled('img')({
    width: 40,
    height: 40,
    objectFit: 'cover',
    borderRadius: '0.5rem',
    flexShrink: 0,
    background: '#f5f5f5',
});

const TopInfo = styled('div')({ flex: 1, minWidth: 0 });

const TopName = styled('div')({
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#222',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const TopMeta = styled('div')({
    fontSize: '0.75rem',
    color: '#aaa',
    marginTop: 2,
});
