import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Ip {
    ip: string;
    description: string;
    disabled: boolean;
    createdAt: string;
    updatedAt: string;
}

interface FormIpUpdateProps {
    ip: Ip | null;
    onClose: () => void;
    onUpdateIp: (updatedIp: Ip) => void;
}

const FormIpUpdate: React.FC<FormIpUpdateProps> = ({ ip: ipData, onClose, onUpdateIp }) => {

    const extractDescription = (fullDescription: string) => {
        return fullDescription.split('(por:')[0].trim();
    };

    const [ip, setIp] = useState<string>(ipData ? ipData.ip : "");
    const [description, setDescription] = useState<string>(ipData ? extractDescription(ipData.description) : "");
    const [disabled, setdisabled] = useState<boolean>(ipData ? ipData.disabled : true);
    const [createdAt, setCreatedAt] = useState<string>(ipData ? ipData.createdAt : "");
    const [updatedAt, setUpdatedAt] = useState<string>(ipData ? ipData.updatedAt : "");
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
            if (!ipData) {
                return;
            }
            const currentDate = new Date();
            const formattedCreatedAt = currentDate.toISOString(); // Formato ISO 8601
            const formattedUpdatedAt = currentDate.toISOString(); // Formato ISO 8601
            // Ler o valor de username dos cookies
            const cookies = document.cookie.split(';');
            let username = '';
            cookies.forEach(cookie => {
                const [key, value] = cookie.split('=');
                if (key.trim() === 'userName') {
                    username = value;

                }
            });
            const updatedIp = {
                ip,
                description: `${description} (por: ${username})`,
                disabled,
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt,
            };
            const encodedIP = encodeURIComponent(ipData.ip);

            const response = await fetch(`http://localhost:3001/ips/${encodedIP}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedIp),
            });
            if (response.ok) {
                toast.success("O IP foi atualizado!");
                onUpdateIp(updatedIp); // Chame a função para atualizar o IP na lista
                onClose();
            } else {
                console.error('Erro ao atualizar o IP:', response.statusText);
                toast.error("Erro ao atualizar o IP!");
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            toast.error("Erro de rede ao atualizar o IP!");
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <section className="z-10 rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[90vh] sm:h-auto overflow-y-auto w-[90%] lg:w-[50%] p-6 mx-auto bg-white shadow-lg dark:bg-gray-800">
                    <div className="flex justify-between align-middle">
                        <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">
                            Atualizando IP
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
                                    htmlFor="ip"
                                >
                                    IP
                                </label>
                                <input
                                    id="ip"
                                    type="text"
                                    value={ip}
                                    required
                                    onChange={(e) => { setIp(e.target.value); }}
                                    className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                                />
                            </div>
                            <div>
                                <label
                                    className="text-gray-700 dark:text-gray-200"
                                    htmlFor="description"
                                >
                                    Descrição
                                </label>
                                <input
                                    id="description"
                                    type="text"
                                    value={description}
                                    required
                                    onChange={(e) => setDescription(e.target.value)}
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

export default FormIpUpdate;
