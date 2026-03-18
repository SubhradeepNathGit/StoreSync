import React, { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

const FilterBar = ({
    filters,
    setFilters,
    sort,
    setSort,
    onClear,
    minPriceBound = 0,
    maxPriceBound = 50000,
}) => {
    const MIN_PRICE = Math.floor(minPriceBound);
    const MAX_PRICE = Math.ceil(maxPriceBound);

    const [sortOpen, setSortOpen] = useState(false);

    const handleMinPriceChange = (e) => {
        let value = parseInt(e.target.value);
        const maxValue = currentMaxPrice;
        const gap = Math.max(1, Math.round((MAX_PRICE - MIN_PRICE) * 0.01));
        if (value >= maxValue) value = maxValue - gap;
        if (value < MIN_PRICE) value = MIN_PRICE;
        setFilters(prev => ({ ...prev, minPrice: value.toString() }));
    };

    const handleMaxPriceChange = (e) => {
        let value = parseInt(e.target.value);
        const minValue = currentMinPrice;
        const gap = Math.max(1, Math.round((MAX_PRICE - MIN_PRICE) * 0.01));
        if (value <= minValue) value = minValue + gap;
        if (value > MAX_PRICE) value = MAX_PRICE;
        setFilters(prev => ({ ...prev, maxPrice: value.toString() }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFilters(prev => ({ ...prev, [name]: checked ? "true" : "" }));
    };

    const currentMinPrice = filters.minPrice ? parseInt(filters.minPrice) : MIN_PRICE;
    const currentMaxPrice = filters.maxPrice ? parseInt(filters.maxPrice) : MAX_PRICE;
    const hasActiveFilters = (currentMinPrice !== MIN_PRICE || currentMaxPrice !== MAX_PRICE) || filters.inStock || sort !== 'latest';

    
    const isSinglePrice = MIN_PRICE === MAX_PRICE;
    const sliderMin = isSinglePrice ? Math.max(0, MIN_PRICE - 100) : MIN_PRICE;
    const sliderMax = isSinglePrice ? MAX_PRICE + 100 : MAX_PRICE;
    const range = sliderMax - sliderMin;

    
    const ticks = Array.from({ length: 5 }, (_, i) =>
        Math.round(sliderMin + (i / 4) * range)
    );

    const formatTick = (val) => {
        if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
        return `${val}`;
    };

    const sortOptions = {
        'latest': 'Latest Arrivals',
        'price_asc': 'Price: Low to High',
        'price_desc': 'Price: High to Low',
        'a_z': 'Name: A - Z',
        'z_a': 'Name: Z - A'
    };

    
    const showPriceFilter = maxPriceBound > 0;

    return (
        <div className="flex flex-wrap items-center gap-3">

            {}
            <div className="relative z-20">
                <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-sm font-medium rounded-xl transition-all outline-none whitespace-nowrap"
                >
                    <span>{sortOptions[sort]}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>

                {sortOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                            {Object.entries(sortOptions).map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => { setSort(value); setSortOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sort === value ? 'text-slate-900 font-semibold bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {label}
                                    {sort === value && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {}
            {showPriceFilter && <div className="h-6 w-px bg-slate-200 hidden sm:block" />}

            {}
            {showPriceFilter && (
                <div className="flex flex-col w-64 gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Price Range</span>
                        <span className="text-slate-900 font-extrabold bg-slate-100 px-2 py-0.5 rounded-md">
                            ₹{currentMinPrice.toLocaleString('en-IN')} – ₹{currentMaxPrice.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="relative w-full h-6 flex items-center">
                        {}
                        <div className="absolute w-full flex justify-between px-1 -bottom-4">
                            {ticks.map((tick, index) => (
                                <span key={`${tick}-${index}`} className="text-[9px] font-bold text-slate-300">
                                    {formatTick(tick)}
                                </span>
                            ))}
                        </div>

                        <div className="absolute w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="absolute h-full bg-slate-900 rounded-full transition-all duration-300"
                                style={{
                                    left: `${((currentMinPrice - sliderMin) / range) * 100}%`,
                                    right: `${100 - ((currentMaxPrice - sliderMin) / range) * 100}%`
                                }}
                            />
                        </div>
                        <input
                            type="range"
                            min={sliderMin}
                            max={sliderMax}
                            step={Math.max(1, Math.round(range / 500))}
                            value={currentMinPrice}
                            onChange={handleMinPriceChange}
                            disabled={isSinglePrice}
                            className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0f172a] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0f172a] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-transparent disabled:opacity-0"
                        />
                        <input
                            type="range"
                            min={sliderMin}
                            max={sliderMax}
                            step={Math.max(1, Math.round(range / 500))}
                            value={currentMaxPrice}
                            onChange={handleMaxPriceChange}
                            disabled={isSinglePrice}
                            className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0f172a] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0f172a] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-transparent disabled:opacity-0"
                        />
                    </div>
                </div>
            )}

            {}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {}
            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <span className={`text-sm font-medium transition-colors ${filters.inStock ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        In Stock
                    </span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            name="inStock"
                            checked={filters.inStock === "true"}
                            onChange={handleCheckboxChange}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900 transition-colors" />
                    </div>
                </label>

                <div className={`transition-all duration-200 ${hasActiveFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                        onClick={onClear}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Clear Filters"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default FilterBar;
