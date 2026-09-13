import React from 'react';

export default function AddressDetails({ address }) {
    if (!address) return null;
    return <div className="checkout-address-detail"><strong>{address.nama}</strong><p>{address.detail}</p><p>{[address.kelurahan, address.kecamatan, address.kabupaten, address.provinsi].filter(Boolean).join(', ')}</p></div>;
}
