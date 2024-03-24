"use client"
import UserTable from '../../../../components/interface/tables/User/UserTable';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderAdmin from '@/components/layout/HeaderAdmin';

export default function User() {

  const [permission, setPermission] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').map(cookie => cookie.trim().split('='));
      const tokenCookie = cookies.find(cookie => cookie[0] === 'token');
      const permissionCookie = cookies.find(cookie => cookie[0] === 'permission');

      // Verifique se o token e a permissão existem antes de definir o papel do usuário
      if (!tokenCookie) {
        window.alert("Você precisa fazer login para acessar essa página!");
        // Redirecione para a página de autenticação se não houver token ou permissão
        router.push('/auth');
      } else if (permissionCookie) {
        setPermission(permissionCookie[1]);
      }
    }
  }, []); // Empty dependency array ensures this useEffect runs only once after the initial render
  // Don't render anything if the user doesn't have permission
  if (!permission) {
    return null;
  }


  return (
    <>
      <HeaderAdmin /> 
      <UserTable />
    </>
  );
}
