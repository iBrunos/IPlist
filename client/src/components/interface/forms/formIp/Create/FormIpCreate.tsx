import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Ip {
    ip: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const FormIpCreate: React.FC<{
    onClose: () => void;
    onIpCreated: (newIp: Ip) => void;
}> = ({ onClose, onIpCreated }) => {
    const [ip, setIp] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(false);
    const [createdAt, setCreatedAt] = useState<string>("");
    const [updatedAt, setUpdatedAt] = useState<string>("");
    const [nameEmployee, setNameEmployee] = useState<string>("");
  
    useEffect(() => {
        // Preencher automaticamente a descrição com o valor do localStorage para o campo nameEmployee
        const storedNameEmployee = localStorage.getItem('nameEmployee');
        if (storedNameEmployee) {
            setNameEmployee(storedNameEmployee);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Preencher as datas automaticamente
            const currentDate = new Date();
            const formattedCreatedAt = currentDate.toISOString(); // Formato ISO 8601
            const formattedUpdatedAt = currentDate.toISOString(); // Formato ISO 8601
    
            const requestBody = {
                ip,
                description: description + " (por: " + nameEmployee + ")",
                isActive,
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt,
            };
    
            const response = await fetch('http://localhost:3001/ips/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    

            if (response.ok) {
                const data = await response.json();
                onIpCreated(data);

                setIp("");
                setDescription("");
                setIsActive(false);
                setCreatedAt("");
                setUpdatedAt("");

                toast.success("O Ip foi adicionado!");
            } else {
                console.error('Erro ao criar o Ip:', response.statusText);
                toast.error("Erro ao adicionar o Ip!");
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            toast.error("Erro de rede ao adicionar o Ip!");
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="fixed inset-0 z-50 flex items-center justify-center ">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <section className="z-10 h-auto w-[90%] lg:w-auto md:w-auto rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 mx-auto bg-white shadow-lg dark:bg-gray-800">
                    <div className="flex justify-between align-middle">
                        <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">
                            Criando Ip
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
                                    IP
                                </label>
                                <input
                                    id="ip"
                                    type="text"
                                    value={ip}
                                    required
                                    onChange={(e) => setIp(e.target.value)}
                                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                                />
                            </div>
                            <div>
                                <label
                                    className="text-gray-700 dark:text-gray-200"
                                    htmlFor="username"
                                >
                                    Descrição
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    required
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
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

export default FormIpCreate;
