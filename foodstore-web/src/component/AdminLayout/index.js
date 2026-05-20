import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

const ADMIN_NAV = [
    { label: 'Dashboard',  icon: '📊', to: '/admin/dashboard'  },
    { label: 'Produk',     icon: '🍱', to: '/admin/product'    },
    { label: 'Kategori',   icon: '🗂️', to: '/admin/categories' },
    { label: 'Tag',        icon: '🏷️', to: '/admin/tag'        },
    { label: 'Pesanan',    icon: '📦', to: '/admin/orders'     },
];

export default function AdminLayout({ children, title, subtitle }) {
    const auth     = useSelector(state => state.auth);
    const user     = auth?.user;
    const location = useLocation();

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'A';

    return (
        <PageBg>
            <PageInner>

                {/* ── MOBILE top bar ── */}
                <MobileTopBar>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>⚙️ Admin Panel</span>
                    <MobileNavScroll>
                        {ADMIN_NAV.map(n => (
                            <MobileNavItem key={n.to} as={Link} to={n.to} active={location.pathname === n.to ? 1 : 0}>
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
                        <NavItem key={n.to} as={Link} to={n.to} active={location.pathname === n.to ? 1 : 0}>
                            <NavIcon>{n.icon}</NavIcon>
                            <NavLabel active={location.pathname === n.to ? 1 : 0}>{n.label}</NavLabel>
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
                    <NavItem as={Link} to="/logout" danger={1} style={{ textDecoration: 'none' }}>
                        <NavIcon>🚪</NavIcon>
                        <NavLabel danger={1}>Logout</NavLabel>
                    </NavItem>
                </Sidebar>

                {/* ── MAIN CONTENT ── */}
                <Content>
                    {(title || subtitle) && (
                        <PageHeader>
                            {title && <PageTitle>{title}</PageTitle>}
                            {subtitle && <PageSub>{subtitle}</PageSub>}
                        </PageHeader>
                    )}
                    {children}
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
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '2rem',
    '@media (max-width: 768px)': {
        width: '100%',
        padding: '0.75rem',
        paddingBottom: '1.5rem',
    },
});

const PageHeader = styled('div')({
    marginBottom: '1.25rem',
    paddingTop: '0.125rem',
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
