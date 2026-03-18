const preloadedImages = new Set();

/**
 * Preloads an image by creating an Image object.
 * This ensures the image is cached by the browser and ready to be displayed.
 * @param {string} url - The URL of the image to preload.
 * @returns {Promise<void>}
 */
export const preloadImage = (url) => {
    if (!url || preloadedImages.has(url)) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            preloadedImages.add(url);
            resolve();
        };
        img.onerror = reject;
        img.src = url;

        
        
        img._gc_guard = img;
    });
};

/**
 * Preloads a list of images.
 * @param {string[]} urls - Array of image URLs to preload.
 */
export const preloadImages = (urls) => {
    if (!urls || !Array.isArray(urls)) return;
    urls.forEach(url => preloadImage(url).catch(err => console.warn(`Failed to preload: ${url}`, err)));
};

export default {
    preloadImage,
    preloadImages
};
