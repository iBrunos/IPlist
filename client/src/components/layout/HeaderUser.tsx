"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../../public/assets/logo_cogel.png"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoExit } from "react-icons/io5";
import { FaLocationPinLock } from "react-icons/fa6";

const HeaderUser: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateToLogout = () => {
    // Remove os cookies
    document.cookie = "permission=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Redireciona para a página de autenticação
    router.push("/auth");
  };
  
  return (
    <>
      <header className="fixed top-0 bg-white shadow dark:bg-gray-800 w-full z-10">
        <nav className="px-6 py-4">
          <div className="lg:flex lg:items-center lg:justify-between ">
            <div className="flex items-center justify-between">
              <Image
                width={1000}
                height={1000}
                className="w-auto h-10 sm:h-10"
                src={logo}
                alt=""
              />
              <div className="flex lg:hidden">
                <button
                  type="button"
                  className="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400"
                  aria-label="toggle menu"
                  onClick={toggleMenu}
                >
                  {menuOpen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div
              className={`absolute inset-x-0 z-20 w-screen h-screen md:h-auto lg:h-auto px-6 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center sm:w-full sm:transition-transform ${menuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
              <div className="flex flex-col -mx-6 lg:flex-row lg:items-center lg:mx-8">

                <Link
                  className={`px-3 py-2 mx-3 mt-2 flex gap-2 items-center transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-gray-100 dark:hover-bg-gray-700 ${pathname === "/auth/admin/ips" ? "text-green-500" : ""
                    } `}
                  href="/auth/admin/ips"
                >
                  <FaLocationPinLock />IP's
                </Link>
                <button
                  onClick={navigateToLogout}
                  title="Sair"
                  className="mx-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex gap-2 items-center"
                >
                 <IoExit className="mr-1 font-bold text-black text-xl" />Sair
                </button>

              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default HeaderUser;