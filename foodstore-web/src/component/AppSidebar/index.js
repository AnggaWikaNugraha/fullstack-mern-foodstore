import React, { useState, useEffect } from 'react';
import { SideNav } from 'upkit';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { get } from '../../api/category';

const iconMap = {
    utama: '/images/menus/utama.png',
    minuman: '/images/menus/minuman.png',
    snack: '/images/menus/snack.png',
    pastry: '/images/menus/pastry.png',
};

const defaultIcon = '/images/menus/semua.png';

const adminIcon = '/images/menus/admin.svg';

const adminMenus = [
    { icon: adminIcon, label: 'Dashboard', id: 'admin/dashboard' },
    { icon: adminIcon, label: 'Produk', id: 'admin/product' },
    { icon: adminIcon, label: 'Kategori', id: 'admin/categories' },
    { icon: adminIcon, label: 'Tag', id: 'admin/tag' },
];

export default function AppSidebar({ onCategoryChange }) {
    const auth = useSelector(state => state.auth);
    const history = useHistory();

    const [categoryMenus, setCategoryMenus] = useState([
        { icon: defaultIcon, label: 'semua', id: '' },
    ]);

    useEffect(() => {
        get({ limit: 100 })
            .then(res => {
                const items = [
                    { icon: defaultIcon, label: 'semua', id: '' },
                    ...res.data.data.map(cat => ({
                        icon: iconMap[cat.name] || defaultIcon,
                        label: cat.name,
                        id: cat.name,
                    })),
                ];
                setCategoryMenus(items);
            })
            .catch(() => {});
    }, []);

    const isAdmin = auth?.user?.role === 'admin';
    const items = isAdmin ? [...adminMenus, ...categoryMenus] : categoryMenus;

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
        <div className="app-sidebar" style={{
            position: 'sticky',
            top: 56,
            height: 'calc(100vh - 56px)',
            overflowY: 'auto',
        }}>
            <SideNav
                items={items}
                verticalAlign="top"
                onChange={handleChange}
            />
        </div>
    );
}
