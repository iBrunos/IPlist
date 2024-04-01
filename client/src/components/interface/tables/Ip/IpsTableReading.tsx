import React, { useState, useEffect } from 'react';
import FormIpCreate from '../../forms/formIp/Create/FormIpCreate';
import FormIpUpdate from '../../forms/formIp/Update/FormIpUpdate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { isValid } from 'date-fns';
import Pagination from '../../pagination/Pagination';
import { IoIosSearch } from "react-icons/io";
import ConfirmDeleteIp from '../../buttons/confirmDeleteIp/ConfirmDeleteIp';

interface Ip {
  ip: string;
  description: string;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const IpsTable: React.FC = () => {
  const [showAddIp, setShowAddIp] = useState(false);
  const [ips, setIps] = useState<Ip[]>([]);
  const [editingIp, setEditingIp] = useState<Ip | null>(null);
  const [showEditIp, setShowEditIp] = useState(false);
  const [confirmDeleteIp, setConfirmDeleteIp] = useState<Ip | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Change as per your requirement
  const [totalPages, setTotalPages] = useState<number>(0); // Inicialize totalPages com 0 ou outro valor padrão
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchIps = async () => {
    try {
      const response = await fetch(`http://localhost:3001/ips?page=${currentPage}&limit=${itemsPerPage}`);
      if (response.ok) {
        const { ips, totalCount } = await response.json();
        setIps(ips);
        const pagesCount = Math.ceil(totalCount / itemsPerPage);
        setTotalPages(pagesCount);
        // Faça algo com totalPages, como armazená-lo em um estado
      } else {
        console.error('Erro ao buscar os IPs:', response.statusText);
        toast.error("Erro ao buscar os IPs!");
      }
    } catch (error) {
      console.error('Erro de rede ao buscar os IPs:', error);
      toast.error("Erro de rede ao buscar os IPs!");
    }
  };

  useEffect(() => {
    fetchIps();
  }, [currentPage, itemsPerPage]);

  const handleCloseEditIp = () => {
    setEditingIp(null);
    setShowEditIp(false);
    // Atualiza a tabela chamando a API novamente
    fetch("http://localhost:3001/ips")
      .then((response) => response.json())
      .then((data) => {
        setIps(data.ips);
      })
      .catch((error) => console.error("Erro ao buscar ips:", error));
  };

  const handleIpCreated = (newIp: Ip) => {
    fetchIps();
    setIps([...ips, newIp]);
  };
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleCloseAddIps = () => {
    setShowAddIp(false);
    // Atualiza a tabela chamando a API novamente
    fetch("http://localhost:3001/ips")
      .then((response) => response.json())
      .then((data) => {
        setIps(data.ips);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    const formattedValue: string = value.replace(/[^\d./]/g, '');
    const parts: string[] = formattedValue.split(/\.|\//);
    const formattedIp: string = parts
      .slice(0, 4)
      .map((part: string) => part.slice(0, 3))
      .join('.')
      .replace(/\.+/g, '.');

    setSearchTerm(formattedIp);

  };

  return (
    <>
      <ToastContainer />
      {showAddIp && <FormIpCreate onClose={handleCloseAddIps} onIpCreated={handleIpCreated} />}
      {showEditIp && <FormIpUpdate ip={editingIp} onClose={handleCloseEditIp} onUpdateIp={handleUpdateIp} />}
      <main className="pt-32 h-full bg-gradient-to-t from-gray-200 via-gray-300 to-gray-300">
        <section className="container">
          <div className="flex items-center px-9 md:gap-x-3 lg:gap-x-3">
            <h1 className="text-md text-2xl font-bold text-gray-700">Lista de IP's</h1>
            <div className="ml-auto">
              <div className="flex items-center ">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Pesquisar IP"
                  className="block rounded-l-none rtl:rounded-l-lg w-64 h-9 rtl:rounded-r-none placeholder-gray-400/70 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300"
                />
                <p className="py-2.5 px-3 h-9 text-gray-500 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 border border-l-0 rtl:rounded-r-lg rtl:rounded-l-none rtl:border-l-0 rtl:border-r rounded-r-lg"><IoIosSearch /></p>
              </div>
            </div>
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
                      {ips.filter(ip => ip.ip.includes(searchTerm)).map((ip) => (
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
                          <td className="px-4 py-4 text-sm whitespace-normal break-words">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={ip.disabled}
                                className="sr-only peer"
                                title={ip.disabled ? 'Desativar' : 'Ativar'}
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"></span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </section>
      </main>
      {confirmDeleteIp && (
        <ConfirmDeleteIp
          confirmDeleteIp={confirmDeleteIp}
          confirmDelete={confirmDelete}
          cancelDelete={cancelDelete}
        />
      )}
    </>
  );
}

export default IpsTable;