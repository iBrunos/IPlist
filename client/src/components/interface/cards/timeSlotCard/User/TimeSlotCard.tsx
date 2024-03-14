import React from 'react';

// Definindo as propriedades que este componente recebe
interface TimeSlotCardProps {
  time: string; // O tempo a ser exibido no cartão
  active: boolean; // Se o cartão está ativo
  selectedTime: string | null; // O tempo selecionado
  handleTimeClick: (time: string) => void; // Função para lidar com o clique no cartão de tempo
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ time, active, selectedTime, handleTimeClick }) => {
  return (
    <button
      className={`rounded-xl mt-2 w-[4rem] ${
        active ? "bg-[#2E4863]" : "bg-[#CBD5E1]" // Estilização condicional com base na ativação do cartão
      } ${selectedTime === time ? "bg-gray-900 text-white" : "text-black"} border-2 border-[#2E4863] hover:bg-gray-900 hover:text-[#CBD5E1] transition-all duration-300`}
      onClick={() => handleTimeClick(time)} // Quando o botão é clicado, chama a função handleTimeClick
    >
      <div className="text-center">
        {time} {/* Exibe o tempo no centro do botão */}
      </div>
    </button>
  );
};

export default TimeSlotCard;