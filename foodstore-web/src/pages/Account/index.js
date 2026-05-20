import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { setPassword } from '../../api/auth';
import { userLogin } from '../../features/Auth/actions';
import BounceLoader from 'react-spinners/BounceLoader';
import { getInvoices } from '../../api/invoice';
import { getOrders } from '../../api/orders';
import { formatRupiah } from '../../utils/format-rupiah';

const TABS = [
    { key: 'biodata',  label: 'Biodata Diri',       icon: '👤' },
    { key: 'alamat',   label: 'Alamat Pengiriman',   icon: '📍' },
    { key: 'riwayat',  label: 'Riwayat Belanja',     icon: '🧾' },
    { key: 'keamanan', label: 'Keamanan',             icon: '🔐' },
];

const ADMIN_MENUS = [
    { label: 'Dashboard',  desc: 'Statistik & ringkasan toko',   icon: '📊', to: '/admin/dashboard' },
    { label: 'Produk',     desc: 'Kelola daftar produk',         icon: '🍱', to: '/admin/product'   },
    { label: 'Kategori',   desc: 'Kelola kategori menu',         icon: '🗂️', to: '/admin/categories' },
    { label: 'Tag',        desc: 'Kelola tag produk',            icon: '🏷️', to: '/admin/tag'       },
    { label: 'Pesanan',    desc: 'Kelola semua pesanan masuk',   icon: '📦', to: '/admin/orders'    },
];

function paymentLabel(status) {
    if (['paid', 'settlement', 'capture'].includes(status)) return { text: 'Lunas',        color: '#27ae60', bg: '#e8f8f0' };
    if (status === 'pending')                                return { text: 'Menunggu',     color: '#e67e22', bg: '#fff8e1' };
    if (['deny', 'cancel', 'expire', 'failed'].includes(status)) return { text: 'Gagal',  color: '#e74c3c', bg: '#fff5f5' };
    return { text: 'Belum Bayar', color: '#888', bg: '#f5f5f5' };
}

