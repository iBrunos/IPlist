"use client"
import React, { useState, useEffect } from 'react';
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

const FormUserCreate: React.FC<{
  onClose: () => void;
  onUserCreated: (newUser: User) => void;
}> = ({ onClose, onUserCreated }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const requestBody = {
        name,
        password,
        email
      };
      if (password.length < 8 || !/[A-Z]/.test(password)) {
        toast.error("A senha deve ter pelo menos 8 caracteres e conter pelo menos uma letra maiúscula.");
        return;
      }
      const response = await fetch('https://sunx-api-agendamento.vercel.app/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        onUserCreated(data);

        setName("");
        setEmail("");
        setPassword("");
        toast.success("O usuário foi adicionado!");
      } else {
        console.error('Erro ao criar o usuário:', response.statusText);
        toast.error("Erro ao adicionar o usuário!");
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error("Erro de rede ao adicionar o usuário!");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <section className="z-10 h-[90vh] sm:h-auto  overflow-y-auto w-[90%] lg:w-[50%] rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 mx-auto bg-white shadow-lg dark:bg-gray-800">
          <div className="flex justify-between align-middle">
            <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">
              Criando usuário
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
                  required               
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
                    required
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
                  htmlFor="username"
                >
                  Email
                </label>
                <input
                  id="name"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end items-end mt-4">
              <button className="px-8 py-2.5 font-semibold leading-5 rounded-xl text-white transition-colors duration-300 transform bg-green-700 hover-bg-green-600 focus:outline-none focus-bg-green-600">
                Adicionar
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};

export default FormUserCreate;