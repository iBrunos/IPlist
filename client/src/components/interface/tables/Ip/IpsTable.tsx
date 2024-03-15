import React, { useState, useEffect } from 'react';
import FormIpCreate from '../../forms/formIp/Create/FormIpCreate';
import FormIpUpdate from '../../forms/formIp/Update/FormIpUpdate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { isValid } from 'date-fns';
interface Ip {
  ip: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const IpsTable: React.FC = () => {
  const [showAddIp, setShowAddIp] = useState(false);
  const [ips, setIps] = useState<Ip[]>([]); // Initialize with an empty array
  const [editingIp, setEditingIp] = useState<Ip | null>(null);
  const [showEditIp, setShowEditIp] = useState(false);
  const [confirmDeleteIp, setConfirmDeleteIp] = useState<Ip | null>(null);

  const handleEditIpClick = (ip: Ip) => {
    setEditingIp(ip);
    setShowEditIp(true);
  };

  const handleCloseEditIp = () => {
    setEditingIp(null);
    setShowEditIp(false);
    // Atualiza a tabela chamando a API novamente
    fetch("http://localhost:3001/ips")
      .then((response) => response.json())
      .then((data) => {
        setIps(data);
      })
      .catch((error) => console.error("Erro ao buscar ips:", error));
  };

  const handleAddIpClick = () => {
    setShowAddIp(true);
  };
  const fetchIps = async () => {
    try {
      const response = await fetch('http://localhost:3001/ips');
      if (response.ok) {
        const data = await response.json();
        setIps(data);
      } else {
        console.error('Erro ao buscar os IPs:', response.statusText);
        toast.error("Erro ao buscar os IPs!");
      }
    } catch (error) {
      console.error('Erro de rede ao buscar os IPs:', error);
      toast.error("Erro de rede ao buscar os IPs!");
    }
  };
  const handleIpCreated = (newIp: Ip) => {
    fetchIps();
    setIps([...ips, newIp]);
  };

  
  const handleCloseAddIps = () => {
    setShowAddIp(false);
    // Atualiza a tabela chamando a API novamente
    fetch("http://localhost:3001/ips")
      .then((response) => response.json())
      .then((data) => {
        setIps(data);
      })
      .catch((error) => console.error("Erro ao buscar ips:", error));
  };

  const handleUpdateIp = (updatedIp: Ip) => {
    fetchIps();
    const updatedIps = ips.map((ipItem) =>
      ipItem.ip === updatedIp.ip ? updatedIp : ipItem
    );
    setIps(updatedIps);
    handleCloseEditIp();
  };

  useEffect(() => {
    fetchIps();
  }, []);

  const handleDeleteIp = async (ipToDelete: string) => {
   
    const ipItemToDelete = ips.find((ipItem) => ipItem.ip === ipToDelete);
    if (ipItemToDelete) {
     
      setConfirmDeleteIp(ipItemToDelete);
    } else {
    
    }
  };
  
  const confirmDelete = async () => {
    if (confirmDeleteIp) {
      try {
  
        const response = await fetch(`http://localhost:3001/ips/${encodeURIComponent(confirmDeleteIp.ip)}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          const updatedIps = ips.filter((ip) => ip.ip !== confirmDeleteIp.ip);
      
          toast.success("O ip foi excluído!");
          setIps(updatedIps);
        } else {
          console.error('Erro ao excluir o ip:', response.statusText);
          toast.error("Erro ao excluir o ip");
        }
      } catch (error) {
        console.error('Erro de rede ao excluir o ip:', error);
        toast.error("Erro de rede ao excluir o ip!");
      } finally {
        setConfirmDeleteIp(null);
      }
    }
  };
  
  const cancelDelete = () => {
    setConfirmDeleteIp(null); // Limpe o estado de confirmação de exclusão
  };
  const formatCreatedAt = (createdAt: string) => {
    const date = new Date(createdAt);
    if (!isValid(date)) {
      return '';
    }
    return format(date, "dd/MM/yyyy 'às' HH:mm:ss");
  };
  return (
    <>
      <ToastContainer />
      {showAddIp && <FormIpCreate onClose={handleCloseAddIps} onIpCreated={handleIpCreated} />}
      {showEditIp && <FormIpUpdate ip={editingIp} onClose={handleCloseEditIp} onUpdateIp={handleUpdateIp} />}
      <main className="pt-32 h-full bg-gradient-to-t from-gray-200 via-gray-300 to-gray-300">
        <section className="container">
          <div className="flex items-center md:gap-x-3 lg:gap-x-3">
            <h1 className="text-md text-2xl font-bold text-gray-700 ml-0 md:ml-8 lg:ml-8">Lista de IP's</h1>
            <button
              type="button"
              onClick={handleAddIpClick}
              className="flex items-center rounded px-2 text-sm text-blue-600 transition-colors duration-300 hover:text-blue-400 focus:outline-none dark:text-blue-400 dark:hover:text-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="mx-2">Adicionar IP</span>
            </button>
          </div>
          <div className="flex flex-col mt-6 w-full overflow-x-auto">
            <div className="justify-center">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl">
                  <table className="min-w-full divide-y rounded-xl divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex items-center gap-x-3">
                            <span>IP</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          Comentário
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          Data de Criação
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          Ultima Alteração
                        </th>
                        <th scope="col" className="relative py-3.5 px-4">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                      {ips.map((ip) => (
                        <tr key={ip.ip}>
                          <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                            <div className="inline-flex items-center gap-x-3">
                              <div className="flex items-center gap-x-2">
                                <div>
                                  <h2 className="font-medium text-gray-800 dark:text-white ">
                                    {ip.ip}
                                  </h2>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <div className=" items-center max-w-full overflow-x-auto">
                              <p className="text-black">
                                {ip.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-normal break-words">
                            <div className="items-center max-w-full overflow-x-auto">
                              <p className="text-black">{formatCreatedAt(ip.createdAt as string)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-normal break-words">
                            <div className="items-center max-w-full overflow-x-auto">
                              <p className="text-black">{formatCreatedAt(ip.updatedAt as string)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <div className="flex justify-end gap-x-6">
                              <button
                                className="text-gray-500 transition-colors duration-200 dark:hover:text-red-500 dark:text-gray-300 hover:text-red-500 focus:outline-none"
                                onClick={() => handleDeleteIp(ip.ip)}
                                title='Excluir'
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                              <button
                                className="text-gray-500 transition-colors duration-200 dark:hover:text-yellow-500 dark:text-gray-300 hover:text-yellow-500 focus:outline-none"
                                onClick={() => handleEditIpClick(ip)} // Abre o formulário de edição com o serviço
                                title='Editar'
                              >                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {confirmDeleteIp && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Excluir IP
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Tem certeza de que deseja excluir o Ip: <span className="font-medium">{confirmDeleteIp.ip}</span>? Essa ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={confirmDelete} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Excluir
                </button>
                <button onClick={cancelDelete} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IpsTable;