export default function Account() {
    const auth        = useSelector(state => state.auth);
    const cartSaving  = useSelector(state => state.cartSaving);
    const dispatch    = useDispatch();
    const history     = useHistory();
    const location    = useLocation();
    const user        = auth?.user;

    const initialTab  = new URLSearchParams(location.search).get('tab') || 'biodata';
    const [tab,            setTab]            = React.useState(initialTab);
    const [invoices,        setInvoices]       = React.useState([]);
    const [invoiceLoading,  setInvoiceLoading] = React.useState(false);
    const [pendingInvoices,  setPendingInvoices]  = React.useState([]);
    const [pendingExpanded,  setPendingExpanded]  = React.useState(false);
    const [adminOrders,      setAdminOrders]      = React.useState([]);
    const [adminExpanded,    setAdminExpanded]    = React.useState(false);
    const [pwForm,          setPwForm]         = React.useState({ password: '', password_confirmation: '' });
    const [pwStatus,       setPwStatus]       = React.useState('idle');
    const [pwMsg,          setPwMsg]          = React.useState('');

    React.useEffect(() => {
        if (!user) return;
        if (user.role === 'admin') {
            getOrders({ limit: 20, page: 1, status: 'processing' })
                .then(res => setAdminOrders(res.data.data || []))
                .catch(() => {});
        } else {
            getInvoices({ limit: 20 })
                .then(res => {
                    const all = res.data.data || [];
                    setPendingInvoices(all.filter(inv =>
                        ['waiting_payment', 'pending'].includes(inv.payment_status)
                    ));
                })
                .catch(() => {});
        }
    }, []); // eslint-disable-line

    React.useEffect(() => {
        if (tab !== 'riwayat') return;
        setInvoiceLoading(true);
        getInvoices({ limit: 20 })
            .then(res => setInvoices(res.data.data || []))
            .catch(() => {})
            .finally(() => setInvoiceLoading(false));
    }, [tab]); // eslint-disable-line

    const handleTabChange = (key) => setTab(key);

    const handleSetPassword = async (e) => {
        e.preventDefault();
        setPwStatus('loading');
        setPwMsg('');
        try {
            const { data } = await setPassword(pwForm);
            if (data?.error) { setPwMsg(data.message); setPwStatus('error'); }
            else {
                setPwMsg('Password berhasil disimpan!');
                setPwStatus('success');
                setPwForm({ password: '', password_confirmation: '' });
                dispatch(userLogin({ ...user, has_password: true }, auth.token));
            }
        } catch { setPwMsg('Terjadi kesalahan, coba lagi.'); setPwStatus('error'); }
    };

    if (!user) { history.push('/login'); return null; }

    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <PageBg>
            {cartSaving && (
                <SavingBar>
                    <BounceLoader color="#fff" size={14} />
                    <span>Menyimpan keranjang...</span>
                </SavingBar>
            )}
            <PageInner>

                {/* ── MOBILE: profile header ── */}
                <MobileHeader>
                    <MobileAvatar>{initials}</MobileAvatar>
                    <div>
                        <MobileName>{user.full_name}</MobileName>
                        <MobileEmail>{user.email}</MobileEmail>
                        {user.customer_id && <CustomerBadge style={{ marginTop: 4 }}>Customer #{user.customer_id}</CustomerBadge>}
                    </div>
                </MobileHeader>

                {/* ── MOBILE: tab bar ── */}
                <MobileTabBar>
                    {TABS.map(t => (
                        t.key === 'alamat' ? (
                            <MobileTabItem key={t.key} active={tab === t.key} as={Link} to="/alamat-pengiriman">
                                <span>{t.icon}</span>
                                <span>{t.label}</span>
                            </MobileTabItem>
                        ) : (
                            <MobileTabItem key={t.key} active={tab === t.key} onClick={() => handleTabChange(t.key)}>
                                <span>{t.icon}</span>
                                <span>{t.label}</span>
                            </MobileTabItem>
                        )
                    ))}
                    {user.role === 'admin' && (
                        <MobileTabItem active={tab === 'admin'} onClick={() => handleTabChange('admin')}>
                            <span>🛡️</span>
                            <span>Admin</span>
                        </MobileTabItem>
                    )}
                    <MobileTabItem onClick={() => history.push('/logout')} danger>
                        <span>🚪</span>
                        <span>Logout</span>
                    </MobileTabItem>
                </MobileTabBar>

                {/* ── LEFT SIDEBAR (desktop only) ── */}
                <Sidebar>
                    <SidebarTop>
                        <AvatarCircle>{initials}</AvatarCircle>
                        <SidebarName>{user.full_name}</SidebarName>
                        <SidebarEmail>{user.email}</SidebarEmail>
                        {user.customer_id && (
                            <CustomerBadge>Customer #{user.customer_id}</CustomerBadge>
                        )}
                    </SidebarTop>

                    <NavList>
                        {TABS.map(t => (
                            t.key === 'alamat' ? (
                                <NavItem key={t.key} as={Link} to="/alamat-pengiriman" active={tab === t.key} style={{ textDecoration: 'none' }}>
                                    <NavIcon>{t.icon}</NavIcon>
                                    <NavLabel active={tab === t.key}>{t.label}</NavLabel>
                                </NavItem>
                            ) : (
                                <NavItem key={t.key} active={tab === t.key} onClick={() => handleTabChange(t.key)}>
                                    <NavIcon>{t.icon}</NavIcon>
                                    <NavLabel active={tab === t.key}>{t.label}</NavLabel>
                                </NavItem>
                            )
                        ))}
                        {user.role === 'admin' && (
                            <NavItem active={tab === 'admin'} onClick={() => handleTabChange('admin')}>
                                <NavIcon>🛡️</NavIcon>
                                <NavLabel active={tab === 'admin'}>Admin Panel</NavLabel>
                            </NavItem>
                        )}
                        <Divider />
                        <NavItem as={Link} to="/" style={{ textDecoration: 'none' }}>
                            <NavIcon>🛒</NavIcon>
                            <NavLabel>Belanja</NavLabel>
                        </NavItem>
                        <NavItem onClick={() => history.push('/logout')} danger>
                            <NavIcon>🚪</NavIcon>
                            <NavLabel danger>Logout</NavLabel>
                        </NavItem>
                    </NavList>
                </Sidebar>

                {/* ── RIGHT CONTENT ── */}
                <Content>

                    {/* Admin: pesanan masuk perlu dikirim */}
                    {user.role === 'admin' && adminOrders.length > 0 && (
                        <AdminOrderBanner>
                            <AdminBannerHead onClick={() => setAdminExpanded(v => !v)}>
                                <AdminBannerIcon>🚚</AdminBannerIcon>
                                <AdminBannerTitle>
                                    {adminOrders.length} pesanan perlu dikirim
                                </AdminBannerTitle>
                                <PendingChevron expanded={adminExpanded}>›</PendingChevron>
                            </AdminBannerHead>
                            {adminExpanded && adminOrders.map((order, i) => (
                                <AdminOrderItem key={i} as={Link} to="/admin/orders">
                                    <AdminOrderInfo>
                                        <AdminOrderNum>Order #{order.order_number}</AdminOrderNum>
                                        <AdminOrderMeta>
                                            {order.user?.full_name || '-'} · {(order.order_items || []).reduce((s, it) => s + it.qty, 0)} item
                                        </AdminOrderMeta>
                                    </AdminOrderInfo>
                                    <AdminProcessBtn>Proses →</AdminProcessBtn>
                                </AdminOrderItem>
                            ))}
                        </AdminOrderBanner>
                    )}

                    {/* User: pending payment banner */}
                    {user.role !== 'admin' && pendingInvoices.length > 0 && (
                        <PendingBanner>
                            <PendingBannerHead onClick={() => setPendingExpanded(v => !v)}>
                                <PendingBannerIcon>⏳</PendingBannerIcon>
                                <PendingBannerTitle>
                                    {pendingInvoices.length} pesanan menunggu pembayaran
                                </PendingBannerTitle>
                                <PendingChevron expanded={pendingExpanded}>›</PendingChevron>
                            </PendingBannerHead>
                            {pendingExpanded && pendingInvoices.map((inv, i) => (
                                <PendingItem key={i} as={Link} to={`/invoice/${inv.order?._id}`}>
                                    <PendingItemInfo>
                                        <PendingItemOrder>Order #{inv.order?.order_number || '-'}</PendingItemOrder>
                                        <PendingItemTotal>{formatRupiah(inv.total)}</PendingItemTotal>
                                    </PendingItemInfo>
                                    <PendingPayBtn>Bayar →</PendingPayBtn>
                                </PendingItem>
                            ))}
                        </PendingBanner>
                    )}

                    {/* Biodata */}
                    {tab === 'biodata' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Biodata Diri</SectionTitle>
                                <SectionSub>Informasi dasar akun Anda</SectionSub>
                            </SectionHeader>
                            <FieldList>
                                <FieldRow>
                                    <FieldLabel>Nama Lengkap</FieldLabel>
                                    <FieldValue>{user.full_name}</FieldValue>
                                </FieldRow>
                                <FieldRow>
                                    <FieldLabel>Email</FieldLabel>
                                    <FieldRight>
                                        <FieldValue>{user.email}</FieldValue>
                                        <VerifiedBadge>Terverifikasi</VerifiedBadge>
                                    </FieldRight>
                                </FieldRow>
                                <FieldRow>
                                    <FieldLabel>Role</FieldLabel>
                                    <FieldValue style={{ textTransform: 'capitalize' }}>{user.role}</FieldValue>
                                </FieldRow>
                                {user.customer_id && (
                                    <FieldRow>
                                        <FieldLabel>Customer ID</FieldLabel>
                                        <FieldValue>#{user.customer_id}</FieldValue>
                                    </FieldRow>
                                )}
                                <FieldRow last>
                                    <FieldLabel>Login via Google</FieldLabel>
                                    <FieldValue>{user.google_id ? 'Ya' : 'Tidak'}</FieldValue>
                                </FieldRow>
                            </FieldList>
                        </Section>
                    )}

                    {/* Alamat */}
                    {tab === 'alamat' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Alamat Pengiriman</SectionTitle>
                                <SectionSub>Kelola alamat pengiriman Anda</SectionSub>
                            </SectionHeader>
                            <div style={{ padding: '1.5rem 0' }}>
                                <AlamatBtn as={Link} to="/alamat-pengiriman">
                                    Kelola Alamat Pengiriman →
                                </AlamatBtn>
                            </div>
                        </Section>
                    )}

                    {/* Riwayat */}
                    {tab === 'riwayat' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Riwayat Belanja</SectionTitle>
                                <SectionSub>{invoices.length} transaksi tercatat</SectionSub>
                            </SectionHeader>
                            {invoiceLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <BounceLoader color="#c0392b" size={32} />
                                </div>
                            ) : invoices.length === 0 ? (
                                <EmptyState>
                                    <span style={{ fontSize: 40 }}>🛍️</span>
                                    <p>Belum ada riwayat belanja</p>
                                </EmptyState>
                            ) : (
                                <InvoiceList>
                                    {invoices.map((inv, i) => {
                                        const { text, color, bg } = paymentLabel(inv.payment_status);
                                        return (
                                            <InvoiceRow key={i} as={Link} to={`/invoice/${inv.order?._id}`}>
                                                <InvoiceLeft>
                                                    <InvIcon>🧾</InvIcon>
                                                    <div>
                                                        <InvOrder>Order #{inv.order?.order_number || '-'}</InvOrder>
                                                        <InvDate>{new Date(inv.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</InvDate>
                                                    </div>
                                                </InvoiceLeft>
                                                <InvoiceRight>
                                                    <InvTotal>{formatRupiah(inv.total)}</InvTotal>
                                                    <StatusChip style={{ color, backgroundColor: bg }}>{text}</StatusChip>
                                                </InvoiceRight>
                                            </InvoiceRow>
                                        );
                                    })}
                                </InvoiceList>
                            )}
                        </Section>
                    )}

                    {/* Keamanan */}
                    {tab === 'keamanan' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Keamanan</SectionTitle>
                                <SectionSub>{user.has_password ? 'Ganti password akun Anda' : 'Buat password agar bisa login tanpa Google'}</SectionSub>
                            </SectionHeader>
                            {!user.has_password && (
                                <InfoBox>
                                    Akun ini terdaftar via Google dan belum memiliki password.
                                    Buat password untuk bisa login dengan email &amp; password.
                                </InfoBox>
                            )}
                            <form onSubmit={handleSetPassword} style={{ maxWidth: 400 }}>
                                <FieldGroup>
                                    <FieldGroupLabel>Password Baru</FieldGroupLabel>
                                    <PwInput
                                        type="password"
                                        placeholder="Masukkan password baru"
                                        value={pwForm.password}
                                        onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))}
                                        required
                                    />
                                </FieldGroup>
                                <FieldGroup>
                                    <FieldGroupLabel>Konfirmasi Password</FieldGroupLabel>
                                    <PwInput
                                        type="password"
                                        placeholder="Ulangi password baru"
                                        value={pwForm.password_confirmation}
                                        onChange={e => setPwForm(p => ({ ...p, password_confirmation: e.target.value }))}
                                        required
                                    />
                                </FieldGroup>
                                {pwMsg && <PwMsg success={pwStatus === 'success'}>{pwMsg}</PwMsg>}
                                {pwStatus === 'loading' ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 1.5rem' }}>
                                        <BounceLoader color="#c0392b" size={28} />
                                    </div>
                                ) : (
                                    <SaveBtn type="submit">Simpan Password</SaveBtn>
                                )}
                            </form>
                        </Section>
                    )}

                    {/* Admin Panel */}
                    {tab === 'admin' && user.role === 'admin' && (
                        <Section>
                            <SectionHeader>
                                <SectionTitle>Admin Panel</SectionTitle>
                                <SectionSub>Kelola toko dari sini</SectionSub>
                            </SectionHeader>
                            <AdminGrid>
                                {ADMIN_MENUS.map(m => (
                                    <AdminCard key={m.to} as={Link} to={m.to}>
                                        <AdminCardIcon>{m.icon}</AdminCardIcon>
                                        <AdminCardBody>
                                            <AdminCardLabel>{m.label}</AdminCardLabel>
                                            <AdminCardDesc>{m.desc}</AdminCardDesc>
                                        </AdminCardBody>
                                        <AdminCardArrow>›</AdminCardArrow>
                                    </AdminCard>
                                ))}
                            </AdminGrid>
                        </Section>
                    )}
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
    maxWidth: '62rem',
    width: '100%',
    margin: '0 auto',
    padding: '1.5rem 1.25rem 2rem',
    boxSizing: 'border-box',
    '@media (max-width: 640px)': {
        flexDirection: 'column',
        padding: 0,
        gap: 0,
    },
});

