import React, { useState } from 'react';

// value: angka rating saat ini (1-5)
// onChange: dipanggil saat user klik bintang (hanya di mode interaktif)
// readonly: true = tampil saja, false = bisa diklik
// size: ukuran bintang dalam px
export default function StarRating({ value = 0, onChange, readonly = false, size = 24 }) {
    const [hover, setHover] = useState(0);
    const active = hover || value;

    return (
        <div style={{ display: 'inline-flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    onClick={() => !readonly && onChange && onChange(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    style={{
                        fontSize: size,
                        color: star <= active ? '#f39c12' : '#ddd',
                        cursor: readonly ? 'default' : 'pointer',
                        lineHeight: 1,
                        transition: 'color 0.1s',
                        userSelect: 'none',
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}
