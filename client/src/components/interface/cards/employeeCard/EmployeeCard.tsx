import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';

let appearanceID = "656fa85c97b4feec17489fc0";
interface Colors {
  backgroundColor: string;
  employeeCardBackgroundColor: string;
  cardsTextColor: string;
}
interface EmployeeCardProps {
  name: string;
  active: boolean;
  toggleEmployees: () => void;
  onClick: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ name, active, toggleEmployees, onClick }) => {
  const [employeeCardBackgroundColor, setEmployeeCardBackgroundColor] = useState<string | null>(null);
  const [cardsTextColor, setCardsTextColor] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleCardClick = () => {
    toggleEmployees();
    onClick();
  };

  useEffect(() => {
    // Faça a chamada à API para buscar os serviços
    fetch(`https://sunx-api-agendamento.vercel.app/appearance/${appearanceID}`)
      .then((response) => response.json())
      .then((data: Colors) => {
        setEmployeeCardBackgroundColor(data.employeeCardBackgroundColor);
        setCardsTextColor(data.cardsTextColor);
      })
      .catch((error) => console.error('Erro ao buscar serviços:', error));
  }, []);

  // Renderiza o componente apenas se a cor estiver disponível
  if (employeeCardBackgroundColor === null || cardsTextColor === null) {
    return null; // ou algum indicador de carregamento, se preferir
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{
        duration: 8.0,
        type: "spring",
        stiffness: 260,
        damping: 40,
        delay: 1.2,
      }}
      className={`p-4 rounded shadow-lg cursor-pointer hover:bg-gray-900`}
      style={{ backgroundColor: active ? "#111827" : employeeCardBackgroundColor }}
      onClick={handleCardClick}
    >
      <div>
        <p className={`text-base font-semibold`}
        style ={{ color: cardsTextColor}}
        >
          {name}
        </p>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;