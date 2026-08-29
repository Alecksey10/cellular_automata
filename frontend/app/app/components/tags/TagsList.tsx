
import Tag from "./Tag";
import './css.css'


export interface TagData
{
    text:string,
    key:string
}

export interface TagsProps
{
    tags:TagData[];
    onItemClick?:(tag:TagData)=>void
}
export default function Tags( {tags, onItemClick}:TagsProps)
{
  let elements = tags.map((tag)=>{
    return <Tag text={tag.text} onClick={()=>{ onItemClick!(tag);}} key={tag.key}>
    </Tag>
})
    return <div className="tags-container">
        {elements}
    </div>
}