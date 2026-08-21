import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { useState } from "react";

import { APIMethodLogin, APIMethodRegister, type RegisterRequest } from "../../api/auth";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "test cellular" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  
  const [email, setEmail] = useState("test@mail.mail")
  const [login, setLogin] = useState("test")
  const [pass, setPass] = useState("pass")
  
  const [isActive, setIsActive] = useState(true)

  function register(email:string, login:string,pass:string)
  {
    let request = new APIMethodRegister();
    setIsActive(false)
    let result = request.execute(
      {
        username: login,
        email: email,
        password: pass
      } as RegisterRequest).then((response) => {
            if (!response.ok) {
                console.error(response.error);
                return;
            }
        }).finally(()=>{setIsActive(true)});
  }

  return <>

    <div>
      <input value={email} onChange={(e) => { console.log(email); setEmail(e.target.value) }}>
      </input></div>
    <div>
      <input value={login} onChange={(e) => { console.log(login); setLogin(e.target.value) }}>
      </input></div>
    <div><input value={pass} onChange={(e) => { console.log(pass); setPass(e.target.value) }}>
    </input></div>
    <button onClick={() => { register(email, login, pass) }} disabled={!isActive}>
      register
    </button>
  </>
}
