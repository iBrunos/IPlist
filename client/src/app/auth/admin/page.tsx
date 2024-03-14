"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderAdmin from '@/components/layout/HeaderAdmin';

export default function Admin() {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    // Check if running on the client side
    if (typeof window !== 'undefined') {
      const roleFromLocalStorage = window.localStorage.getItem("permission");
      setRole(roleFromLocalStorage || "");
    }
  }, []);

  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("sessionInfo");
      const role = localStorage.getItem("permission");

      // Verifique se o token e a permissão existem antes de definir o papel do usuário
      if (!token) {
        window.alert("Você precisa fazer login para acessar essa página!");
        // Redirecione para a página de autenticação se não houver token ou permissão
        router.push('/auth');
      } else if (role) {
        setUserRole(role);
      }
    }
  }, []); // Empty dependency array ensures this useEffect runs only once after the initial render
  // Don't render anything if the user doesn't have permission
  if (!userRole) {
    return null;
  }

  return (
    <>
      <HeaderAdmin />
    </>
  );
}