/* ─── Mobile-only elements ────────────────────────────────────────────────── */

const MobileHeader = styled('div')({
    display: 'none',
    '@media (max-width: 640px)': {
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        gap: '1rem',
        background: '#c0392b',
        padding: '1.25rem 1rem 1.5rem',
        width: '100%',
    },
});

const MobileAvatar = styled('div')({
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.5)',
});

const MobileName = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: 2,
});

const MobileEmail = styled('div')({
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.8)',
});

const MobileTabBar = styled('div')({
    display: 'none',
    '@media (max-width: 640px)': {
        display: 'flex',
        flexShrink: 0,
        overflowX: 'auto',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        width: '100%',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
    },
});

const MobileTabItem = styled('div')(({ active, danger }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.75rem 1rem',
    flexShrink: 0,
    cursor: 'pointer',
    fontSize: '0.6875rem',
    fontWeight: active ? 700 : 500,
    color: danger ? '#e74c3c' : active ? '#c0392b' : '#666',
    borderBottom: active ? '2px solid #c0392b' : '2px solid transparent',
    '& span:first-of-type': { fontSize: 18 },
}));

const SavingBar = styled('div')({
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    borderRadius: '2rem',
    padding: '0.5rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    zIndex: 999,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
});

/* ─── Sidebar (desktop only) ─────────────────────────────────────────────── */

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
    '@media (max-width: 640px)': { display: 'none' },
});

