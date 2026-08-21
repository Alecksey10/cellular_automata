import type { Route } from "../../routes/+types/home";
import { Welcome } from "../../welcome/welcome";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner"

import { APIMethodLogin, APIMethodRegister, type RegisterRequest, type RegisterResponse } from "../../../api/auth";
import type { APIMethodDataResponse } from "../../../api/APIMethodDataResponse";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "test cellular" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function RegisterComponent(props:{onTry:(data:APIMethodDataResponse<RegisterResponse>)=>void})
{
    
      const [email, setEmail] = useState("test@mail.mail")
      const [login, setLogin] = useState("test")
      const [pass, setPass] = useState("pass")
      
      const [isActive, setIsActive] = useState(true)
    
      function register(email:string, login:string,pass:string)
      {
        let request = new APIMethodRegister();
        setIsActive(false)
        request.execute(
          {
            username: login,
            email: email,
            password: pass
          } as RegisterRequest).then((response) => {
            props.onTry(response)
            if (!response.ok) {
              return;
            }
            }).finally(()=>{setIsActive(true)});
      }
    
  return <>
    <div className="w-fit space-y-4">
      
    <div>
      <Input value={email} onChange={(e) => { console.log(email); setEmail(e.target.value) }}>
      </Input></div>
    <div>
      <Input value={login} onChange={(e) => { console.log(login); setLogin(e.target.value) }}>
      </Input></div>
    <div><Input value={pass} onChange={(e) => { console.log(pass); setPass(e.target.value) }}>
    </Input></div>
    {isActive? <Button onClick={() => { register(email, login, pass) }} disabled={!isActive}>
      register
    </Button> : <div className="flex justify-center"><Spinner/></div>}
    
    <div></div>
    </div>
      </>
}
