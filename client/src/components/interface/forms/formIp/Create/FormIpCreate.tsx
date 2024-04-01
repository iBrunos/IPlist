import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Ip {
    ip: string;
    description: string;
    disabled: boolean;
    createdAt: string;
    updatedAt: string;
}

const FormIpCreate: React.FC<{
    onClose: () => void;
    onIpCreated: (newIp: Ip) => void;
}> = ({ onClose, onIpCreated }) => {
    const [ip, setIp] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [cidr, setCidr] = useState<string>("");
    const [disabled, setdisabled] = useState<boolean>(false);
    const [createdAt, setCreatedAt] = useState<string>("");
    const [updatedAt, setUpdatedAt] = useState<string>("");
    const [user, setUser] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);

    const handleChangeCidr = (e: ChangeEvent<HTMLInputElement>): void => {
        const { value } = e.target;
        if (!isNaN(Number(value))) {
            setCidr(value);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value: string = e.target.value;
        const formattedValue: string = value.replace(/[^\d./]/g, '');
        const parts: string[] = formattedValue.split(/\.|\//);
        const formattedIp: string = parts
            .slice(0, 4)
            .map((part: string) => part.slice(0, 3))
            .join('.')
            .replace(/\.+/g, '.');

        setIp(formattedIp);
    };

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current !== null) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Verifica se o IP é 0.0.0.0/0
        if (ip === "0.0.0.0" && cidr === "0") {
            toast.error("Você não pode adicionar o 0.0.0.0/0");
            setIp("");
            setDescription("");
            setCidr("");
            setdisabled(false);
            setCreatedAt("");
            setUpdatedAt("");
            setShowModal(true); // Exibe o modal
            return; // Interrompe a execução do restante da função
        }
    
        try {
            // Ler o valor de username dos cookies
            const cookies = document.cookie.split(';');
            let username = '';
            cookies.forEach(cookie => {
                const [key, value] = cookie.split('=');
                if (key.trim() === 'userName') {
                    username = value;
                   
                }
            });

            const currentDate = new Date();
            const formattedCreatedAt = currentDate.toISOString();
            const formattedUpdatedAt = currentDate.toISOString();
    
            const requestBody = {
                ip: cidr ? `${ip}/${cidr}` : ip,
                description: `${description} (por: ${username})`, // Adicionando username à descrição
                disabled,
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
                setCidr("");
                setdisabled(false);
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
    

    const confirmDelete = () => {
        setShowModal(false);
        // Aqui você pode adicionar qualquer ação que deseja realizar após a confirmação.
    };

    const cancelDelete = () => {
        setShowModal(false);
        // Aqui você pode adicionar qualquer ação que deseja realizar após o cancelamento.
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
                                <div className='flex'>
                                    <input
                                        id="ip"
                                        type="text"
                                        ref={inputRef}
                                        value={ip}
                                        required
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                                    />
                                    <span className="flex items-center ml-4 px-2 text-4xl text-gray-700 dark:text-gray-200">/</span>
                                </div>
                            </div>
                            <div>
                                <label
                                    className="text-gray-700 dark:text-gray-200"
                                    htmlFor="username"
                                >
                                    Cidr
                                </label>
                                <input
                                    id="ip"
                                    type="number"
                                    value={cidr}
                                    onChange={handleChangeCidr}
                                    className="block w-20 px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                                    min={16}
                                    max={32}
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