import * as React from 'react';
import TopBar from '../../component/Topbar';
import SelectWilayah from '../../component/SelectWilayah';

import { LayoutOne, InputText, FormControl, Textarea, Button } from 'upkit';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { createAddress } from '../../api/address';
import { rules } from './validations';

export default function UserAddressAdd() {

    // (1) gunakan `useHistory` dan `useForm`
    let history = useHistory();

    let { handleSubmit, register, errors, setValue, watch, getValues } = useForm();

    // (1) dengarkan semua perubahan _field_ 
    let allFields = watch();

    React.useEffect(() => {

        setValue('kabupaten', null);
        setValue('kecamatan', null);
        setValue('kelurahan', null);

    }, [allFields.provinsi, setValue])

    React.useEffect(() => {

        setValue('kecamatan', null);
        setValue('kelurahan', null);

    }, [allFields.kabupaten, setValue])

    React.useEffect(() => {

        setValue('kelurahan', null);

    }, [allFields.kecamatan, setValue])

    // (1) fungsi `updateValue`
    const updateValue = (field, value) => setValue(field, value, { shouldValidate: true, shouldDirty: true });

    const onSubmit = async formData => {

        let payload = {
            nama: formData.nama_alamat,
            detail: formData.detail_alamat,
            provinsi: formData.provinsi.label,
            kabupaten: formData.kabupaten.label,
            kecamatan: formData.kecamatan.label,
            kelurahan: formData.kelurahan.label
        }

        let respones = await createAddress(payload);
        console.log(respones)
        let data = respones.data

        if (data.error) return;

        history.push('/alamat-pengiriman');

    }

    return (
        <LayoutOne>
            <TopBar />
            <br />
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl label="Nama alamat" color="black">
                        <InputText
                            placeholder="Nama alamat"
                            fitContainer
                            {...register('nama_alamat')}
                        />
                    </FormControl>
                    <FormControl label="Provinsi" color="black">
                        <SelectWilayah
                            onChange={option => updateValue('provinsi', option)}
                            name="provinsi"
                            value={getValues().provinsi}
                        />
                    </FormControl>
                    <FormControl label="Kabupaten/kota" color="black">
                        <SelectWilayah
                            tingkat="kabupaten"
                            kodeInduk={getValues().provinsi?.value}
                            onChange={option => updateValue('kabupaten', option)}
                            value={getValues().kabupaten}
                        />
                    </FormControl>
                    <FormControl label="Kecamatan" color="black">
                        <SelectWilayah
                            tingkat="kecamatan"
                            kodeInduk={getValues().kabupaten?.value}
                            onChange={option => updateValue('kecamatan', option)}
                            value={getValues().kecamatan}
                        />
                    </FormControl>
                    <FormControl label="Kelurahan" color="black" >
                        <SelectWilayah
                            tingkat="desa"
                            kodeInduk={getValues().kecamatan?.value}
                            onChange={option => updateValue('kelurahan', option)}
                            value={getValues().kelurahan}
                        />
                    </FormControl>
                    <FormControl label="Detail alamat" color="black">
                        <Textarea
                            placeholder="Detail alamat"
                            fitContainer
                            {...register('detail_alamat')}
                        />
                    </FormControl>

                    <Button fitContainer>
                        Simpan
                    </Button>
                </form>
            </div>
        </LayoutOne>
    )
}