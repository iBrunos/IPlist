"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderAdmin from '@/components/layout/HeaderAdmin';
import HeaderUser from '@/components/layout/HeaderUser';
import IpsTable from '../../../../components/interface/tables/Ip/IpsTable';
import CryptoJS from 'crypto-js';

export default function Ips() {
  const [permission, setPermission] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').map(cookie => cookie.trim().split('='));
      const permissionCookie = cookies.find(cookie => cookie[0] === 'permission');
      // Verifique se o token e a permissão existem antes de definir o papel do usuário
      if (!permissionCookie) {
        window.alert("Você precisa fazer login para acessar essa página!");
        // Redirecione para a página de autenticação se não houver permissão
        router.push('/auth');
      } else {
        // Descriptografar a permissão
        const decryptedPermission = CryptoJS.AES.decrypt(permissionCookie[1], 'cogel').toString(CryptoJS.enc.Utf8);
        setPermission(decryptedPermission);
      }
    }
  }, []); // Empty dependency array ensures this useEffect runs only once after the initial render

  // Renderizar o componente HeaderAdmin ou HeaderUser dependendo da permissão
  const renderHeader = () => {
    if (permission === 'super_admin') {
      return <HeaderAdmin />;
    } else {
      return <HeaderUser />;
    }
  };

  // Renderizar o componente IpsTable se houver permissão
  return (
    <>
      <main className="bg-gradient-to-t from-gray-200 via-gray-300 h-full to-gray-300">
        {renderHeader()}
        <IpsTable />
      </main>
    </>
  );
}
