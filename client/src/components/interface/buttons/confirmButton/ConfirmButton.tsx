import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Definindo as propriedades que este componente recebe
interface ConfirmButtonProps {
  onClick: () => void; // Função a ser chamada quando o botão é clicado
  text: string; // Texto a ser exibido no botão
}

let appearanceID = "656fa85c97b4feec17489fc0";

interface Colors {
  botMessageBackgroundColor: string;
  clientMessageBackgroundColor: string;
  buttonBackgroundColor: string;
  buttonHoverColor: string;
  backgroundColor: string;
  pageTextColor: string;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ onClick, text }) => {
  const [buttonBackgroundColor, setbuttonBackgroundColor] = useState<string | null>(null);
  const [pageTextColor, setPageTextColor] = useState<string | null>(null);
  const [buttonHoverColor, setButtonHoverColor] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    // Faça a chamada à API para buscar os serviços
    fetch(`https://sunx-api-agendamento.vercel.app/appearance/${appearanceID}`)
      .then((response) => response.json())
      .then((data: Colors) => {
        setbuttonBackgroundColor(data.buttonBackgroundColor);
        setPageTextColor(data.pageTextColor);
        setButtonHoverColor(data.buttonHoverColor);
      })
      .catch((error) => console.error('Erro ao buscar serviços:', error));
  }, []);

  // Renderiza o componente apenas se a cor estiver disponível
  if (buttonBackgroundColor === null || pageTextColor === null || buttonHoverColor === null) {
    return null; // ou algum indicador de carregamento, se preferir
  }

  return (
    <motion.div
      transition={{
        duration: 8.0, // Duração da animação
        delay: 1.0, // Atraso antes do início da animação
      }}
    >
      <div className="flex justify-center items-center w-full">
        <button
          className={`py-2 pl-2 w-full font-semibold text-sm rounded transition duration-300 ease-in-out justify-evenly`}
          style={{ backgroundColor: isHovered ? buttonHoverColor : buttonBackgroundColor }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick} // Quando o botão é clicado, chama a função onClick
        >
          <p className={`mr-2`}
            style={{ color: pageTextColor }}
          >{text}</p> {/* Exibe o texto no botão */}
        </button>
      </div>
    </motion.div>
  );
};

export default ConfirmButton;