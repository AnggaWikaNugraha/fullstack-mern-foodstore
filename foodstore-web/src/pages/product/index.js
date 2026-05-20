import React, { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import styled from '@emotion/styled';
import BounceLoader from 'react-spinners/BounceLoader';
import AdminLayout from '../../component/AdminLayout';

import { formatRupiah } from '../../utils/format-rupiah';
import { getImageUrl } from '../../utils/image-url';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { get as getCategories } from '../../api/category';
import { getTags } from '../../api/tag';

const AdminProduct = () => {

    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const perPage = 10;
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '', description: '', price: '', category: '', tags: [], image: null, stock: 0,
    });
    const [preview, setPreview] = useState(null);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [tagOptions, setTagOptions] = useState([]);

    useEffect(() => {
        getCategories({ limit: 100 }).then(res => setCategoryOptions(res.data.data || [])).catch(() => {});
        getTags({ limit: 100 }).then(res => setTagOptions(Array.isArray(res.data) ? res.data : res.data.data || [])).catch(() => {});
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getProducts({ limit: perPage, skip: (page * perPage) - perPage });
            setProducts(data.data);
            setCount(data.count);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openAdd = () => {
        setSelectedProduct(null);
        setForm({ name: '', description: '', price: '', category: '', tags: [], image: null, stock: 0 });
        setPreview(null);
        setError('');
        setShowModal(true);
    };

    const openEdit = (product) => {
        setSelectedProduct(product);
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category?.name || '',
            tags: product.tags?.map(t => t.name) || [],
            image: null,
            stock: product.stock ?? 0,
        });
        setPreview(product.image_url ? getImageUrl(product.image_url) : null);
        setError('');
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('stock', form.stock);
        formData.append('category', form.category);
        form.tags.forEach(tag => formData.append('tags', tag));
        if (form.image) formData.append('image', form.image);

        try {
            const res = selectedProduct
                ? await updateProduct(selectedProduct._id, formData)
                : await createProduct(formData);

            if (res.data?.error) {
                setError(res.data.message);
            } else {
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            setError('Terjadi kesalahan, coba lagi.');
        }
        setSubmitLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin hapus produk ini?')) return;
        try {
            await deleteProduct(id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        {
            name: 'Image',
            cell: row => (
                <img
                    src={getImageUrl(row.image_url)}
                    alt={row.name}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                />
            ),
            width: '70px',
        },
        { name: 'Name', selector: 'name', sortable: true, grow: 2 },
        { name: 'Price', cell: row => formatRupiah(row.price), sortable: true },
        { name: 'Category', cell: row => row.category?.name || '-' },
        { name: 'Tags', cell: row => row.tags?.map(t => t.name).join(', ') || '-', grow: 2 },
        {
            name: 'Stock',
            cell: row => {
                const s = row.stock ?? 0;
                if (s === 0) return <StockBadge color="#c0392b">Habis</StockBadge>;
                if (s <= 5) return <StockBadge color="#e67e22">⚠ {s}</StockBadge>;
                return <span style={{ fontWeight: 600 }}>{s}</span>;
            },
            width: '90px',
        },
        {
            name: 'Actions',
            width: '160px',
            cell: row => (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <ActionBtn onClick={() => openEdit(row)}>Edit</ActionBtn>
                    <ActionBtn bg="#c0392b" onClick={() => handleDelete(row._id)}>Delete</ActionBtn>
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminLayout title="Produk" subtitle="Kelola semua produk yang tersedia di toko">
                <TableCard>
                    <TableTopBar>
                        <div />
                        <AddBtn onClick={openAdd}>+ Tambah Produk</AddBtn>
                    </TableTopBar>

                    <DataTable
                        columns={columns}
                        data={products}
                        progressPending={loading}
                        progressComponent={
                            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                                <BounceLoader color="#c0392b" size={32} />
                            </div>
                        }
                        pagination
                        paginationServer
                        paginationTotalRows={count}
                        onChangePage={p => setPage(p)}
                        paginationPerPage={perPage}
                        noDataComponent={
                            <Empty>Belum ada produk. Klik "+ Tambah Produk" untuk mulai.</Empty>
                        }
                        customStyles={tableStyles}
                    />
                </TableCard>
            </AdminLayout>

            {showModal && (
                <Overlay>
                    <Modal>
                        <ModalHeader>
                            <h2>{selectedProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
                            <CloseBtn onClick={() => setShowModal(false)}>✕</CloseBtn>
                        </ModalHeader>

                        <form onSubmit={handleSubmit}>
                            {error && <ErrorMsg>{error}</ErrorMsg>}

                            <FormGroup>
                                <Label>Name *</Label>
                                <Input name="name" value={form.name} onChange={handleChange} required placeholder="Nama produk" />
                            </FormGroup>

                            <FormGroup>
                                <Label>Description</Label>
                                <Textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Deskripsi produk" />
                            </FormGroup>

                            <FormRow>
                                <FormGroup style={{ flex: 1 }}>
                                    <Label>Price *</Label>
                                    <Input type="number" name="price" value={form.price} onChange={handleChange} required min={0} placeholder="0" />
                                </FormGroup>
                                <FormGroup style={{ flex: 1 }}>
                                    <Label>Stock *</Label>
                                    <Input type="number" name="stock" value={form.stock} onChange={handleChange} required min={0} placeholder="0" />
                                </FormGroup>
                            </FormRow>

                            <FormGroup>
                                <Label>Category</Label>
                                <Select name="category" value={form.category} onChange={handleChange}>
                                    <option value="">-- Pilih kategori --</option>
                                    {categoryOptions.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Tags</Label>
                                <CheckboxGrid>
                                    {tagOptions.map(tag => (
                                        <CheckboxLabel key={tag._id}>
                                            <input
                                                type="checkbox"
                                                value={tag.name}
                                                checked={form.tags.includes(tag.name)}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setForm(prev => ({
                                                        ...prev,
                                                        tags: e.target.checked
                                                            ? [...prev.tags, val]
                                                            : prev.tags.filter(t => t !== val),
                                                    }));
                                                }}
                                            />
                                            {tag.name}
                                        </CheckboxLabel>
                                    ))}
                                    {tagOptions.length === 0 && <small style={{ color: '#999' }}>Belum ada tag.</small>}
                                </CheckboxGrid>
                            </FormGroup>

                            <FormGroup>
                                <Label>
                                    Image {selectedProduct && <small>(kosongkan jika tidak diganti)</small>}
                                </Label>
                                <Input type="file" accept="image/*" onChange={handleImageChange} />
                                {preview && <ImagePreview src={preview} alt="preview" />}
                            </FormGroup>

                            <ModalFooter>
                                <SubmitBtn type="submit" disabled={submitLoading}>
                                    {submitLoading ? 'Menyimpan...' : selectedProduct ? 'Update' : 'Simpan'}
                                </SubmitBtn>
                                <CancelBtn type="button" onClick={() => setShowModal(false)}>Batal</CancelBtn>
                            </ModalFooter>
                        </form>
                    </Modal>
                </Overlay>
            )}
        </>
    );
};

export default AdminProduct;

const tableStyles = {
    headRow: {
        style: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef', minHeight: '44px' },
    },
    headCells: {
        style: { fontSize: '12px', fontWeight: '700', color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '16px', paddingRight: '8px' },
    },
    rows: {
        style: { minHeight: '64px', borderBottom: '1px solid #f1f3f5' },
    },
    cells: {
        style: { paddingLeft: '16px', paddingRight: '8px' },
    },
    pagination: {
        style: { borderTop: '1px solid #e9ecef', paddingTop: '12px', paddingBottom: '12px' },
    },
};

const TableCard = styled('div')({
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    overflowX: 'auto',
});

const TableTopBar = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f0f0f0',
});

const AddBtn = styled('button')({
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem 1.125rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { background: '#a93226' },
});

const StockBadge = styled('span')(({ color }) => ({
    backgroundColor: color || '#888',
    color: 'white',
    borderRadius: 5,
    padding: '3px 8px',
    fontSize: 12,
    fontWeight: 700,
}));

const ActionBtn = styled('button')(({ bg }) => ({
    backgroundColor: bg || '#333',
    color: 'white',
    border: 'none',
    padding: '5px 12px',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'opacity 0.1s',
    '&:hover': { opacity: 0.85 },
}));

const Empty = styled('p')({
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    padding: '3rem 0',
    margin: 0,
});

const Overlay = styled('div')({
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
});

const Modal = styled('div')({
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '1.75rem',
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflowY: 'auto',
});

const ModalHeader = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    '& h2': { fontSize: 18, fontWeight: 'bold', margin: 0 },
});

