import React, { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import { LayoutSidebar } from 'upkit';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader';
import AppSidebar from '../../component/AppSidebar';

import { config } from '../../config';
import { formatRupiah } from '../../utils/format-rupiah';
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
        name: '', description: '', price: '', category: '', tags: [], image: null,
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
        setForm({ name: '', description: '', price: '', category: '', tags: [], image: null });
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
        });
        setPreview(product.image_url ? `${config.api_host}/upload/${product.image_url}` : null);
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
                    src={`${config.api_host}/upload/${row.image_url}`}
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
            name: 'Actions',
            cell: row => (
                <>
                    <ActionBtn onClick={() => openEdit(row)}>Edit</ActionBtn>
                    <ActionBtn Bg="#c0392b" onClick={() => handleDelete(row._id)}>Delete</ActionBtn>
                </>
            ),
        },
    ];

    return (
        <div>
            <LayoutSidebar
                sidebar={<AppSidebar />}
                content={
                    <div className="w-full p-10 h-full min-h-screen">
                        <TopBar>
                            <Heading>PRODUCT</Heading>
                            <Button onClick={openAdd}>+ Tambah Product</Button>
                        </TopBar>

                        <DataTable
                            columns={columns}
                            data={products}
                            progressPending={loading}
                            progressComponent={
                                <div style={{ padding: 30 }}>
                                    <BounceLoader color="red" />
                                </div>
                            }
                            pagination
                            paginationServer
                            paginationTotalRows={count}
                            onChangePage={p => setPage(p)}
                            paginationPerPage={perPage}
                            noDataComponent={
                                <p style={{ padding: 20, color: '#888' }}>
                                    Belum ada produk. Klik "+ Tambah Product" untuk mulai.
                                </p>
                            }
                        />
                    </div>
                }
                sidebarSize={80}
            />

            {showModal && (
                <Overlay>
                    <Modal>
                        <ModalHeader>
                            <h2>{selectedProduct ? 'Edit Product' : 'Tambah Product'}</h2>
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
                                    <Label>Category</Label>
                                    <Select name="category" value={form.category} onChange={handleChange}>
                                        <option value="">-- Pilih kategori --</option>
                                        {categoryOptions.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </Select>
                                </FormGroup>
                            </FormRow>

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
                                <Button type="submit" disabled={submitLoading}>
                                    {submitLoading ? 'Menyimpan...' : selectedProduct ? 'Update' : 'Simpan'}
                                </Button>
                                <Button type="button" Bg="#bababa" onClick={() => setShowModal(false)}>Batal</Button>
                            </ModalFooter>
                        </form>
                    </Modal>
                </Overlay>
            )}
        </div>
    );
};

export default AdminProduct;

const TopBar = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
});

const Heading = styled('p')({
    fontSize: 23,
    fontWeight: 'bold',
    margin: 0,
});

const Button = styled('button')(props => ({
    backgroundColor: props.Bg || 'black',
    color: props.CFont || 'white',
    padding: '10px 20px',
    borderRadius: 5,
    cursor: 'pointer',
    opacity: props.disabled ? 0.6 : 1,
    marginRight: props.Bg ? 0 : 10,
}));

const ActionBtn = styled('button')(props => ({
    backgroundColor: props.Bg || 'black',
    color: 'white',
    padding: '6px 14px',
    marginRight: 8,
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 13,
}));

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
    borderRadius: 10,
    padding: '30px',
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflowY: 'auto',
});

const ModalHeader = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    '& h2': { fontSize: 18, fontWeight: 'bold' },
});

const ModalFooter = styled('div')({
    display: 'flex',
    gap: 10,
    marginTop: 24,
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
    '&:focus': { borderColor: '#333' },
});

const Textarea = styled('textarea')({
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '9px 12px',
    fontSize: 14,
    width: '100%',
    resize: 'vertical',
    outline: 'none',
    '&:focus': { borderColor: '#333' },
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
});

const Select = styled('select')({
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: '9px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    backgroundColor: 'white',
    '&:focus': { borderColor: '#333' },
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
