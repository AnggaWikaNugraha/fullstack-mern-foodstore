import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import styled from '@emotion/styled';
import BounceLoader from 'react-spinners/BounceLoader';
import AdminLayout from '../../component/AdminLayout';
import { getTags, createTag, updateTag, deleteTag } from '../../api/tag';

const AdminTag = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [name, setName] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await getTags({ limit: 100 });
            setTags(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => {
        setSelectedTag(null);
        setName('');
        setError('');
        setShowModal(true);
    };

    const openEdit = (tag) => {
        setSelectedTag(tag);
        setName(tag.name);
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        try {
            const res = selectedTag
                ? await updateTag(selectedTag._id, { name })
                : await createTag({ name });

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
        if (!window.confirm('Yakin hapus tag ini?')) return;
        try {
            await deleteTag(id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        {
            name: 'No',
            cell: (row, index) => index + 1,
            width: '60px',
        },
        {
            name: 'Name',
            selector: 'name',
            sortable: true,
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
            <AdminLayout title="Tag" subtitle="Kelola tag produk">
                <TableCard>
                    <TableTopBar>
                        <div />
                        <AddBtn onClick={openAdd}>+ Tambah Tag</AddBtn>
                    </TableTopBar>
                    <DataTable
                        columns={columns}
                        data={tags}
                        progressPending={loading}
                        progressComponent={
                            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                                <BounceLoader color="#c0392b" size={32} />
                            </div>
                        }
                        noDataComponent={<Empty>Belum ada tag.</Empty>}
                        customStyles={tableStyles}
                    />
                </TableCard>
            </AdminLayout>

            {showModal && (
                <Overlay>
                    <Modal>
                        <ModalHeader>
                            <h2>{selectedTag ? 'Edit Tag' : 'Tambah Tag'}</h2>
                            <CloseBtn onClick={() => setShowModal(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <form onSubmit={handleSubmit}>
                            {error && <ErrorMsg>{error}</ErrorMsg>}
                            <FormGroup>
                                <Label>Nama *</Label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    placeholder="e.g. Pedas"
                                />
                            </FormGroup>
                            <ModalFooter>
                                <SubmitBtn type="submit" disabled={submitLoading}>
                                    {submitLoading ? 'Menyimpan...' : selectedTag ? 'Update' : 'Simpan'}
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

export default AdminTag;

const tableStyles = {
    headRow: {
        style: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef', minHeight: '44px' },
    },
    headCells: {
        style: { fontSize: '12px', fontWeight: '700', color: '#495057', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '16px', paddingRight: '8px' },
    },
    rows: {
        style: { minHeight: '56px', borderBottom: '1px solid #f1f3f5' },
    },
    cells: {
        style: { paddingLeft: '16px', paddingRight: '8px' },
    },
    pagination: {
        style: { borderTop: '1px solid #e9ecef' },
    },
};

const TableCard = styled('div')({
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    overflow: 'hidden',
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
    maxWidth: 440,
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

const Label = styled('label')({
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
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

const ErrorMsg = styled('p')({
    backgroundColor: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #fed7d7',
    borderRadius: 6,
    padding: '10px 14px',
    margin: '0 0 16px',
    fontSize: 14,
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
