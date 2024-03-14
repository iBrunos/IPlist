import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateCardAdminProps {
  date: Date;
  selected: boolean;
  onClick: () => void;
}

const DateCardAdmin: React.FC<DateCardAdminProps> = ({ date, selected, onClick }) => {
  return (
    <div 
      className={`p-4 rounded shadow-lg text-black cursor-pointer w-40 border-2 border-gray-400 hover:bg-gray-400 mr-2 ${
        selected ? "bg-gray-400" : "bg-white"
      }`}
      onClick={onClick}
    >
      <span>{format(date, "PPP", { locale: ptBR })}</span>
    </div>
  );
};

export default DateCardAdmin;
