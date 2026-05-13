import { config } from '../config';

// Produk lama: image_url berisi nama file (contoh: "abc123.jpg")
// Produk baru: image_url berisi full Cloudinary URL (contoh: "https://res.cloudinary.com/...")
export function getImageUrl(imageUrl) {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${config.api_host}/upload/${imageUrl}`;
}
