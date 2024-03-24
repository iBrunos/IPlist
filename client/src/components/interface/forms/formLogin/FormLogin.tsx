"use client";
import Image from "next/image";
import logoCogel from "../../../../../public/assets/logo_cogel.png";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa";
import bg from "../../../../../public/assets/bg_vpn.png";
import CryptoJS from "crypto-js";

const LoginForm: React.FC = () => {
  const bgImage = "assets/bg-login2.jpg";
  const [username, setUsername] = useState(""); // Estado para o nome de usuário
  const [password, setPassword] = useState(""); // Estado para a senha
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessageLogin, setErrorMessageLogin] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const router = useRouter();

  const abrirModal = () => {
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const handleBotaoClick = () => {
    abrirModal();
  };


  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
    if (!rememberMe) {
      const credentials = { username, password };
      const encryptedCredentials = CryptoJS.AES.encrypt(JSON.stringify(credentials), 'yourSecretKey').toString();
      localStorage.setItem("credentials", encryptedCredentials);
    } else {
      localStorage.removeItem("credentials");
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e: any) => {
    e.preventDefault();
    const newItem = { username, password };
    try {
      const response = await fetch(
        "http://localhost:3001/users/login",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        }
      );

      const data = await response.json();

      if (data.message === "Login successful") {
        // Use cookies to store the token and user info
        const encryptedToken = CryptoJS.AES.encrypt(data.token, 'yourSecretKey').toString();
        document.cookie = "token=" + encryptedToken + "; path=/;";
        
        const encryptedPermission = CryptoJS.AES.encrypt(data.user._doc.permission, 'yourSecretKey').toString();
        document.cookie = "permission=" + encryptedPermission + "; path=/;";
        
        const encryptedUserName = CryptoJS.AES.encrypt(data.user._doc.name, 'yourSecretKey').toString();
        document.cookie = "userName=" + encryptedUserName + "; path=/;";
        
        // Redirect to the desired page
        router.push("/auth/admin/ips");
      } else {
        setPassword("");
        setUsername("");
        setErrorMessageLogin(true);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <>
      <div className=" bg-white dark:bg-[#101010]">
        <div className=" flex justify-center h-screen w-screen">
          <Image
            className="relative hidden bg-cover lg:block xl:block"
            src={bg}
            alt=""
            width={1400}
            height={100}
          />

          <div className="flex  ">
            <h2 className="absolute  left-[5%] top-[6%] text-2xl font-bold text-white sm:text-3xl">
              COGEL
            </h2>
            <p className="absolute left-[5%] top-[8%] max-w-xl mt-3 text-white">
              Seja bem-vindo! Ao sistema de IPS
            </p>
          </div>
          <div className="flex items-center w-full max-w-md px-6 mx-auto ">
            <div className="flex-1">
              <div className="text-center">
                <div className="flex justify-center mx-auto">
                  <Image className="w-40" src={logoCogel} alt="" />
                </div>

                <p className="mt-3 text-black">
                  Entre para acessar seu painel administrativo
                </p>
              </div>

              <div className="mt-8">
                <form onSubmit={handleLogin}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm text-black"
                    >
                      Usuário
                    </label>
                    <input
                      type="username"
                      name="username"
                      id="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setErrorMessageLogin(false);
                      }}
                      required
                      placeholder="usuário"
                      className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-[#205aa7] rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <label
                        htmlFor="password"
                        className="text-sm text-black"
                      >
                        Senha
                      </label>
                      <p
                        onClick={handleBotaoClick}
                        className="text-sm text-black focus:text-gray-500 hover:text-gray-500 hover:underline hover:cursor-pointer"
                      >
                        Esqueceu sua senha?
                      </p>
                      {modalAberto && (
                        <section
                          id="password-change-banner"
                          className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-60"
                        >
                          <div className="max-w-md shadow-2xl p-4 mx-auto bg-white border-2 border-[#205aa7] rounded-2xl relative">
                            <button
                              className="text-black font-semibold hover:text-[#205aa7]  rounded-lg px-4 py-2.5 duration-300 transition-colors focus:outline-none absolute top-1 right-4"
                              onClick={fecharModal}
                            >
                              X
                            </button>
                            <h2 className="font-semibold text-gray-800">
                              🔒 Esqueceu a sua senha? 🔑
                            </h2>
                            <p className="mt-4 text-sm text-gray-600">
                              Caso tenha esquecido ou perdido sua senha, por favor, entre em contato com o{' '}
                              <span className="text-[#205aa7]">suporte</span> ou o seu{' '}
                              <span className="text-[#205aa7]">gerente</span> designado para obter
                              assistência na recuperação da sua senha.
                            </p>
                            <p className="mt-4 text-sm text-gray-600">
                              Lembre-se de armazenar sua senha de forma segura.
                            </p>
                          </div>
                        </section>

                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          placeholder="●●●●●●●●"
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-[#205aa7] rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
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
                    {errorMessageLogin && (
                      <p className="max-w-xl mt-3 text-red-500">
                        Usuário ou senha inválidos
                      </p>
                    )}

                    <div className="flex items-start mt-3">
                      <div className="flex items-center h-5">
                        <input
                          id="remember"
                          aria-describedby="remember"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:ring-3 focus:ring-primary-300 accent-black"
                          checked={rememberMe}
                          onChange={handleRememberMe}
                        ></input>
                      </div>

                      <div className="ml-3 text-sm">
                        <label htmlFor="remember" className="text-black">
                          Lembre-se de mim
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-[#205aa7] rounded-lg hover:bg-[#4d7bb9] focus:outline-none focus:bg-gray-400 focus:ring focus:ring-gray-300 focus:ring-opacity-50"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;