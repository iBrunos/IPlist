"use client"
import CancelButton from '../../buttons/cancelButton/CancelButton';
import { useState, useEffect } from "react";

import React from 'react';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let appearanceID = "656fa85c97b4feec17489fc0";
interface Colors {
  dateTextColor: string;
  timeTextColor: string;
  employeeTextColor: string;
  serviceTextColor: string;
  priceTextColor: string;
  cardBackgroundColor: string;
}

type AgendamentoData = {
  _id: string;
  dateAndTime: string;
  time: string;
  nameEmployee: string;
  service: string;
  price: string;
};
interface UserScheduleCardProps {
  date: string;
  time: string;
  employee: string;
  service: string;
  price: string;
  index: number;
  deleteScheduleAndUpdate: () => void;
}
interface TimeSlot {
  _id: string;
  time: string;
  active: boolean;

}
interface Employee {
  _id: string;
  name: string;
  role: string;
  services: string;
  timeSlotsMonday: TimeSlot[];
  timeSlotsTuesday: TimeSlot[];
  timeSlotsWednesday: TimeSlot[];
  timeSlotsThursday: TimeSlot[];
  timeSlotsFriday: TimeSlot[];
  timeSlotsSaturday: TimeSlot[];
  timeSlotsSunday: TimeSlot[];
}
const dayFieldMapping: Record<number, keyof Employee> = {
  1: "timeSlotsMonday",
  2: "timeSlotsTuesday",
  3: "timeSlotsWednesday",
  4: "timeSlotsThursday",
  5: "timeSlotsFriday",
  6: "timeSlotsSaturday",
  0: "timeSlotsSunday",
};

