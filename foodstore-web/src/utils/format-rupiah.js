export function formatRupiah(number) {

    if (isNaN(parseInt(number))) return '';

    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, minimumFractionDigits: 0, style: 'currency', currency: 'IDR' }).format(number);
}
