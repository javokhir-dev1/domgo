"use client";
import{useState}from"react";
import{Search as S,ArrowLeft,SlidersHorizontal}from"lucide-react";
import{useRouter}from"next/navigation";
import{api,REGIONS,type Listing,fmt}from"@/lib/api";
import ListingCard from"@/components/ListingCard";
import BottomNav from"@/components/BottomNav";
export default function SearchPage(){
  const router=useRouter();
  const[q,setQ]=useState("");const[deal,setDeal]=useState("sale");const[cat,setCat]=useState("");const[region,setRegion]=useState("");const[minP,setMinP]=useState("");const[maxP,setMaxP]=useState("");const[rooms,setRooms]=useState("");
  const[results,setResults]=useState<Listing[]>([]);const[searched,setSearched]=useState(false);const[loading,setLoading]=useState(false);
  const doSearch=async()=>{
    setLoading(true);setSearched(true);
    try{const params:any={deal_type:deal,limit:100};if(cat)params.category=cat;if(region)params.region=region;if(minP)params.min_price=minP;if(maxP)params.max_price=maxP;if(rooms)params.rooms=rooms;
    const{data}=await api.get("/api/listings",{params});setResults(data);}catch{setResults([]);}
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:"#F2F2F7",paddingBottom:72}}>
      <div style={{background:"#fff",padding:"12px 16px",position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <button onClick={()=>router.back()} style={{background:"none",border:"none",cursor:"pointer"}}><ArrowLeft size={20}/></button>
          <div style={{flex:1,position:"relative"}}>
            <S size={16} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#8E8E93"}}/>
            <input className="jm-input" style={{paddingLeft:38,paddingTop:10,paddingBottom:10,fontSize:14}} placeholder="Qidirish..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}/>
          </div>
        </div>
        <div style={{display:"flex",gap:2,background:"#F2F2F7",borderRadius:50,padding:3}}>
          {["sale","rent","kunlik"].map(d=>(
            <button key={d} className={`toggle-btn${deal===d?" active":""}`} onClick={()=>setDeal(d)}>{d==="sale"?"Sotuv":d==="rent"?"Ijara":"Kunlik"}</button>
          ))}
          <button className="toggle-btn" style={{flex:"0 0 80px"}}>Xaridorlar</button>
        </div>
      </div>
      <div style={{padding:"12px 16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <select className="jm-input" style={{flex:1,padding:"10px 14px",fontSize:13}} value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">Tur</option>
            {["apartment","house","commercial","land"].map((v,i)=><option key={v} value={v}>{["Kvartira","Hovli","Tijorat","Yer"][i]}</option>)}
          </select>
          <select className="jm-input" style={{flex:1,padding:"10px 14px",fontSize:13}} value={region} onChange={e=>setRegion(e.target.value)}>
            <option value="">Hudud</option>
            {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input className="jm-input" style={{flex:1,padding:"10px 14px",fontSize:13}} type="number" placeholder="Min narx" value={minP} onChange={e=>setMinP(e.target.value)}/>
          <input className="jm-input" style={{flex:1,padding:"10px 14px",fontSize:13}} type="number" placeholder="Max narx" value={maxP} onChange={e=>setMaxP(e.target.value)}/>
        </div>
        <select className="jm-input" style={{marginBottom:10,fontSize:13}} value={rooms} onChange={e=>setRooms(e.target.value)}>
          <option value="">Xonalar soni</option>
          {[1,2,3,4,5,6].map(r=><option key={r} value={r}>{r} xona</option>)}
        </select>
        <button className="yellow-btn" style={{width:"100%",padding:"13px",fontSize:15,borderRadius:14,marginBottom:16}} onClick={doSearch}>
          <S size={16}/>{loading?"Qidirilmoqda...":"Qidirish"}
        </button>
        {!searched?<div style={{textAlign:"center",padding:"40px 0",color:"#8E8E93"}}><S size={48} style={{opacity:.3,marginBottom:12,display:"block",marginLeft:"auto",marginRight:"auto"}}/><p>Filtrlarni tanlang va qidiring</p></div>
        :loading?<div style={{display:"flex",justifyContent:"center",padding:40}}><div className="spin" style={{width:32,height:32,border:"3px solid #F2F2F7",borderTop:"3px solid #4d7378",borderRadius:"50%"}}/></div>
        :results.length===0?<div style={{textAlign:"center",padding:"40px 0",color:"#8E8E93"}}><p style={{fontSize:40,marginBottom:12}}>🔍</p><p style={{fontWeight:600,color:"#333"}}>Natija topilmadi</p></div>
        :<><p style={{fontSize:14,color:"#8E8E93",marginBottom:10,fontWeight:600}}>{results.length} ta natija</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{results.map(l=><ListingCard key={l.id} listing={l}/>)}</div></>}
      </div>
      <BottomNav/>
    </div>
  );
}
