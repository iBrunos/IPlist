import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';

let appearanceID = "656fa85c97b4feec17489fc0";
interface Colors {
  backgroundColor: string;
  serviceCardBackgroundColor: string;
  cardsTextColor: string;
}

interface ServiceCardProps {
  name: string;
  price: string;
  time: string;
  active: boolean;
  toggleService: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ name, price, time, active, toggleService }) => {
  const [serviceCardBackgroundColor, setServiceCardBackgroundColor] = useState<string | null>(null);
  const [cardsTextColor, setCardsTextColor] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

    function formatServiceTime(time: string): string {
        const [hours, minutes] = time.split(":");
        const hoursInt = parseInt(hours, 10);
        const minutesInt = parseInt(minutes, 10);
    
        const formattedHours =
          hoursInt > 0 ? `${hoursInt} hr${hoursInt > 1 ? "s" : ""}` : "";
        const formattedMinutes =
          minutesInt > 0 ? `${minutesInt} min${minutesInt > 1 ? "s" : ""}` : "";
    
        if (formattedHours && formattedMinutes) {
          return `${formattedHours} e ${formattedMinutes}`;
        } else {
          return formattedHours || formattedMinutes || "Formato de tempo inválido";
        }
      }

      useEffect(() => {
        // Faça a chamada à API para buscar os serviços
        fetch(`https://sunx-api-agendamento.vercel.app/appearance/${appearanceID}`)
          .then((response) => response.json())
          .then((data: Colors) => {
            setServiceCardBackgroundColor(data.serviceCardBackgroundColor);
            setCardsTextColor(data.cardsTextColor);
          })
          .catch((error) => console.error('Erro ao buscar serviços:', error));
      }, []);
    
      // Renderiza o componente apenas se a cor estiver disponível
      if (serviceCardBackgroundColor === null || cardsTextColor === null) {
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
            delay: 0.9,
          }}
          className="p-4 rounded shadow-lg cursor-pointer"
          style={{
            backgroundColor: isHovered ? "#111827" : active ? "#111827" : serviceCardBackgroundColor,
            color: cardsTextColor,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={toggleService}
        >
          <div>
            <h3 className="text-lg font-semibold">
              {name}
            </h3>
            <p className="text-sm mt-2">
              R$ {price},00
            </p>
          </div>
          <div className="mt-1 text-right">
            <p className="text-sm">
              {formatServiceTime(time)}
            </p>
          </div>
        </motion.div>
      );
    };
    
    export default ServiceCard;