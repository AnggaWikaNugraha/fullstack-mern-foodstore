import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getPusher } from '../../pusher';
import { formatRupiah } from '../../utils/format-rupiah';

const AUTO_DISMISS_MS = 8000;

export default function SocketNotification() {
    const auth = useSelector(state => state.auth);
    const isAdmin = auth?.user?.role === 'admin';
    const history = useHistory();
    const [paymentToasts, setPaymentToasts] = useState([]);
    const [stockToasts, setStockToasts]     = useState([]);

    useEffect(() => {
        if (!auth?.token || !isAdmin) return;

        const pusher = getPusher(auth.token);
        const channel = pusher.subscribe('private-admin');

        channel.bind('pusher:subscription_succeeded', () => {
            console.log('[Pusher] subscribed to private-admin');
        });

        channel.bind('pusher:subscription_error', (err) => {
            console.error('[Pusher] subscription error:', err);
        });

        channel.bind('payment:settlement', (data) => {
            const id = Date.now();
            setPaymentToasts(prev => [...prev, { id, data }]);
        });

        channel.bind('product:low_stock', (data) => {
            const id = Date.now();
            setStockToasts(prev => [...prev, { id, data }]);
            // auto-dismiss after 8s
            setTimeout(() => {
                setStockToasts(prev => prev.filter(t => t.id !== id));
            }, AUTO_DISMISS_MS);
        });

        return () => {
            channel.unbind('payment:settlement');
            channel.unbind('product:low_stock');
            pusher.unsubscribe('private-admin');
        };
    }, [auth?.token, isAdmin]);

    const dismissPayment  = (id) => setPaymentToasts(prev => prev.filter(t => t.id !== id));
    const dismissAllPayment = () => setPaymentToasts([]);
    const dismissStock    = (id) => setStockToasts(prev => prev.filter(t => t.id !== id));
    const dismissAllStock = () => setStockToasts([]);

    if (!paymentToasts.length && !stockToasts.length) return null;

    return (
        <div style={{ position: 'fixed', top: 72, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Low Stock Panel */}
            {stockToasts.length > 0 && (
                <div style={{
                    width: 300,
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    animation: 'slideIn 0.3s ease',
                }}>
                    <div style={{
                        background: '#e67e22',
                        color: '#fff',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>
                            ⚠ Stok Hampir Habis ({stockToasts.length})
                        </span>
                        <button
                            onClick={dismissAllStock}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}
                        >
                            Hapus semua
                        </button>
                    </div>

                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {stockToasts.map(({ id, data }, index) => (
                            <div
                                key={id}
                                onClick={() => { dismissStock(id); history.push('/admin/product'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '10px 16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fff8f0'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: '#e67e2215', color: '#e67e22',
                                    fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    {index + 1}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {data.product_name}
                                    </div>
                                    <div style={{ fontSize: 12, color: data.stock === 0 ? '#c0392b' : '#e67e22', fontWeight: 600 }}>
                                        {data.stock === 0 ? 'Stok habis!' : `Sisa ${data.stock} item`}
                                    </div>
                                </div>

                                <button
                                    onClick={e => { e.stopPropagation(); dismissStock(id); }}
                                    style={{ background: 'none', border: 'none', color: '#bbb', fontSize: 18, cursor: 'pointer', lineHeight: 1, flexShrink: 0, padding: '0 2px' }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Settlement Panel */}
            {paymentToasts.length > 0 && (
                <div style={{
                    width: 300,
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    animation: 'slideIn 0.3s ease',
                }}>
                    <div style={{
                        background: '#27ae60',
                        color: '#fff',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>
                            Pembayaran Masuk ({paymentToasts.length})
                        </span>
                        <button
                            onClick={dismissAllPayment}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}
                        >
                            Hapus semua
                        </button>
                    </div>

                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {paymentToasts.map(({ id, data }, index) => (
                            <div
                                key={id}
                                onClick={() => { dismissPayment(id); history.push(`/admin/orders/${data.order_id}`); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '10px 16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: '#27ae6015', color: '#27ae60',
                                    fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    {index + 1}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>
                                        Order #{data.order_number}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#27ae60', fontWeight: 600 }}>
                                        {formatRupiah(data.amount)}
                                    </div>
                                </div>

                                <button
                                    onClick={e => { e.stopPropagation(); dismissPayment(id); }}
                                    style={{ background: 'none', border: 'none', color: '#bbb', fontSize: 18, cursor: 'pointer', lineHeight: 1, flexShrink: 0, padding: '0 2px' }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
