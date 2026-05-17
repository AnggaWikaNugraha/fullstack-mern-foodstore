import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { LayoutSidebar } from 'upkit';
import styled from '@emotion/styled';
import FaMapMarkerAlt from '@meronex/icons/fa/FaMapMarkerAlt';
import FaShoppingBag from '@meronex/icons/fa/FaShoppingBag';
import FaSignOutAlt from '@meronex/icons/fa/FaSignOutAlt';
import FaShieldAlt from '@meronex/icons/fa/FaShieldAlt';
import FaReceipt from '@meronex/icons/fa/FaReceipt';
import FaHeart from '@meronex/icons/fa/FaHeart';
import BounceLoader from 'react-spinners/BounceLoader';
import AppSidebar from '../../component/AppSidebar';
import { getInvoices } from '../../api/invoice';
import { formatRupiah } from '../../utils/format-rupiah';

export default function Account() {
    const auth = useSelector(state => state.auth);
    const history = useHistory();
    const user = auth?.user;

    const [invoices, setInvoices] = React.useState([]);
    const [invoiceLoading, setInvoiceLoading] = React.useState(false);

    React.useEffect(() => {
        if (!user) return;
        setInvoiceLoading(true);
        getInvoices({ limit: 10 })
            .then(res => setInvoices(res.data.data || []))
            .catch(() => {})
            .finally(() => setInvoiceLoading(false));
    }, [user]);

    if (!user) {
        history.push('/login');
        return null;
    }

    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <LayoutSidebar
            sidebar={<AppSidebar />}
            sidebarSize={80}
            content={
                <Page>
                    <ProfileCard>
                        <Avatar>{initials}</Avatar>
                        <Name>{user.full_name}</Name>
                        <Email>{user.email}</Email>
                        {user.role === 'admin' && (
                            <RoleBadge>
                                <FaShieldAlt style={{ marginRight: 6 }} />
                                Admin
                            </RoleBadge>
                        )}
                        {user.customer_id && (
                            <CustomerId>Customer #{user.customer_id}</CustomerId>
                        )}
                    </ProfileCard>

                    <MenuGrid>
                        <MenuCard as={Link} to="/alamat-pengiriman">
                            <MenuIcon color="#3498db"><FaMapMarkerAlt /></MenuIcon>
                            <MenuLabel>Alamat Pengiriman</MenuLabel>
                            <MenuDesc>Kelola alamat pengiriman</MenuDesc>
                        </MenuCard>

                        <MenuCard as={Link} to="/">
                            <MenuIcon color="#27ae60"><FaShoppingBag /></MenuIcon>
                            <MenuLabel>Belanja</MenuLabel>
                            <MenuDesc>Kembali ke halaman utama</MenuDesc>
                        </MenuCard>

                        <MenuCard as={Link} to="/wishlist">
                            <MenuIcon color="#e74c3c"><FaHeart /></MenuIcon>
                            <MenuLabel>Wishlist</MenuLabel>
                            <MenuDesc>Produk favoritmu</MenuDesc>
                        </MenuCard>

                        <MenuCard as="div" onClick={() => document.getElementById('history-section').scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                            <MenuIcon color="#e67e22"><FaReceipt /></MenuIcon>
                            <MenuLabel>Riwayat Belanja</MenuLabel>
                            <MenuDesc>{invoices.length} transaksi tercatat</MenuDesc>
                        </MenuCard>

                        {user.role === 'admin' && (
                            <MenuCard as={Link} to="/admin/product">
                                <MenuIcon color="#8e44ad"><FaShieldAlt /></MenuIcon>
                                <MenuLabel>Admin Panel</MenuLabel>
                                <MenuDesc>Kelola produk, kategori & tag</MenuDesc>
                            </MenuCard>
                        )}

                        <MenuCard onClick={() => history.push('/logout')} style={{ cursor: 'pointer' }}>
                            <MenuIcon color="#e74c3c"><FaSignOutAlt /></MenuIcon>
                            <MenuLabel>Logout</MenuLabel>
                            <MenuDesc>Keluar dari akun</MenuDesc>
                        </MenuCard>
                    </MenuGrid>

                    <InfoSection>
                        <InfoTitle>Informasi Akun</InfoTitle>
                        <InfoRow>
                            <InfoLabel>Nama Lengkap</InfoLabel>
                            <InfoValue>{user.full_name}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Email</InfoLabel>
                            <InfoValue>{user.email}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Role</InfoLabel>
                            <InfoValue style={{ textTransform: 'capitalize' }}>{user.role}</InfoValue>
                        </InfoRow>
                        {user.customer_id && (
                            <InfoRow>
                                <InfoLabel>Customer ID</InfoLabel>
                                <InfoValue>#{user.customer_id}</InfoValue>
                            </InfoRow>
                        )}
                    </InfoSection>

                    <HistorySection id="history-section">
                        <InfoTitle>Riwayat Belanja</InfoTitle>
                        {invoiceLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                                <BounceLoader color="#c0392b" size={32} />
                            </div>
                        ) : invoices.length === 0 ? (
                            <EmptyHistory>
                                <span style={{ fontSize: 36 }}>🛍️</span>
                                <p>Belum ada riwayat belanja</p>
                            </EmptyHistory>
                        ) : (
                            invoices.map((inv, i) => (
                                <HistoryRow key={i} to={`/invoice/${inv.order?._id}`} as={Link}>
                                    <HistoryLeft>
                                        <HistoryOrder>Order #{inv.order?.order_number || '-'}</HistoryOrder>
                                        <HistoryDate>{new Date(inv.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</HistoryDate>
                                    </HistoryLeft>
                                    <HistoryRight>
                                        <HistoryTotal>{formatRupiah(inv.total)}</HistoryTotal>
                                        <StatusChip status={inv.payment_status}>
                                            {['paid', 'settlement', 'capture'].includes(inv.payment_status)
                                                ? 'Lunas'
                                                : inv.payment_status === 'pending'
                                                ? 'Menunggu'
                                                : ['deny', 'cancel', 'expire', 'failed'].includes(inv.payment_status)
                                                ? 'Gagal'
                                                : 'Belum Bayar'}
                                        </StatusChip>
                                    </HistoryRight>
                                </HistoryRow>
                            ))
                        )}
                    </HistorySection>
                </Page>
            }
        />
    );
}

const Page = styled('div')({
    maxWidth: 640,
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
});

const ProfileCard = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '36px 24px',
    marginBottom: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
});

