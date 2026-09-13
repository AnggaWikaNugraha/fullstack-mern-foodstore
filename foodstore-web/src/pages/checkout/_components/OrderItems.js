import React from 'react';
import { formatRupiah } from '../../../utils/format-rupiah';

export default function OrderItems({ items, imageSource, onImageError }) {
    return <ul className="checkout-item-list">{items.map((item) => <li className="checkout-item" key={item._id}>
        <img src={imageSource(item)} alt={item.name} width="76" height="76" onError={onImageError} />
        <div className="checkout-item-info"><h3>{item.name}</h3><p>{formatRupiah(item.price)} <span>/ porsi</span></p><span className="checkout-item-quantity">{item.qty} porsi</span></div>
        <strong>{formatRupiah(item.price * item.qty)}</strong>
    </li>)}</ul>;
}
