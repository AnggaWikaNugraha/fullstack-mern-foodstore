import * as React from 'react';

import { getAddress } from '../api/address';

const statuslist = {
    idle: 'idle',
    process: 'process',
    success: 'success',
    error: 'error'
}

export function useAddressData() {

    let [data, setData] = React.useState([]);
    let [count, setCount] = React.useState(0);
    let [status, setStatus] = React.useState(statuslist.idle);
    let [page, setPage] = React.useState(1);
    let [limit, setLimit] = React.useState(10);

    // (1) bungkus di dalam React.useCallback
    let fetchAddress = React.useCallback(async function () {

        setStatus(statuslist.process);

        let { data: { data, count, error } } = await getAddress({ page, limit });

        if (error) {

            setStatus(statuslist.error);
            return

        }

        setStatus(statuslist.success);
        setData(data);
        setCount(count);

    }, [page, limit]); // `page` dan `limit` sebagai `deps`

    // (2) panggil `fetchAddress`, sudah aman untuk disave.
    React.useEffect(() => {

        fetchAddress();

    }, [fetchAddress]);

    // (1) mengembalikan lokal _state_ dan beberapa fungsi udpater 
    return {
        data,
        count,
        status,
        page,
        limit,
        setPage,
        setLimit
    }

}