const Avatar = styled('div')({
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: '#c0392b',
    color: 'white',
    fontSize: 28,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0 4px 12px rgba(192,57,43,0.3)',
});

const Name = styled('h2')({
    fontSize: 20,
    fontWeight: 700,
    color: '#222',
    margin: '0 0 4px',
});

const Email = styled('p')({
    fontSize: 14,
    color: '#888',
    margin: '0 0 10px',
});

const RoleBadge = styled('span')({
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#8e44ad',
    color: 'white',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 999,
    marginBottom: 8,
});

const CustomerId = styled('span')({
    fontSize: 12,
    color: '#aaa',
    backgroundColor: '#f5f5f5',
    padding: '3px 10px',
    borderRadius: 999,
});

const MenuGrid = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 24,
});

const MenuCard = styled('div')({
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '20px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
    },
});

const MenuIcon = styled('div')(props => ({
    fontSize: 24,
    color: props.color || '#333',
    marginBottom: 10,
}));

const MenuLabel = styled('p')({
    fontSize: 14,
    fontWeight: 700,
    color: '#222',
    margin: '0 0 4px',
});

const MenuDesc = styled('p')({
    fontSize: 12,
    color: '#aaa',
    margin: 0,
});

const InfoSection = styled('div')({
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
});

const InfoTitle = styled('h3')({
    fontSize: 14,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: '0 0 16px',
});

const InfoRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f5f5f5',
    '&:last-child': { borderBottom: 'none' },
});

const InfoLabel = styled('span')({
    fontSize: 14,
    color: '#888',
});

const InfoValue = styled('span')({
    fontSize: 14,
    fontWeight: 600,
    color: '#222',
});

const HistorySection = styled('div')({
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginTop: 24,
});

const HistoryRow = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f5f5f5',
    textDecoration: 'none',
    color: 'inherit',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { backgroundColor: '#fafafa' },
});

const HistoryLeft = styled('div')({});

const HistoryOrder = styled('p')({
    fontSize: 14,
    fontWeight: 600,
    color: '#222',
    margin: '0 0 2px',
});

const HistoryDate = styled('p')({
    fontSize: 12,
    color: '#aaa',
    margin: 0,
});

const HistoryRight = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
});

const HistoryTotal = styled('span')({
    fontSize: 14,
    fontWeight: 700,
    color: '#c0392b',
});

const StatusChip = styled('span')(props => ({
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: ['paid', 'settlement', 'capture'].includes(props.status)
        ? '#e8f8f0'
        : props.status === 'pending'
        ? '#fff8e1'
        : '#fff5f5',
    color: ['paid', 'settlement', 'capture'].includes(props.status)
        ? '#27ae60'
        : props.status === 'pending'
        ? '#e67e22'
        : '#e74c3c',
}));

const EmptyHistory = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 0',
    color: '#ccc',
    gap: 8,
    '& p': { margin: 0, fontSize: 14 },
});