const UserScheduleCard: React.FC<UserScheduleCardProps> = ({ date, time, employee, service, index, price, deleteScheduleAndUpdate}) => {
  const [scheduleData, setScheduleData] = useState<AgendamentoData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeIds, setEmployeeIds] = useState<{ [key: string]: Employee }>({});
  const [dateTextColor, setDateTextColor] = useState<string | null>(null);
  const [timeTextColor, setTimeTextColor] = useState<string | null>(null);
  const [employeeTextColor, setEmployeeTextColor] = useState<string | null>(null);
  const [serviceTextColor, setServiceTextColor] = useState<string | null>(null);
  const [priceTextColor, setPriceTextColor] = useState<string | null>(null);
  const [cardBackgroundColor, setCardBackgroundColor] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`https://sunx-api-agendamento.vercel.app/appearance/${appearanceID}`),
      fetch("https://sunx-api-agendamento.vercel.app/employees"),
    ])
      .then(([appearanceResponse, employeesResponse]) => Promise.all([appearanceResponse.json(), employeesResponse.json()]))
      .then(([appearanceData, employeesData]) => {
        // Processar dados da aparência
        setDateTextColor(appearanceData.dateTextColor);
        setTimeTextColor(appearanceData.timeTextColor);
        setEmployeeTextColor(appearanceData.employeeTextColor);
        setServiceTextColor(appearanceData.serviceTextColor);
        setPriceTextColor(appearanceData.priceTextColor);
        setCardBackgroundColor(appearanceData.cardBackgroundColor);

        // Processar dados dos funcionários
        const employeesMap: { [key: string]: Employee } = {};
        employeesData.forEach((employee: Employee) => {
          employeesMap[employee.name] = employee;
        });
        setEmployeeIds(employeesMap);
        const employeeNames = Object.keys(employeesMap);
        setEmployees(employeeNames.map((name) => employeesMap[name]));
      })
      .catch((error) => console.error('Erro ao buscar serviços e funcionários:', error));
  }, []); // Dependência vazia para garantir que este useEffect seja executado apenas uma vez


  // Renderiza o componente apenas se a cor estiver disponível
  if (dateTextColor === null || timeTextColor === null || employeeTextColor === null || serviceTextColor === null || priceTextColor === null || cardBackgroundColor === null) {
    return null; // ou algum indicador de carregamento, se preferir
  }

  function formatDate(dateString: string): string {
    const date: moment.Moment = moment(dateString);
    const formattedDate: string = date.format('DD/MM/YYYY');
    return formattedDate;
  }

  const deleteSchedule = async () => {
    try {
      // Obtenha o _id correspondente ao index do localStorage
      const localStorageData: AgendamentoData[] = JSON.parse(localStorage.getItem('agendamentoData') || '[]');
      const dateAndTime = localStorageData[index].dateAndTime;
      const selectedTime = localStorageData[index].time;
      const parsedDate = new Date(dateAndTime + 'T00:00:00.000-03:00'); // Adiciona o offset manualmente
      // Obtenha o dia da semana em UTC (0 para domingo, 1 para segunda, ...)
      const dayOfWeek = parsedDate.getUTCDay();
  
      let selectedDayField: keyof Employee;
      if (dayOfWeek in dayFieldMapping) {
        selectedDayField = dayFieldMapping[dayOfWeek];
      } else {
        console.error('Erro ao determinar selectedDayField. Dia:', dayOfWeek, 'Mapping:', dayFieldMapping);
        throw new Error('Erro ao determinar selectedDayField');
      }
      const dadosAtualizados: Record<string, any>[] = employees.map((emp) => {
        if (emp._id === employeeIds[employee]?._id) {
          const selectedFieldArray = emp[selectedDayField] as TimeSlot[];
      
          const updatedTimeSlots = selectedFieldArray.map((intervaloTempo: TimeSlot) =>
            intervaloTempo.time === selectedTime ? { ...intervaloTempo, active: true } : intervaloTempo
          );
          console.log(updatedTimeSlots)
          return {
            _id: emp._id, // Manter o _id para identificar o funcionário
            [selectedDayField]: updatedTimeSlots,
   
          };
        }
        return emp;
      });
   
      const dadosAtualizadosParaEnvio = dadosAtualizados[0];

      console.log("dadosAtualizados[0]: ",dadosAtualizados[0])
      
      await fetch(`https://sunx-api-agendamento.vercel.app/employees/${employeeIds[employee]?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          $set: {
            [selectedDayField]: dadosAtualizadosParaEnvio[selectedDayField],
          },
        }),
      });
      
      const _idToDelete = localStorageData[index]._id;
  
      // Exclua no banco de dados
      const response = await fetch(`https://sunx-api-agendamento.vercel.app/schedules/${_idToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Atualize o estado local
      const updatedData = localStorageData.filter(item => item._id !== _idToDelete);
      setScheduleData(updatedData);
  
      // Remova o item correspondente do localStorage
      const updatedLocalStorageData = localStorageData.filter((item: AgendamentoData) => item._id !== _idToDelete);
      localStorage.setItem('agendamentoData', JSON.stringify(updatedLocalStorageData));
      alert('Seu agendamento foi cancelado!');
      // Chame a nova propriedade para atualizar o componente Schedule
      deleteScheduleAndUpdate();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cancelar o agendamento');
    }
  };
  
  return (
    <>
      <ToastContainer />
      <div className="rounded-xl p-4 mt-4 w-full mx-auto shadow-md"
      style={{ backgroundColor: cardBackgroundColor }}
      >
        {/* Linha superior */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <p className="font-bold text-lg"
            style={{color: dateTextColor}}
            >{formatDate(date)}</p>
            <p
            style={{color: timeTextColor}}
            >{time}</p>
          </div>
          <CancelButton onClick={() => deleteSchedule()} text="Cancelar" />

        </div>

        {/* Linha do employee */}
        <p className="text-left text-xl font-semibold"
        style={{color: employeeTextColor}}
        >{employee}</p>

        {/* Linha do service e price */}
        <div className="flex justify-between">
          <p className=" text-lg"
          style={{color: serviceTextColor}}
          >{service}</p>
          <p className=" text-lg "
          style={{color: priceTextColor}}
          >R${price},00</p>
        </div>
      </div>
    </>
  );
};

export default UserScheduleCard;