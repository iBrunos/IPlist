import { useState } from 'react';

const Cookies: React.FC = () => {
    const [showCookies, setShowCookies] = useState(true);

    const handleCloseCookies = () => {
        setShowCookies(false);
    };

    const handleAcceptAllCookies = () => {
        // Lógica para aceitar todos os cookies
        setShowCookies(false);
    };

    const handleRejectCookies = () => {
        // Lógica para rejeitar todos os cookies
        setShowCookies(false);
    };

    return (
        <>
            {showCookies && (
                <div className="absolute bottom-10 left-20 max-w-sm px-4 py-2 shadow-md transition-all rounded-2xl duration-500 ease-in-out bg-gray-200">
                    <div className="flex flex-col px-0 ltr:lg:pl-10 rtl:lg:pr-10">
                        <div className="w-full flex justify-between items-center">
                            <p className="text-md md:text-lg font-semibold m-0">Este site utiliza cookies 🍪</p>
                        </div>
                        <div className="flex flex-col gap-2 items-stretch ltr:lg:pr-10 rtl:lg:pl-10">
                            <div className="flex-1">
                                <p className="my-1 text-xs md:text-sm">
                                    Ao clicar em “Aceitar tudo”, você concorda com o armazenamento de cookies em seu dispositivo para fins funcionais, analíticos e publicitários.
                                </p>
                            </div>
                            <div className="flex flex-col justify-around mt-4 lg:mt-0 ltr:lg:pl-14 rtl:lg:pr-14">
                                <div className="flex-1 gap-2  items-center flex my-0">
                                    <button onClick={handleRejectCookies} className="flex-1 lg:flex-none ltr:mr-2 rtl:ml-2 hover:bg-gray-300 flex justify-center items-center text-center cursor-pointer px-2 md:px-4 py-2 border border-transparent text-xs leading-4 font-black">
                                        <span>Não aceitar</span>
                                    </button>
                                    <button onClick={handleAcceptAllCookies} className="flex-1 lg:flex-none hover:bg-gray-300 flex justify-center items-center text-center cursor-pointer px-2 md:px-4 py-2 border border-transparent text-xs leading-4 font-black">
                                        <span>Aceitar tudo</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Cookies;