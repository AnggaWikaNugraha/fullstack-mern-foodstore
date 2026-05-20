import { Link, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

const SIDEBAR_TABS = [
    { key: 'biodata',  label: 'Biodata Diri',     icon: '👤', to: '/account?tab=biodata'  },
    { key: 'alamat',   label: 'Alamat Pengiriman', icon: '📍', to: '/alamat-pengiriman'    },
    { key: 'riwayat',  label: 'Riwayat Belanja',   icon: '🧾', to: '/account?tab=riwayat'  },
    { key: 'keamanan', label: 'Keamanan',           icon: '🔐', to: '/account?tab=keamanan' },
];

export default function AccountLayout({ children, activeTab = 'biodata' }) {
    const auth    = useSelector(state => state.auth);
    const user    = auth?.user;
    const history = useHistory();

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <PageBg>
            <PageInner>

                {/* ── MOBILE: profile header ── */}
                <MobileHeader>
                    <MobileAvatar>{initials}</MobileAvatar>
                    <div>
                        <MobileName>{user?.full_name}</MobileName>
                        <MobileEmail>{user?.email}</MobileEmail>
                    </div>
                </MobileHeader>

                {/* ── MOBILE: tab bar ── */}
                <MobileTabBar>
                    {SIDEBAR_TABS.map(t => (
                        <MobileTabItem key={t.key} active={activeTab === t.key ? 1 : 0} as={Link} to={t.to}>
                            <span>{t.icon}</span>
                            <span>{t.label}</span>
                        </MobileTabItem>
                    ))}
                    {user?.role === 'admin' && (
                        <MobileTabItem as={Link} to="/account?tab=admin">
                            <span>🛡️</span>
                            <span>Admin</span>
                        </MobileTabItem>
                    )}
                    <MobileTabItem as={Link} to="/logout" danger={1}>
                        <span>🚪</span>
                        <span>Logout</span>
                    </MobileTabItem>
                </MobileTabBar>

                {/* ── LEFT SIDEBAR ── */}
                <Sidebar>
                    <SidebarTop>
                        <AvatarCircle>{initials}</AvatarCircle>
                        <SidebarName>{user?.full_name}</SidebarName>
                        <SidebarEmail>{user?.email}</SidebarEmail>
                        {user?.customer_id && (
                            <CustomerBadge>Customer #{user.customer_id}</CustomerBadge>
                        )}
                    </SidebarTop>

                    <NavList>
                        {SIDEBAR_TABS.map(t => (
                            <NavItem key={t.key} as={Link} to={t.to} active={activeTab === t.key ? 1 : 0} style={{ textDecoration: 'none' }}>
                                <NavIcon>{t.icon}</NavIcon>
                                <NavLabel active={activeTab === t.key ? 1 : 0}>{t.label}</NavLabel>
                            </NavItem>
                        ))}
                        {user?.role === 'admin' && (
                            <NavItem as={Link} to="/account?tab=admin" style={{ textDecoration: 'none' }}>
                                <NavIcon>🛡️</NavIcon>
                                <NavLabel>Admin Panel</NavLabel>
                            </NavItem>
                        )}
                        <Divider />
                        <NavItem as={Link} to="/" style={{ textDecoration: 'none' }}>
                            <NavIcon>🛒</NavIcon>
                            <NavLabel>Belanja</NavLabel>
                        </NavItem>
                        <NavItem onClick={() => history.push('/logout')} danger={1}>
                            <NavIcon>🚪</NavIcon>
                            <NavLabel danger={1}>Logout</NavLabel>
                        </NavItem>
                    </NavList>
                </Sidebar>

                {/* ── RIGHT CONTENT ── */}
                <Content>{children}</Content>

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
        // tetap flex column + overflow hidden agar MobileHeader/TabBar bisa fixed
    },
});

/* ─── Mobile ──────────────────────────────────────────────────────────────── */

const MobileHeader = styled('div')({
    display: 'none',
    '@media (max-width: 640px)': {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: '#c0392b',
        padding: '1.25rem 1rem 1.5rem',
        width: '100%',
        flexShrink: 0,
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
        overflowX: 'auto',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        width: '100%',
        flexShrink: 0,
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
    textDecoration: 'none',
    '& span:first-of-type': { fontSize: 18 },
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

const NavList = styled('div')({ padding: '0.5rem 0' });

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
