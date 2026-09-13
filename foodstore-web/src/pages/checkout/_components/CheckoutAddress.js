import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from '../../../component/StoreIcon';
import AddressDetails from './AddressDetails';

export default function CheckoutAddress({ addresses, selectedAddress, page, pageCount, status, lookupPending, lookupError, selectAddress, previousPage, nextPage, retry, addAddressTo, isBusy }) {
    return (
        <section className="checkout-card" aria-labelledby="checkout-address-title">
            <div className="checkout-card-heading"><div><h2 id="checkout-address-title">Mau diantar ke mana?</h2><p>Pilih alamat untuk pesanan kali ini.</p></div><Link className="checkout-text-link" to={addAddressTo}><StoreIcon name="plus" size={15} /> Tambah alamat</Link></div>
            {lookupError && <p className="checkout-error" role="alert">{lookupError}</p>}
            {lookupPending && <p className="checkout-note" role="status">Memuat alamat pilihanmu...</p>}
            {status === 'loading' ? <div className="checkout-state-inline" role="status"><span className="checkout-spinner" /><p>Memuat alamat pengiriman...</p></div> : status === 'error' ? (
                <div className="checkout-state-inline" role="alert"><p>Alamat belum bisa dimuat.</p><button className="checkout-secondary" onClick={retry}>Coba lagi</button></div>
            ) : !addresses.length ? (
                <div className="checkout-state-inline"><span className="checkout-state-icon"><StoreIcon name="pin" size={30} /></span><h3>Belum ada alamat pengiriman</h3><p>Tambahkan alamat agar pesananmu sampai ke tempat yang tepat.</p><Link className="checkout-secondary" to={addAddressTo}>Tambah alamat pertama</Link></div>
            ) : (
                <>
                    <fieldset className="checkout-addresses" disabled={isBusy}><legend className="checkout-visually-hidden">Alamat pengiriman</legend>
                        {addresses.map((address) => <label className={`checkout-address-option ${selectedAddress?._id === address._id ? 'is-selected' : ''}`} key={address._id}>
                            <input type="radio" name="checkout-address" value={address._id} checked={selectedAddress?._id === address._id} onChange={() => selectAddress(address)} aria-label={address.nama} />
                            <AddressDetails address={address} />
                            {selectedAddress?._id === address._id && <StoreIcon name="check" size={18} />}
                        </label>)}
                    </fieldset>
                    {pageCount > 1 && <nav className="checkout-pagination" aria-label="Halaman alamat"><button onClick={previousPage} disabled={page <= 1 || isBusy} aria-label="Halaman alamat sebelumnya"><StoreIcon name="arrow" className="checkout-arrow-back" size={16} /></button><span>Halaman {page} dari {pageCount}</span><button onClick={nextPage} disabled={page >= pageCount || isBusy} aria-label="Halaman alamat berikutnya"><StoreIcon name="arrow" size={16} /></button></nav>}
                </>
            )}
        </section>
    );
}
