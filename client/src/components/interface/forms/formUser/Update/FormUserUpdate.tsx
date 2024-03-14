import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}

interface FormUserUpdateProps {
  user: User | null;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const FormUserUpdate: React.FC<FormUserUpdateProps> = ({ user, onClose, onUpdateUser }) => {
  const [name, setName] = useState<string>(user ? user.name : "");
  const [email, setEmail] = useState<string>(user ? user.email : "");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

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
      if (!user) {
        return;
      }

      const updatedUser = { ...user, name, password, email };


      const response = await fetch(`https://sunx-api-agendamento.vercel.app/Users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        toast.success("O usuárop foi atualizado!");
        onUpdateUser(updatedUser); // Chame a função para atualizar o usuárop na lista
        onClose();
      } else {
        console.error('Erro ao atualizar o usuário:', response.statusText);
        toast.error("Erro ao atualizar o usuário!");
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error("Erro de rede ao atualizar o usuário!");
    }
  };
  const generateTimeOptions = () => {
    const options: JSX.Element[] = [];
    const startDateTime = new Date();
    startDateTime.setHours(8, 0, 0); // Start at 08:00

    const endDateTime = new Date();
    endDateTime.setHours(18, 0, 0); // End at 18:00

    const interval = 30; // Time interval in minutes

    let currentTime = new Date(startDateTime);

    while (currentTime <= endDateTime) {
      const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      options.push(
        <option key={formattedTime} value={formattedTime}>
          {formattedTime}
        </option>
      );

      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    return options;
  };
  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <section className="z-10 h-[90vh] sm:h-auto  overflow-y-auto w-[90%] lg:w-[50%] rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 mx-auto bg-white shadow-lg dark:bg-gray-800">
          <div className="flex justify-between align-middle">
            <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">
              Atualizando usuário
            </h2>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="w-10 h-10 font-semibold leading-5 flex justify-center items-center text-white transition-colors duration-300 rounded-xl transform bg-red-700 hover:bg-red-600 focus:outline-none focus:bg-red-600"
              >
                X
              </button>
            </div>
          </div>

          <form className="" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
              <div>
                <label
                  className="text-gray-700 dark:text-gray-200"
                  htmlFor="username"
                >
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                />
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-200" htmlFor="password">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-4 py-2 mt-2 text-gray-700  rounded-md dark:bg-gray-800 dark:text-gray-300 "
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  className="text-gray-700 dark:text-gray-200"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="name"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button className="px-8 py-2.5 font-semibold leading-5 rounded-xl text-white transition-colors duration-300 transform bg-green-700 hover-bg-green-600 focus:outline-none focus-bg-green-600">
              Atualizar
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};

export default FormUserUpdate;