import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

let appearanceID = "656fa85c97b4feec17489fc0";
interface Colors {
  text_A_Color: string;
  text_B_Color: string;
  dateTextColor: string;
  timeTextColor: string;
  employeeTextColor: string;
  serviceTextColor: string;
  priceTextColor: string;
  cancelButtonTextColor: string;
  cancelButtonBackgroundColor: string;
  cancelButtonHoverColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
}


interface CancelButtonProps {
  text: string; // Texto a ser exibido no botão
  onClick: () => void;
}

const CancelButton: React.FC<CancelButtonProps> = ({ text, onClick }) => {
  const [cancelButtonTextColor, setCancelButtonTextColor] = useState<string | null>(null);
  const [cancelButtonBackgroundColor, setCancelButtonBackgroundColor] = useState<string | null>(null);
  const [cancelButtonHoverColor, setCancelButtonHoverColor] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    // Faça a chamada à API para buscar os serviços
    fetch(`https://sunx-api-agendamento.vercel.app/appearance/${appearanceID}`)
      .then((response) => response.json())
      .then((data: Colors) => {
        setCancelButtonTextColor(data.cancelButtonTextColor);
        setCancelButtonBackgroundColor(data.cancelButtonBackgroundColor);
        setCancelButtonHoverColor(data.cancelButtonHoverColor);
      })
      .catch((error) => console.error('Erro ao buscar serviços:', error));
  }, []);

  // Renderiza o componente apenas se a cor estiver disponível
  if (cancelButtonTextColor === null || cancelButtonBackgroundColor === null || cancelButtonHoverColor === null) {
    return null; // ou algum indicador de carregamento, se preferir
  }

  return (
    <motion.div
      transition={{
        duration: 0.8, // Duração da animação
        delay: 0.1, // Atraso antes do início da animação
      }}
    >
      <div className="flex justify-center items-center w-full">
        <button
          className="py-2 pl-2 w-full font-semibold text-sm rounded transition duration-300 ease-in-out justify-evenly"
          style={{ backgroundColor: isHovered ? cancelButtonHoverColor : cancelButtonBackgroundColor }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
        >
          <p className="mr-2"
            style={{ color: cancelButtonTextColor }}
          >{text}</p> {/* Exibe o texto no botão */}
        </button>
      </div>
    </motion.div>
  );
};

export default CancelButton;