import type { Route } from "../+types/home";
import { Welcome } from "../../welcome/welcome";
import { useContext, useState } from "react";
import { Button } from "~/components/ui/button";

import { APIMethodLogin, APIMethodRegister, type RegisterRequest, type RegisterResponse } from "../../../api/auth";
import RegisterComponent from "~/components/auth/RegisterComponent";
import type { APIMethodDataResponse } from "../../../api/APIMethodDataResponse";
import { Tabs, Tab } from "~/components/ui/Tabs";
import type { User } from "../../../api/auth/auth";
import LoginComponent from "../../components/auth/LoginComponent";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "test cellular" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
import { AuthContext, type UserContext } from "~/root";
import { authenticationManager, type AuthenticationState } from "~/states/auth";

export default function RegisterPage()
{
  const userContext:UserContext|null = useContext(AuthContext)
  console.log("authed is changed?")
  function handleRegistered(response:APIMethodDataResponse<RegisterResponse>) {
    if(!response.ok)
    {
      alert(`Ошибка ${response.error?.code} ${response.error?.detail}`)
    }
    else
    {
      alert(`Регистрация прошла успешно`)
    }
  }

  async function handleLogin(response:APIMethodDataResponse<User>) {
    if(!response.ok)
    {
      alert(`Ошибка ${response.error?.code} ${response.error?.detail}`)
    }
    else
    {
      alert(`Авторизация прошла успешно`)
      await userContext?.syncUser()
      // window.location.reload()
    }
  }
    console.log('auth page')
    console.log(userContext, userContext?.authState.isAuth)
    return <>

    <div className="flex min-h-screen items-center justify-center">

      <div className="flex min-h-screen items-center justify-center">
            <div className="w-96">
                <Tabs>
                    <Tab title="Регистрация">
                        <RegisterComponent onTry={handleRegistered} key='1'/>
                    </Tab>

                    <Tab title="Вход">
                        <LoginComponent onTry={handleLogin} key='2'
                        />
                    </Tab>
                    {userContext?.authState.isAuth?
                    <Tab title="Продолжить авторизованным">
                        <Button>Продолжить авторизованным</Button>
                    </Tab>:<div>не авторизован</div>}
                    
                </Tabs>
            </div>
        </div>    
    </div>
    </>
}