const SidebarTop = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.75rem 1rem 1.25rem',
    borderBottom: '1px solid #f5f5f5',
});

const AvatarCircle = styled('div')({
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: '#c0392b',
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    boxShadow: '0 4px 12px rgba(192,57,43,0.28)',
});

const SidebarName = styled('div')({
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: 2,
    textAlign: 'center',
});

const SidebarEmail = styled('div')({
    fontSize: '0.75rem',
    color: '#999',
    marginBottom: '0.5rem',
    textAlign: 'center',
    wordBreak: 'break-all',
});

const CustomerBadge = styled('div')({
    fontSize: 11,
    color: '#aaa',
    background: '#f5f5f5',
    borderRadius: 999,
    padding: '2px 10px',
});

const NavList = styled('div')({
    padding: '0.5rem 0',
});

const NavItem = styled('div')(({ active, danger }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.75rem 1.25rem',
    cursor: 'pointer',
    borderLeft: active ? '3px solid #c0392b' : '3px solid transparent',
    background: active ? '#fff5f5' : 'transparent',
    transition: 'background 0.12s',
    textDecoration: 'none',
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
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '2rem',
    '@media (max-width: 640px)': {
        width: '100%',
        padding: '0.75rem',
        paddingBottom: '1.5rem',
    },
});

