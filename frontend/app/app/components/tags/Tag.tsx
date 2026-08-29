import { Button } from "../ui/button";


interface TagProps
{
    text:string;
    onClick?:()=>any
};
// 
export default function Tag( {text, onClick}:TagProps)
{
  return <div>
    <Button onClick={onClick}>
        {text}
  </Button>
  </div>
}