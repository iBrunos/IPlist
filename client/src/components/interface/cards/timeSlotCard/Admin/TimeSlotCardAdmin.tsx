import React from 'react';

// Definindo as propriedades que este componente recebe
interface TimeSlotCardProps {
  time: string; // O tempo a ser exibido no cartão
  active: boolean; // Se o cartão está ativo
  selectedTime: string | null; // O tempo selecionado
  handleTimeClick: (time: string) => void; // Função para lidar com o clique no cartão de tempo
}

const TimeSlotCardAdmin: React.FC<TimeSlotCardProps> = ({ time, active, selectedTime, handleTimeClick }) => {

  const isSelected = selectedTime === time;
  return (
    <div
    className={`rounded-xl mt-2 w-[4rem] ${
      active ? (isSelected ? "bg-gray-400 text-black" : "bg-white") : "bg-[#CBD5E1]"
    } border-2 border-gray-400 cursor-pointer hover:bg-gray-400 hover:text-[#CBD5E1] transition-all duration-300`}
    onClick={() => handleTimeClick(time)}
  >
    <div className="text-center">
      {time}
    </div>
  </div>
  );
};

export default TimeSlotCardAdmin;