const Section = styled('div')({
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    overflow: 'hidden',
});

const SectionHeader = styled('div')({
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f5f5f5',
});

const SectionTitle = styled('h2')({
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 2px',
});

const SectionSub = styled('p')({
    fontSize: '0.8125rem',
    color: '#999',
    margin: 0,
});

/* ─── Biodata fields ──────────────────────────────────────────────────────── */

const FieldList = styled('div')({ padding: '0 1.5rem' });

const FieldRow = styled('div')(({ last }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: last ? 'none' : '1px solid #f5f5f5',
    flexWrap: 'wrap',
    gap: '0.5rem',
}));

const FieldLabel = styled('span')({
    fontSize: '0.875rem',
    color: '#888',
    flexShrink: 0,
});

const FieldRight = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
});

const FieldValue = styled('span')({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#111',
});

const VerifiedBadge = styled('span')({
    fontSize: 11,
    fontWeight: 600,
    color: '#27ae60',
    background: '#e8f8f0',
    borderRadius: 999,
    padding: '2px 8px',
});

/* ─── Alamat ──────────────────────────────────────────────────────────────── */

const AlamatBtn = styled('div')({
    display: 'inline-flex',
    alignItems: 'center',
    background: '#c0392b',
    color: '#fff',
    borderRadius: '0.5rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    marginLeft: '1.5rem',
    '&:hover': { background: '#a93226' },
});

/* ─── Riwayat ─────────────────────────────────────────────────────────────── */

const InvoiceList = styled('div')({ padding: '0 1.5rem' });

const InvoiceRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 0',
    borderBottom: '1px solid #f5f5f5',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#fafafa', marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 },
});

const InvoiceLeft = styled('div')({ display: 'flex', alignItems: 'center', gap: '0.75rem' });
const InvIcon = styled('span')({ fontSize: 22, flexShrink: 0 });
const InvOrder = styled('div')({ fontSize: '0.875rem', fontWeight: 600, color: '#111' });
const InvDate = styled('div')({ fontSize: '0.75rem', color: '#aaa', marginTop: 2 });
const InvoiceRight = styled('div')({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 });
const InvTotal = styled('div')({ fontSize: '0.875rem', fontWeight: 700, color: '#c0392b' });
const StatusChip = styled('span')({ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999 });

const EmptyState = styled('div')({
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '3rem 0', color: '#ccc', gap: 8,
    '& p': { margin: 0, fontSize: 14 },
});

