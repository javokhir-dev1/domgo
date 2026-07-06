"use client";
import{useState}from"react";
import{getImg}from"@/lib/api";
export default function Carousel({images}:{images:{id:number;file_path:string;order:number}[]}) {
  const[cur,setCur]=useState(0);
  if(!images.length) return <div style={{height:280,background:"#F2F2F7",display:"flex",alignItems:"center",justifyContent:"center",color:"#8E8E93"}}>Rasm yo'q</div>;
  return(
    <div style={{position:"relative",height:280,background:"#000",overflow:"hidden"}}>
      <img src={getImg(images[cur].file_path)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={(e)=>{(e.target as HTMLImageElement).src="/ph.png"}}/>
      {images.length>1&&(
        <div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
          {images.map((_,i)=><div key={i} onClick={()=>setCur(i)} style={{width:i===cur?24:8,height:8,borderRadius:4,background:i===cur?"#4d7378":"rgba(255,255,255,.5)",transition:"all .2s",cursor:"pointer"}}/>)}
        </div>
      )}
      <div style={{position:"absolute",top:16,right:16,background:"rgba(0,0,0,.5)",color:"#fff",borderRadius:20,padding:"4px 10px",fontSize:12,fontWeight:600}}>{cur+1}/{images.length}</div>
      {images.length>1&&cur>0&&<button onClick={()=>setCur(c=>c-1)} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,.45)",border:"none",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>}
      {images.length>1&&cur<images.length-1&&<button onClick={()=>setCur(c=>c+1)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,.45)",border:"none",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>}
    </div>
  );
}
