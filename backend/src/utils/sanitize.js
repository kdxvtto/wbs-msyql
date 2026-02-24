import xssFilter from "xss";

// Konfigurasi: tidak ada HTML tag yang diizinkan, hapus isi <script> dan <style>
const xssOptions = { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script', 'style'] };

/**
 * Sanitize string input untuk mencegah stored XSS.
 * @param {string} str - Input yang akan di-sanitize
 * @returns {string|*} - String yang sudah bersih dari HTML tags
 */
export const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return xssFilter(str, xssOptions).trim();
};

/**
 * Sanitize semua string fields dalam sebuah object.
 * Field yang ada di excludeFields tidak akan di-sanitize (misal: password).
 * @param {object} obj - Object yang field-field nya akan di-sanitize
 * @param {string[]} excludeFields - Field yang tidak perlu di-sanitize
 * @returns {object} - Object baru dengan field yang sudah di-sanitize
 */
export const sanitizeObject = (obj, excludeFields = []) => {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (excludeFields.includes(key)) {
            sanitized[key] = value;
        } else {
            sanitized[key] = sanitize(value);
        }
    }
    return sanitized;
};
