import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", 
    isLoading = false
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        let timer;
        if (isOpen) {
            timer = setTimeout(() => setIsAnimating(true), 10);
            document.body.style.overflow = 'hidden';
        } else {
            timer = setTimeout(() => setIsAnimating(false), 300);
            document.body.style.overflow = 'unset';
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    const iconColor = type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600';
    const confirmButtonColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-100';

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        >
            {}
            <div
                className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {}
            <div
                className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    {}
                    <div className={`w-14 h-14 ${iconColor} rounded-2xl flex items-center justify-center mb-6`}>
                        {type === 'danger' ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                    </div>

                    {}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-6 py-3.5 ${confirmButtonColor} text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
