import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAddress } from '../../../api/address';

const limit = 4;

export default function useCheckoutAddress() {
    const { search } = useLocation();
    const requestedId = new URLSearchParams(search).get('address');
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [status, setStatus] = useState('loading');
    const [attempt, setAttempt] = useState(0);
    const [lookupPending, setLookupPending] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const chosenManually = useRef(false);

    useEffect(() => {
        let active = true;
        setStatus('loading');
        getAddress({ page, limit }).then(({ data }) => {
            if (data?.error || !Array.isArray(data?.data)) throw new Error('Invalid addresses');
            if (!active) return;
            setAddresses(data.data);
            setCount(Number(data.count) || data.data.length);
            setStatus('success');
        }).catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, [page, attempt]);

    useEffect(() => {
        let active = true;
        chosenManually.current = false;
        setLookupError('');
        if (!requestedId) { setLookupPending(false); return; }
        setLookupPending(true);
        getAddress({ page: 1, limit: 1, id: requestedId }).then(({ data }) => {
            if (data?.error || !Array.isArray(data?.data)) throw new Error('Invalid address');
            const found = data.data.find((address) => address._id === requestedId);
            if (!active || chosenManually.current) return;
            if (found) setSelectedAddress(found);
            else setLookupError('Alamat sebelumnya tidak ditemukan. Silakan pilih alamat lain.');
        }).catch(() => {
            if (active && !chosenManually.current) setLookupError('Alamat sebelumnya belum bisa dimuat. Silakan pilih alamat di bawah.');
        }).finally(() => { if (active) setLookupPending(false); });
        return () => { active = false; };
    }, [requestedId]);

    const pageCount = Math.max(1, Math.ceil(count / limit));
    return {
        addresses, selectedAddress, page, pageCount, count, status, lookupPending, lookupError,
        ready: status === 'success' && !!selectedAddress && !lookupPending,
        selectAddress: (address) => {
            chosenManually.current = true;
            setSelectedAddress(address);
            setLookupError('');
            setLookupPending(false);
        },
        previousPage: () => setPage((current) => Math.max(1, current - 1)),
        nextPage: () => setPage((current) => Math.min(pageCount, current + 1)),
        retry: () => setAttempt((value) => value + 1),
        addAddressTo: '/alamat-pengiriman/tambah?from=checkout&step=2',
    };
}
