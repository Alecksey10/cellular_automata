import Sidebar from "~/components/ui/sidebar/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router";
import { AuthContext } from "~/root";
import { authenticationManager } from "~/states/auth";

export default function AppLayout() {
  const [partReducer, setReducer] = useState(authenticationManager.getState()); //по идее должен быть какой-нибудь прокси на состояния, чтобы я его редактировал
  useEffect(()=>
  {
    console.log('start fetching')
    let ignore = false;
    async function startFetching()
    {
      await authenticationManager.synchronize();
      if(!ignore)
      {
        setReducer(authenticationManager.getState())
        console.log("reducer auth updated", authenticationManager.getState())
      }
    }
    
    startFetching()
    return ()=>{ignore = true}
  },[])
  console.log('start rendering')
  console.log(authenticationManager.getState())

  // synchronize...
    const menuItems :{to:string, icon:string, label:string}[]= useMemo(() => {
      const base = [
        { to: '/search_by_tags', icon: '/data/app-layer/search.png', label: 'Поиск по автоматам' },
      ];
  
      // Добавляем профиль ТОЛЬКО если пользователь авторизован
      if (partReducer.isAuth) {
        base.unshift(
          {to: '/profile',icon: '/data/app-layer/user.svg',label: 'Профиль',},
          { to: '/create_automata', icon: '/data/app-layer/settings.png', label: 'Создать автомат' },
          { to: '/settings', icon: '/data/app-layer/settings.png', label: 'Настройки' })
      }
      else
      {
        // Добавляем профиль ТОЛЬКО если пользователь авторизован
      
        base.unshift({
          to: '/test_r2',
          icon: '/data/app-layer/user.svg',
          label: 'Авторизоваться',
        });
      
          

      }  
      return base;
    }, [partReducer]);
  
    
  return (
    <AuthContext value={partReducer}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar items={menuItems} />

        <div style={{ width: "100%" }}>
          <Outlet />
        </div>
      </div>
    </AuthContext>
  );
}
