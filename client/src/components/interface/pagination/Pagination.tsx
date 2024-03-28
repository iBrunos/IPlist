import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Função para gerar os números das páginas
  const generatePageNumbers = (): JSX.Element[] => {
    const pages: JSX.Element[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <a
          key={i}
          href="#"
          className={`px-4 py-2 mx-1 text-gray-700 transition-colors duration-300 transform bg-white rounded-md sm:inline dark:bg-gray-800 dark:text-gray-200 hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white dark:hover:text-gray-200 ${currentPage === i ? 'font-bold' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </a>
      );
    }
    return pages;
  };

  return (      
    <div className="flex justify-center">
      <a
        href="#"
        className={`px-4 py-2 mx-1 text-gray-700 capitalize bg-white rounded-md dark:bg-gray-800 dark:text-gray-600 ${currentPage === 1 ? 'hidden' : ''}`}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <div className="flex items-center -mx-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-1 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span className="mx-1">Previous</span>
        </div>
      </a>

      {generatePageNumbers()}

      <a
        href="#"
        className={`px-4 py-2 mx-1 text-gray-700 transition-colors duration-300 transform bg-white rounded-md dark:bg-gray-800 dark:text-gray-200 hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white dark:hover:text-gray-200 ${currentPage === totalPages ? 'cursor-not-allowed' : ''}`}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto' }}
      >
        <div className="flex items-center -mx-1">
          <span className="mx-1">Next</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-1 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </a>
    </div>
  );
};

export default Pagination;
