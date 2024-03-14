import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from 'framer-motion';

// Definindo as propriedades que este componente recebe
interface DateCardProps {
  date: Date; // A data a ser exibida no cartão
  selected: boolean; // Se o cartão está selecionado
  onClick: () => void; // Função a ser chamada quando o cartão é clicado
}

const DateCard: React.FC<DateCardProps> = ({ date, selected, onClick }) => {
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{
        duration: 8.0, // Duração da animação
        type: "spring", // Tipo de animação
        stiffness: 260, // Rigidez da animação
        damping: 40, // Amortecimento da animação
        delay: 1.2, // Atraso antes do início da animação
      }}
      className={`p-4 rounded shadow-lg bg-[#2E4863] text-white cursor-pointer w-40 mr-2 ${
        selected ? "bg-gray-900" : "bg-[#2E4863]" // Estilização condicional com base na seleção do cartão
      } cursor-pointer`}
      onClick={onClick} // Quando o cartão é clicado, chama a função onClick
    >
      <span>{format(date, "PPP", { locale: ptBR })}</span> {/* Exibe a data no formato PPP (dia, mês e ano) com base no locale ptBR */}
    </motion.div>
  );
};

export default DateCard;
