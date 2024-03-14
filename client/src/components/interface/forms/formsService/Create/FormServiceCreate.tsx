import React, { useRef, useState, useEffect } from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Service {
  name: string;
  price: string;
  time: string;
  _id: string; // Adicionado um campo 'id' para identificar cada serviço
}
const FormServiceCreate: React.FC<{ onClose: () => void; onServiceCreated: (newService: Service) => void }> = ({
  onClose,
  onServiceCreated,
}) => {
  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const formRef = useRef<HTMLDivElement | null>(null);


  const handleClose = () => {
    onClose();
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };


  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('https://sunx-api-agendamento.vercel.app/services/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, time, price }),
      });

      if (response.ok) {
        const data = await response.json();

        // Chame o callback para atualizar o estado no componente pai
        onServiceCreated(data);
        toast.success("O serviço foi adicionado!");
        setName("")
        setTime("")
        setPrice("")
      } else {
        console.error('Erro ao criar o serviço:', response.statusText);
        toast.error("Erro ao adicionar o serviço!");

      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error("Erro de rede ao adicionar o serviço!");

    }
  };


  return (
    <>
      <div ref={formRef} className="form-service-container">

        <ToastContainer />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-25 backdrop-blur-xl"></div>
          <section className="z-10 h-auto w-[90%] lg:w-auto md:w-auto rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 mx-auto bg-white shadow-lg dark:bg-gray-800">
            <div className="flex justify-between align-middle">
              <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">Criando serviço</h2>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="w-10 h-10 font-semibold leading-5 flex justify-center items-center text-white transition-colors duration-300 rounded-xl transform bg-red-700 hover:bg-red-600 focus:outline-none focus:bg-red-600"
                >
                  X
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
                <div>
                  <label className="text-gray-700 dark:text-gray-200" htmlFor="name">Nome do serviço</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-200" htmlFor="time">Tempo</label>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    required
                    onChange={(e) => setTime(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-200" htmlFor="price">Preço</label>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    required
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-8 py-2.5 font-semibold leading-5 rounded-xl text-white transition-colors duration-300 transform bg-green-700 hover:bg-green-600 focus:outline-none focus:bg-green-600"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

    </>
  );
};

export default FormServiceCreate;