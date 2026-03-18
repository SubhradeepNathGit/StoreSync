import React, { useState, useEffect } from 'react';

/**
 * OptimizedImage component that handles loading states, fade-ins, and layout shifts.
 */
const OptimizedImage = ({
    src,
    alt,
    className = "",
    containerClassName = "",
    aspectRatio = "1/1",
    objectFit = "contain"
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) return;

        
        const img = new Image();
        img.src = src;
        if (img.complete) {
            setTimeout(() => { setIsLoaded(true); setError(false); }, 0);
        } else {
            img.onload = () => { setIsLoaded(true); setError(false); };
            img.onerror = () => { setError(true); setIsLoaded(false); };
        }
    }, [src]);

    const placeholderUrl = `https://via.placeholder.com/300`;

    return (
        <div
            className={`relative overflow-hidden ${containerClassName}`}
            style={{ aspectRatio }}
        >
            {}
            <div
                className={`absolute inset-0 bg-slate-100 transition-opacity duration-500 flex items-center justify-center ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
            >
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
            </div>

            {}
            {error && (
                <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image Unavailable</span>
                </div>
            )}

            {}
            {!error && (
                <img
                    src={src || placeholderUrl}
                    alt={alt}
                    className={`w-full h-full transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        } ${className}`}
                    style={{ objectFit }}
                    loading="lazy"
                />
            )}
        </div>
    );
};

export default OptimizedImage;
