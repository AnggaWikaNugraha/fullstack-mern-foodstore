import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import BounceLoader from 'react-spinners/BounceLoader';
import AccountLayout from '../../component/AccountLayout';
import { useAddressData } from '../../hooks/address';

export default function UserAddress() {
    const location      = useLocation();
    const searchParams  = new URLSearchParams(location.search);
    const isFromCheckout = searchParams.get('from') === 'checkout';

    const { data, limit, page, status, count, setPage } = useAddressData();

    const addTo = isFromCheckout
        ? '/alamat-pengiriman/tambah?from=checkout&step=2'
        : '/alamat-pengiriman/tambah';

    return (
        <AccountLayout activeTab="alamat">
            <Section>
                <SectionHeader>
                    <div>
                        <SectionTitle>Alamat Pengiriman</SectionTitle>
                        <SectionSub>Kelola alamat pengiriman Anda</SectionSub>
                    </div>
                    <AddBtn as={Link} to={addTo}>+ Tambah Alamat</AddBtn>
                </SectionHeader>

                {isFromCheckout && (
                    <BackBar>
                        <BackLink as={Link} to="/checkout?step=2">← Kembali ke Checkout</BackLink>
                    </BackBar>
                )}

                {status === 'process' ? (
                    <LoadWrap>
                        <BounceLoader color="#c0392b" size={32} />
                    </LoadWrap>
                ) : data.length === 0 ? (
                    <EmptyState>
                        <span>📍</span>
                        <p>Belum ada alamat pengiriman</p>
                        <small>Tambah alamat untuk melanjutkan checkout</small>
                        <AddBtn as={Link} to={addTo} style={{ marginTop: '1rem' }}>+ Tambah Alamat</AddBtn>
                    </EmptyState>
                ) : (
                    <AddressList>
                        {data.map((alamat, i) => (
                            <AddressCard key={alamat._id || i}>
                                <CardLeft>
                                    <PinIcon>📍</PinIcon>
                                </CardLeft>
                                <CardBody>
                                    <CardName>{alamat.nama}</CardName>
                                    <CardDetail>
                                        {[alamat.kelurahan, alamat.kecamatan, alamat.kabupaten, alamat.provinsi]
                                            .filter(Boolean).join(', ')}
                                    </CardDetail>
                                    {alamat.detail && <CardDetailFull>{alamat.detail}</CardDetailFull>}
                                </CardBody>
                                {isFromCheckout && (
                                    <SelectBtn as={Link} to={`/checkout?step=2&address=${alamat._id}`}>
                                        Pilih
                                    </SelectBtn>
                                )}
                            </AddressCard>
                        ))}

                        {/* Pagination */}
                        {count > limit && (
                            <Pagination>
                                {Array.from({ length: Math.ceil(count / limit) }, (_, i) => i + 1).map(p => (
                                    <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>
                                        {p}
                                    </PageBtn>
                                ))}
                            </Pagination>
                        )}
                    </AddressList>
                )}
            </Section>
        </AccountLayout>
    );
}

const Section = styled('div')({
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    overflow: 'hidden',
});

const SectionHeader = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f5f5f5',
    gap: '1rem',
    flexWrap: 'wrap',
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

const AddBtn = styled('div')({
    display: 'inline-flex',
    alignItems: 'center',
    background: '#c0392b',
    color: '#fff',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    '&:hover': { background: '#a93226' },
});

const BackBar = styled('div')({
    padding: '0.75rem 1.5rem',
    borderBottom: '1px solid #f5f5f5',
    background: '#fffbf0',
});

const BackLink = styled('div')({
    fontSize: '0.8125rem',
    color: '#e67e22',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': { textDecoration: 'underline' },
});

const LoadWrap = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem 0',
});

const EmptyState = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 1rem',
    gap: '0.375rem',
    '& span': { fontSize: 40 },
    '& p': { fontSize: '0.9375rem', fontWeight: 600, color: '#bbb', margin: 0 },
    '& small': { fontSize: '0.8125rem', color: '#ccc' },
});

const AddressList = styled('div')({ padding: '0.5rem 0' });

const AddressCard = styled('div')({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.875rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #f5f5f5',
    '&:last-child': { borderBottom: 'none' },
});

const CardLeft = styled('div')({ paddingTop: 2 });
const PinIcon = styled('span')({ fontSize: 20 });

const CardBody = styled('div')({ flex: 1, minWidth: 0 });

const CardName = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: 3,
});

const CardDetail = styled('div')({
    fontSize: '0.8125rem',
    color: '#666',
    lineHeight: 1.5,
});

const CardDetailFull = styled('div')({
    fontSize: '0.75rem',
    color: '#aaa',
    marginTop: 2,
});

const SelectBtn = styled('div')({
    background: '#c0392b',
    color: '#fff',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    alignSelf: 'center',
    '&:hover': { background: '#a93226' },
});

const Pagination = styled('div')({
    display: 'flex',
    gap: 6,
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f5f5f5',
});

const PageBtn = styled('button')(({ active }) => ({
    width: 32,
    height: 32,
    borderRadius: 6,
    border: `1px solid ${active ? '#c0392b' : '#e0e0e0'}`,
    background: active ? '#c0392b' : '#fff',
    color: active ? '#fff' : '#555',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
}));