/* ─── Keamanan ────────────────────────────────────────────────────────────── */

const InfoBox = styled('div')({
    margin: '1.25rem 1.5rem 0',
    background: '#fff8e1',
    border: '1px solid #f0c040',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.8125rem',
    color: '#7d5a00',
    lineHeight: 1.6,
});

const FieldGroup = styled('div')({
    margin: '1.25rem 1.5rem 0',
    '@media (max-width: 640px)': { margin: '1rem 1rem 0' },
});
const FieldGroupLabel = styled('label')({ fontSize: '0.8125rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.375rem' });

const PwInput = styled('input')({
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': { borderColor: '#c0392b', boxShadow: '0 0 0 2px rgba(192,57,43,0.1)' },
});

const PwMsg = styled('p')(({ success }) => ({
    fontSize: 13,
    color: success ? '#27ae60' : '#c0392b',
    margin: '0.75rem 1.5rem 0',
}));

const SaveBtn = styled('button')(({ disabled }) => ({
    display: 'block',
    margin: '1rem 1.5rem 1.5rem',
    '@media (max-width: 640px)': { margin: '0.75rem 1rem 1.25rem' },
    background: disabled ? '#e0e0e0' : '#c0392b',
    color: disabled ? '#aaa' : '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.75rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    '&:hover': { background: disabled ? '#e0e0e0' : '#a93226' },
}));

/* ─── Pending payment banner ─────────────────────────────────────────────── */

const PendingBanner = styled('div')({
    background: '#fff9f0',
    border: '1px solid #f5cba7',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    marginBottom: '1rem',
});

const PendingBannerHead = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.75rem 1.25rem',
    background: '#fff3e0',
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': { background: '#ffe9c8' },
});

const PendingChevron = styled('span')(({ expanded }) => ({
    marginLeft: 'auto',
    fontSize: '1.125rem',
    color: '#e67e22',
    fontWeight: 700,
    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
    display: 'inline-block',
    lineHeight: 1,
}));

const PendingBannerIcon = styled('span')({
    fontSize: 18,
    flexShrink: 0,
});

const PendingBannerTitle = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#c0392b',
});

const PendingItem = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #fde8cc',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.12s',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#fff3e0' },
});

const PendingItemInfo = styled('div')({});

const PendingItemOrder = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: 2,
});

const PendingItemTotal = styled('div')({
    fontSize: '0.8125rem',
    color: '#e67e22',
    fontWeight: 700,
});

const PendingPayBtn = styled('div')({
    background: '#c0392b',
    color: '#fff',
    borderRadius: '0.5rem',
    padding: '0.4375rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap',
});

/* ─── Admin order banner ─────────────────────────────────────────────────── */

const AdminOrderBanner = styled('div')({
    background: '#ebf5fb',
    border: '1px solid #aed6f1',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    marginBottom: '1rem',
});

const AdminBannerHead = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.75rem 1.25rem',
    background: '#d6eaf8',
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': { background: '#c5e0f5' },
});

const AdminBannerIcon = styled('span')({
    fontSize: 18,
    flexShrink: 0,
});

const AdminBannerTitle = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1a5276',
});

const AdminOrderItem = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #aed6f1',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.12s',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#d6eaf8' },
});

const AdminOrderInfo = styled('div')({});

const AdminOrderNum = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1a5276',
    marginBottom: 2,
});

const AdminOrderMeta = styled('div')({
    fontSize: '0.8125rem',
    color: '#5d8aa8',
});

const AdminProcessBtn = styled('div')({
    background: '#2980b9',
    color: '#fff',
    borderRadius: '0.5rem',
    padding: '0.4375rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap',
});

/* ─── Admin Panel ─────────────────────────────────────────────────────────── */

const AdminGrid = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem 0',
});

const AdminCard = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 1.5rem',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background 0.12s',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#fff5f5' },
});

const AdminCardIcon = styled('div')({
    width: 44,
    height: 44,
    borderRadius: '0.75rem',
    background: '#fff5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
});

const AdminCardBody = styled('div')({ flex: 1, minWidth: 0 });
const AdminCardLabel = styled('div')({ fontSize: '0.875rem', fontWeight: 700, color: '#111' });
const AdminCardDesc = styled('div')({ fontSize: '0.75rem', color: '#999', marginTop: 2 });
const AdminCardArrow = styled('div')({ fontSize: '1.25rem', color: '#ccc', flexShrink: 0 });
