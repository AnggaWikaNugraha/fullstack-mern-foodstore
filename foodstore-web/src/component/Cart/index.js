import * as React from 'react';
import FaArrowRight from '@meronex/icons/fa/FaArrowRight'
import FaCartPlus from '@meronex/icons/fa/FaCartPlus';

import { formatRupiah } from '../../utils/format-rupiah';
import { sumPrice } from '../../utils/sum-price';
import { arrayOf, string, shape, oneOfType, number, func } from 'prop-types';
import { CardItem, Button, Text } from 'upkit';
import { config } from '../../config';
import styled from '@emotion/styled'
export default function Cart({ items, onItemInc, onItemDec, onCheckout }) {

    let total = sumPrice(items);

    return <div>

        {!items.length ? <Wrapp> belum ada items di keranjang </Wrapp> : null}

        <div className="text-3xl flex items-center text-red-700">
            <FaCartPlus />
            <div className="ml-2">
                Keranjang
            </div>
        </div>

        <Text as="h5"> Total: {formatRupiah(total)} </Text>

        <div className='p-2'>
            <Button
                text="Checkout"
                fitContainer
                iconAfter={<FaArrowRight />}
                disabled={!items.length}
                onClick={onCheckout}
            />
        </div>

        <div className='p-2'>
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

    </div>
}

Cart.propTypes = {
    items: arrayOf(shape({
        _id: string.isRequired,
        name: string.isRequired,
        qty: oneOfType([string, number]).isRequired
    })),
    onItemInc: func,
    onItemDec: func,
    onCheckout: func,
}

const Wrapp = styled('div')((props) => ({
    backgroundColor: 'brown',
    padding: '10px',
    color: 'white',
    textAlign: 'center',
    marginBottom: '10px'
}))