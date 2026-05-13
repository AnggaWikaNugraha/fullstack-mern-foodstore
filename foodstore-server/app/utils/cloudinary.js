const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer langsung ke Cloudinary, return secure_url
function uploadToCloudinary(buffer, folder = 'foodstore') {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(buffer);
    });
}

// Hapus gambar lama dari Cloudinary berdasarkan URL
async function deleteFromCloudinary(imageUrl) {
    if (!imageUrl || !imageUrl.startsWith('http')) return;
    try {
        // Ambil public_id dari URL: .../foodstore/filename.ext → foodstore/filename
        const parts = imageUrl.split('/');
        const filenameWithExt = parts[parts.length - 1];
        const filename = filenameWithExt.split('.')[0];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${filename}`;
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        // Gagal hapus tidak perlu stop proses
    }
}

module.exports = { uploadToCloudinary, deleteFromCloudinary };