const ModalFooter = styled('div')({
    display: 'flex',
    gap: 10,
    marginTop: '1.25rem',
});

const CloseBtn = styled('button')({
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    color: '#888',
});

const FormGroup = styled('div')({
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
});

const FormRow = styled('div')({
    display: 'flex',
    gap: 16,
});

const Label = styled('label')({
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
    '& small': { fontWeight: 400, color: '#999', marginLeft: 6 },
});

const Input = styled('input')({
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '9px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': { borderColor: '#c0392b' },
});

const Textarea = styled('textarea')({
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '9px 12px',
    fontSize: 14,
    width: '100%',
    resize: 'vertical',
    outline: 'none',
    '&:focus': { borderColor: '#c0392b' },
});

const ImagePreview = styled('img')({
    marginTop: 10,
    width: 120,
    height: 120,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #ddd',
});

const ErrorMsg = styled('p')({
    backgroundColor: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #fed7d7',
    borderRadius: 6,
    padding: '10px 14px',
    marginBottom: 16,
    fontSize: 14,
    margin: '0 0 16px',
});

const Select = styled('select')({
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '9px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    backgroundColor: 'white',
    '&:focus': { borderColor: '#c0392b' },
});

const CheckboxGrid = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    minHeight: 42,
});

const CheckboxLabel = styled('label')({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    cursor: 'pointer',
    '& input': { cursor: 'pointer' },
});

const SubmitBtn = styled('button')({
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { background: '#a93226' },
    '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
});

const CancelBtn = styled('button')({
    background: '#e9ecef',
    color: '#555',
    border: 'none',
    borderRadius: 6,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': { background: '#dee2e6' },
});
