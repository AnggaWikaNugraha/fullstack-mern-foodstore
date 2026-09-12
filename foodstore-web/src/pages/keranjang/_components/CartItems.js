import React from 'react';
import StoreIcon from '../../../component/StoreIcon';
import { formatRupiah } from '../../../utils/format-rupiah';

export default function CartItems({ items, isBusy, allSelected, selectAllRef, selectedCount, toggleAll, toggleItem, removeSelected, changeQuantity, removeItem, imageSource, onImageError }) {
    return (
        <section className="cart-items" aria-label="Menu di keranjang" aria-busy={isBusy}>
            <div className="cart-selection-bar">
                <label className="cart-checkbox-label"><input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleAll} disabled={isBusy} />Pilih semua <span>({items.length} menu)</span></label>
                <button className="cart-delete-selected" onClick={removeSelected} disabled={!selectedCount || isBusy}><StoreIcon name="trash" size={16} /> Hapus pilihan</button>
            </div>
            <div className="cart-items-list">
                {items.map((item) => {
                    const soldOut = item.stock === 0;
                    const atLimit = item.stock != null && Number(item.qty) >= item.stock;
                    const overLimit = item.stock != null && Number(item.qty) > item.stock;
                    return (
                        <article className={`cart-item ${item.checked === false ? 'is-unselected' : ''}`} key={item._id} aria-label={item.name}>
                            <input className="cart-item-check" type="checkbox" checked={item.checked !== false} onChange={() => toggleItem(item._id)} disabled={isBusy} aria-label={`Pilih ${item.name}`} />
                            <img className="cart-item-image" src={imageSource(item)} onError={onImageError} alt={item.name} width="104" height="104" />
                            <div className="cart-item-info">
                                <h2>{item.name}</h2>
                                <p className="cart-unit-price">{formatRupiah(item.price)} <span>/ porsi</span></p>
                                {(soldOut || overLimit || atLimit) && <p className="cart-stock-note">{soldOut ? 'Stok habis' : overLimit ? `Tersisa ${item.stock} porsi. Kurangi jumlah pesanan.` : 'Jumlah sudah mencapai stok tersedia.'}</p>}
                            </div>
                            <button className="cart-delete" onClick={() => removeItem(item._id)} disabled={isBusy} aria-label={`Hapus ${item.name}`}><StoreIcon name="trash" size={17} /></button>
                            <div className="cart-quantity" role="group" aria-label={`Jumlah ${item.name}`}>
                                <button onClick={() => changeQuantity(item._id, -1)} disabled={isBusy || Number(item.qty) <= 1} aria-label={`Kurangi ${item.name}`}><StoreIcon name="minus" size={15} /></button>
                                <span aria-label={`${item.qty} porsi`}>{item.qty}</span>
                                <button onClick={() => changeQuantity(item._id, 1)} disabled={isBusy || atLimit} aria-label={`Tambah ${item.name}`}><StoreIcon name="plus" size={15} /></button>
                            </div>
                            <strong className="cart-item-total">{formatRupiah(item.price * item.qty)}</strong>
                        </article>
                    );
                })}
            </div>
            <div className="cart-items-note"><StoreIcon name="dish" size={20} /><p>Sudah pas pilihannya? Lanjutkan untuk mengatur alamat pengiriman.</p></div>
        </section>
    );
}
