"use client";
import{useEffect,useState}from"react";
import{useRouter}from"next/navigation";
import{ArrowLeft}from"lucide-react";
import{api,type User}from"@/lib/api";
import BottomNav from"@/components/BottomNav";
export default function Top10Page(){
  const router=useRouter();
  const[users,setUsers]=useState<User[]>([]);
  const BADGES=["🥇","🥈","🥉","🏆","🏆","🏆","🏆","🏆","🏆","🏆"];
  useEffect(()=>{api.get("/api/users/top?limit=10").then(({data})=>setUsers(data)).catch(()=>{});}, []);
  return(
    <div style={{minHeight:"100vh",background:"#F2F2F7",paddingBottom:72}}>
      <div style={{background:"#fff",padding:"16px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>router.back()} style={{background:"none",border:"none",cursor:"pointer"}}><ArrowLeft size={20}/></button>
        <h1 style={{fontSize:20,fontWeight:900}}>TOP 10 Rielторlar</h1>
      </div>
      <div style={{padding:16}}>
        {users.map((u,i)=>(
          <div key={u.id} className="card" style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",marginBottom:8,borderRadius:14}}>
            <span style={{fontSize:22,width:32,textAlign:"center"}}>{BADGES[i]}</span>
            <img src={`https://i.pravatar.cc/48?u=${u.id}`} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover"}} alt=""/>
            <div style={{flex:1}}>
              <p style={{fontWeight:700,fontSize:15}}>{u.username||u.name}</p>
              <p style={{fontSize:13,color:"#8E8E93"}}>E'lonlar: {u.elonlar_count.toLocaleString()}</p>
            </div>
            <div style={{width:32,height:32,borderRadius:"50%",background:"#fffbe6",border:"2px solid #4d7378",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏆</div>
          </div>
        ))}
        {users.length===0&&<p style={{textAlign:"center",color:"#8E8E93",padding:"40px 0"}}>Yuklanmoqda...</p>}
      </div>
      <BottomNav/>
    </div>
  );
}
