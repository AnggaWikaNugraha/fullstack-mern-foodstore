import * as React from 'react';
import { arrayOf, string, shape, oneOfType, number, func } from 'prop-types';
import { CardItem } from 'upkit';
import { config } from '../../config';

export default function Cart({ items, onItemInc, onItemDec }) {
    return <div>

        {!items.length ? <div className="text-center text-sm text-red-900"> belum ada items di keranjang </div> : null}

        {items.map((item, index) => {
            return <div key={index} className="mb-2">

                <CardItem
                    imgUrl={`${config.api_host}/upload/${item.image_url}`}
                    name={item.name}
                    qty={item.qty}
                    color="orange"
                    onInc={_ => onItemInc(item)}
                    onDec={_ => onItemDec(item)}
                />

            </div>
        })}

    </div>
}

Cart.propTypes = {
    items: arrayOf(shape({
        _id: string.isRequired,
        name: string.isRequired,
        qty: oneOfType([string, number]).isRequired
    })),
    onItemInc: func, // (1)
    onItemDec: func, // (2)
}