import type { Route } from "../../routes/+types/home";
import { Welcome } from "../../welcome/welcome";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner"
import type { APIMethodDataResponse } from "../../../api/APIMethodDataResponse";
import { APIMethodLogin, type LoginRequest, type User } from "../../../api/auth/auth";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "test cellular" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function LoginComponent(props:{onTry:(data:APIMethodDataResponse<User>)=>void})
{
    
      const [email, setEmail] = useState("test@mail.mail")
      const [login, setLogin] = useState("test")
      const [pass, setPass] = useState("pass")
      
      const [isActive, setIsActive] = useState(true)
    
      function register(email:string, login:string,pass:string)
      {
        let request = new APIMethodLogin();
        setIsActive(false)
        request.execute(
          {
              username: login,
              password: pass
          } as LoginRequest).then((response) => {
            props.onTry(response)
            if (!response.ok) {
              return;
            }
            }).finally(()=>{setIsActive(true)});
      }
    
  return <>
    <div className="w-fit space-y-4">

    <div>
      <Input value={login} onChange={(e) => { console.log(login); setLogin(e.target.value) }}>
      </Input></div>
    <div><Input value={pass} onChange={(e) => { console.log(pass); setPass(e.target.value) }}>
    </Input></div>
    {isActive? <Button onClick={() => { register(email, login, pass) }} disabled={!isActive}>
      Login
    </Button> : <div className="flex justify-center"><Spinner/></div>}
    
    <div></div>
    </div>
      </>
}
