"use client";

import { useState, useEffect } from "react";
import FormUserCreate from "../../forms/formUser/Create/FormUserCreate";
import FormUserUpdate from "../../forms/formUser/Update/FormUserUpdate";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}

const UserTable: React.FC = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditUser, setShowEditUser] = useState(false);

  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setShowEditUser(true);
  };

  const handleCloseEditUser = () => {
    setEditingUser(null);
    setShowEditUser(false);
  };

  const handleAddUserClick = () => {
    setShowAddUser(true);
  };

  const handleUserCreated = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = users.map((user) =>
      user._id === updatedUser._id ? updatedUser : user
    );
    setUsers(updatedUsers);
    handleCloseEditUser();
  };
  const handleCloseAddUser = () => {
    setShowAddUser(false);
    // Atualize a tabela chamando a API novamente
    fetch("https://api-bladefall.vercel.app/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Erro ao buscar usuários:", error));
  };

  useEffect(() => {
    fetch("https://api-bladefall.app/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Erro ao buscar serviços:", error));
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch(
        `https://api-bladefall.app/users/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Update the list of users after successful deletion
        const updatedUsers = users.filter(
          (user) => user._id !== id
        );
        toast.success("O usuário foi excluído!");
        setUsers(updatedUsers);
      } else {
        console.error("Erro ao excluir o usuário:", response.statusText);
        toast.error("Erro ao excluir o usuário");
      }
    } catch (error) {
      console.error("Erro de rede ao excluir o usuário:", error);
      toast.error("Erro de rede ao excluir o usuário!");
    }
  };

  return (
    <>
      <ToastContainer />
      {showAddUser && (
        <FormUserCreate
          onClose={handleCloseAddUser}
          onUserCreated={handleUserCreated}
        />
      )}
      {showEditUser && (
        <FormUserUpdate
          user={editingUser}
          onClose={handleCloseEditUser}
          onUpdateUser={handleUpdateUser}
        />
      )}
      <main className="pt-32 h-full bg-gradient-to-t from-gray-200 via-gray-300 to-gray-300">
        <section className="container px-4 justify-center ">
          <div className="flex items-center md:gap-x-3 lg:gap-x-3">
            <h1 className=" text-sm md:text-2xl lg:text-2xl font-bold text-gray-700 md:ml-8 lg:ml-8">
              Equipe de Blade Fall
            </h1>
            <span className="lg:flex md:flex hidden px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400">
              {users.length} usuários
            </span>
            <span className="sm:flex lg:hidden md:hidden flex-row px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400">
              {users.length}&nbsp;usuários
            </span>
            <button
              type="button"
              onClick={handleAddUserClick}
              className="flex items-center rounded  px-2 text-sm text-blue-600 transition-colors duration-300 hover:text-blue-400 focus:outline-none dark:text-blue-400 dark:hover:text-blue-500"
            >
              <span className="mx-2">+ Adicionar usuário</span>
            </button>
          </div>
          <div className="flex flex-col mt-6">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border rounded-xl border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex items-center gap-x-3">
                            <span>Nome</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          <button className="flex items-center gap-x-2">
                            <span>Email</span>
                          </button>
                        </th>
                        <th scope="col" className="relative py-3.5 px-4">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                            <div className="inline-flex items-center gap-x-3">
                              <div className="flex items-center gap-x-2">
                                <div>
                                  <h2 className="font-medium text-gray-800 dark:text-white">
                                    {user.name}
                                  </h2>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <div className="flex justify-end gap-x-6">
                              <button
                                className="text-gray-500 transition-colors duration-200 dark:hover:text-red-500 dark:text-gray-300 hover:text-red-500 focus:outline-none"
                                onClick={() => handleDeleteUser(user._id)}
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
                                onClick={() => handleEditUserClick(user)} // Abre o formulário de edição com o serviço
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
    </>
  );
};

export default UserTable;