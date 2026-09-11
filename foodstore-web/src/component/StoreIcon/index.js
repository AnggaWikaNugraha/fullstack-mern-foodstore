import React from 'react';

const paths = {
    search: (
        <>
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4.5 4.5" />
        </>
    ),
    heart: (
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    bag: (
        <>
            <path d="M5 7h14l1 14H4L5 7Z" />
            <path d="M8 8V6a4 4 0 0 1 8 0v2" />
        </>
    ),
    dish: (
        <>
            <path d="M3 17h18M5 17a7 7 0 0 1 14 0M2 21h20M12 6V4M10 4h4" />
        </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    leaf: (
        <>
            <path d="M20 3C9 2 3 7 4 14c1 7 10 8 14 1 2-4 2-8 2-12Z" />
            <path d="M3 22 15 9" />
        </>
    ),
    shield: (
        <>
            <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
            <path d="m8 12 3 3 5-6" />
        </>
    ),
    sparkles: (
        <>
            <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
            <path d="M21 2v4m-2-2h4" />
        </>
    ),
    filter: (
        <>
            <path d="M4 7h16M4 17h16" />
            <circle cx="9" cy="7" r="2" fill="currentColor" />
            <circle cx="15" cy="17" r="2" fill="currentColor" />
        </>
    ),
};

export default function StoreIcon({ name, size = 20, ...props }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {paths[name] || paths.dish}
        </svg>
    );
}
