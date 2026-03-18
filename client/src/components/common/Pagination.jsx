import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, setPage, totalPages }) => {
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const handlePrevious = () => {
    if (canGoPrev) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 py-6">
      {}
      <div className="text-xs font-semibold text-slate-500 order-2 sm:order-1 uppercase tracking-wider">
        Page <span className="text-slate-900">{page}</span> of{' '}
        <span className="text-slate-900">{totalPages}</span>
      </div>

      {}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrev}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 text-sm ${canGoPrev
            ? 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {}
        <div className="hidden md:flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-slate-400 text-sm font-medium">
                  ...
                </span>
              );
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`w-9 h-9 rounded-xl font-semibold text-sm transition-all ${page === pageNum
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {}
        <div className="md:hidden w-9 h-9 bg-slate-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center">
          {page}
        </div>

        {}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 text-sm ${canGoNext
            ? 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
