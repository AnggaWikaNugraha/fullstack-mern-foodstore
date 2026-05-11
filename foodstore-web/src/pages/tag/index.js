import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { LayoutSidebar } from 'upkit';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader';
import AppSidebar from '../../component/AppSidebar';
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
                            <Heading>TAG</Heading>
                            <Button onClick={openAdd}>+ Tambah Tag</Button>
                        </TopBar>
                        <DataTable
                            columns={columns}
                            data={tags}
                            progressPending={loading}
                            progressComponent={<div style={{ padding: 30 }}><BounceLoader color="red" /></div>}
                            noDataComponent={<p style={{ padding: 20, color: '#888' }}>Belum ada tag.</p>}
                        />
                    </div>
                }
                sidebarSize={80}
            />

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
                                <Label>Name *</Label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    placeholder="e.g. burger"
                                />
                            </FormGroup>
                            <ModalFooter>
                                <Button type="submit" disabled={submitLoading}>
                                    {submitLoading ? 'Menyimpan...' : selectedTag ? 'Update' : 'Simpan'}
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

export default AdminTag;

const TopBar = styled('div')({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 });
const Heading = styled('p')({ fontSize: 23, fontWeight: 'bold', margin: 0 });
const Button = styled('button')(props => ({
    backgroundColor: props.Bg || 'black',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 5,
    cursor: 'pointer',
    opacity: props.disabled ? 0.6 : 1,
    marginRight: 10,
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
const Overlay = styled('div')({ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 });
const Modal = styled('div')({ backgroundColor: 'white', borderRadius: 10, padding: 30, width: '100%', maxWidth: 440 });
const ModalHeader = styled('div')({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, '& h2': { fontSize: 18, fontWeight: 'bold' } });
const ModalFooter = styled('div')({ display: 'flex', gap: 10, marginTop: 20 });
const CloseBtn = styled('button')({ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' });
const FormGroup = styled('div')({ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 });
const Label = styled('label')({ fontSize: 14, fontWeight: 600, color: '#333' });
const Input = styled('input')({ border: '1px solid #ddd', borderRadius: 6, padding: '9px 12px', fontSize: 14, width: '100%', outline: 'none', '&:focus': { borderColor: '#333' } });
const ErrorMsg = styled('p')({ backgroundColor: '#fff5f5', color: '#c0392b', border: '1px solid #fed7d7', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 14 });
