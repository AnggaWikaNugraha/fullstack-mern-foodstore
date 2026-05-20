import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import SelectWilayah from '../../component/SelectWilayah';
import AccountLayout from '../../component/AccountLayout';
import { createAddress } from '../../api/address';

export default function UserAddressAdd() {
    const history      = useHistory();
    const location     = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isFromCheckout = searchParams.get('from') === 'checkout';

    const { handleSubmit, register, setValue, watch, getValues } = useForm();
    const allFields = watch();

    const [saving, setSaving] = React.useState(false);
    const [error,  setError]  = React.useState('');

    React.useEffect(() => {
        setValue('kabupaten', null);
        setValue('kecamatan', null);
        setValue('kelurahan', null);
    }, [allFields.provinsi, setValue]);

    React.useEffect(() => {
        setValue('kecamatan', null);
        setValue('kelurahan', null);
    }, [allFields.kabupaten, setValue]);

    React.useEffect(() => {
        setValue('kelurahan', null);
    }, [allFields.kecamatan, setValue]);

    const updateValue = (field, value) =>
        setValue(field, value, { shouldValidate: true, shouldDirty: true });

    const onSubmit = async (formData) => {
        setSaving(true);
        setError('');
        try {
            const payload = {
                nama:      formData.nama_alamat,
                detail:    formData.detail_alamat,
                provinsi:  formData.provinsi?.label,
                kabupaten: formData.kabupaten?.label,
                kecamatan: formData.kecamatan?.label,
                kelurahan: formData.kelurahan?.label,
            };
            const { data } = await createAddress(payload);
            if (data.error) { setError(data.message || 'Gagal menyimpan alamat.'); return; }
            history.push(isFromCheckout ? '/alamat-pengiriman?from=checkout&step=2' : '/alamat-pengiriman');
        } catch {
            setError('Terjadi kesalahan, coba lagi.');
        }
        setSaving(false);
    };

    const backTo = isFromCheckout ? '/checkout?step=2' : '/alamat-pengiriman';

    return (
        <AccountLayout activeTab="alamat">
            <Section>
                <SectionHeader>
                    <div>
                        <SectionTitle>Tambah Alamat Baru</SectionTitle>
                        <SectionSub>Isi detail alamat pengiriman</SectionSub>
                    </div>
                    <BackLink as={Link} to={backTo}>← Kembali</BackLink>
                </SectionHeader>

                <FormWrap onSubmit={handleSubmit(onSubmit)}>
                    {error && <ErrorMsg>{error}</ErrorMsg>}

                    <FieldGroup>
                        <FieldLabel>Nama Alamat *</FieldLabel>
                        <FieldInput
                            placeholder="Contoh: Rumah, Kantor"
                            {...register('nama_alamat', { required: true })}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Provinsi *</FieldLabel>
                        <SelectWilayah
                            onChange={opt => updateValue('provinsi', opt)}
                            name="provinsi"
                            value={getValues().provinsi}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Kabupaten / Kota *</FieldLabel>
                        <SelectWilayah
                            tingkat="kabupaten"
                            kodeInduk={getValues().provinsi?.value}
                            onChange={opt => updateValue('kabupaten', opt)}
                            value={getValues().kabupaten}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Kecamatan *</FieldLabel>
                        <SelectWilayah
                            tingkat="kecamatan"
                            kodeInduk={getValues().kabupaten?.value}
                            onChange={opt => updateValue('kecamatan', opt)}
                            value={getValues().kecamatan}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Kelurahan *</FieldLabel>
                        <SelectWilayah
                            tingkat="desa"
                            kodeInduk={getValues().kecamatan?.value}
                            onChange={opt => updateValue('kelurahan', opt)}
                            value={getValues().kelurahan}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Detail Alamat</FieldLabel>
                        <FieldTextarea
                            placeholder="Nama jalan, nomor rumah, patokan, dll."
                            rows={3}
                            {...register('detail_alamat')}
                        />
                    </FieldGroup>

                    <FormFooter>
                        <SaveBtn type="submit" disabled={saving}>
                            {saving ? 'Menyimpan...' : 'Simpan Alamat'}
                        </SaveBtn>
                        <CancelBtn type="button" as={Link} to={backTo}>
                            Batal
                        </CancelBtn>
                    </FormFooter>
                </FormWrap>
            </Section>
        </AccountLayout>
    );
}

const Section = styled('div')({
    background: '#fff',
    borderRadius: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    overflow: 'hidden',
});

const SectionHeader = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f5f5f5',
    gap: '1rem',
    flexWrap: 'wrap',
});

const SectionTitle = styled('h2')({
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111',
    margin: '0 0 2px',
});

const SectionSub = styled('p')({
    fontSize: '0.8125rem',
    color: '#999',
    margin: 0,
});

const BackLink = styled('div')({
    fontSize: '0.8125rem',
    color: '#c0392b',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': { textDecoration: 'underline' },
});

const FormWrap = styled('form')({
    padding: '1.25rem 1.5rem 1.5rem',
    maxWidth: 480,
});

const FieldGroup = styled('div')({
    marginBottom: '1rem',
});

const FieldLabel = styled('label')({
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#444',
    marginBottom: '0.375rem',
});

const FieldInput = styled('input')({
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': { borderColor: '#c0392b', boxShadow: '0 0 0 2px rgba(192,57,43,0.1)' },
});

const FieldTextarea = styled('textarea')({
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    '&:focus': { borderColor: '#c0392b', boxShadow: '0 0 0 2px rgba(192,57,43,0.1)' },
});

const ErrorMsg = styled('p')({
    background: '#fff5f5',
    color: '#c0392b',
    border: '1px solid #fed7d7',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.8125rem',
    margin: '0 0 1rem',
});

const FormFooter = styled('div')({
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
});

const SaveBtn = styled('button')({
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.6875rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': { background: '#a93226' },
    '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
});

const CancelBtn = styled('div')({
    background: '#e9ecef',
    color: '#555',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.6875rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    '&:hover': { background: '#dee2e6' },
});
