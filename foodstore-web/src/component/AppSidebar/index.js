import React from 'react';
import { SideNav } from 'upkit';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import menus from '../../pages/menu';

const adminMenus = [
    { icon: '/images/menus/utama.png', label: 'Produk', id: 'admin/product' },
    { icon: '/images/menus/semua.png', label: 'Kategori', id: 'admin/categories' },
    { icon: '/images/menus/snack.png', label: 'Tag', id: 'admin/tag' },
];

export default function AppSidebar({ onCategoryChange }) {
    const auth = useSelector(state => state.auth);
    const history = useHistory();

    const isAdmin = auth?.user?.role === 'admin';
    const items = isAdmin ? [...menus, ...adminMenus] : menus;

    const handleChange = (id) => {
        if (String(id).startsWith('admin/')) {
            history.push(`/${id}`);
        } else if (onCategoryChange) {
            onCategoryChange(id);
        } else {
            history.push('/');
        }
    };

    return (
        <SideNav
            items={items}
            verticalAlign="top"
            onChange={handleChange}
        />
    );
}
