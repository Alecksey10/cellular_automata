import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Routes,
  Scripts,
  ScrollRestoration,
} from "react-router";

import Sidebar from '~/components/ui/sidebar/Sidebar'

import { AuthenticationManager, authenticationManager, AuthenticationState } from "./states/auth";

import type { Route as RouteType}  from "./+types/root";
import { Route } from "react-router";
import "./app.css";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const links: RouteType.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const AuthContext = createContext<AuthenticationState|null>(null);



export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // const [partReducer, setReducer] = useState(authenticationManager.getState()); //по идее должен быть какой-нибудь прокси на состояния, чтобы я его редактировал
  // useEffect(()=>
  // {
  //   console.log('start fetching')
  //   let ignore = false;
  //   async function startFetching()
  //   {
  //     await authenticationManager.synchronize();
  //     if(!ignore)
  //     {
  //       setReducer(authenticationManager.getState())
  //       console.log("reducer auth updated", authenticationManager.getState())
  //     }
  //   }
    
  //   startFetching()
  //   return ()=>{ignore = true}
  // },[])
  // console.log('start rendering')
  // console.log(authenticationManager.getState())


  //  // ─── Формируем меню в зависимости от авторизации ───
  // const menuItems :{to:string, icon:string, label:string}[]= useMemo(() => {
  //   const base = [
  //     { to: '/create_automata', icon: '/icons/home.svg', label: 'Создать автомат' },
  //     { to: '/search_by_tags', icon: '/icons/users.svg', label: 'Поиск по автоматам' },
  //     { to: '/settings', icon: '/icons/settings.svg', label: 'Настройки' },
  //   ];

  //   // Добавляем профиль ТОЛЬКО если пользователь авторизован
  //   if (partReducer.isAuth) {
  //     base.unshift({
  //       to: '/profile',
  //       icon: '/icons/profile.svg',
  //       label: 'Профиль',
  //     });
  //   }
  //   else
  //   {
  //     // Добавляем профиль ТОЛЬКО если пользователь авторизован
  //   if (partReducer.isAuth) {
  //     base.unshift({
  //       to: '/test_r2',
  //       icon: '/icons/profile.svg',
  //       label: 'Авторизоваться',
  //     });
  //   }
  //   }

  //   // // Можно добавить роль-зависимые пункты
  //   // if (partReducer.role === 'admin') {
  //   //   base.push({
  //   //     to: '/admin',
  //   //     icon: '/icons/shield.svg',
  //   //     label: 'Админ-панель',
  //   //   });
  //   // }

  //   return base;
  // }, [partReducer]);

  // console.log("root rendering", partReducer)
  return <div >
        <Outlet/>
        </div>
  // return <AuthContext value={partReducer}>
  //     <div style={{ display: 'flex', minHeight: '100vh' }}>
  //       <Sidebar items={menuItems}/>
  //       <div style={{ width:'100%'}}>
  //       <Outlet/>
  //       </div>
  //     </div>
  // </AuthContext>
}

export function ErrorBoundary({ error }: RouteType.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
