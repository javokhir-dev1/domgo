"use client";
import{useState,useEffect}from"react";
import{useRouter}from"next/navigation";
import{ArrowLeft,Mic,ChevronDown,CheckCircle,X,CalendarClock,KeyRound,Handshake,Building2,Home,BedDouble,Store,Trees,ImagePlus}from"lucide-react";
import{api,getUser,REGIONS,TAMIRLAR}from"@/lib/api";
import BottomNav from"@/components/BottomNav";
import dynamic from"next/dynamic";

const MapComponent=dynamic(()=>import("@/components/Map"),{ssr:false});

type Step="deal"|"cat"|"form";
export default function AddPage(){
  const router=useRouter();
  const[step,setStep]=useState<Step>("deal");
  const[deal,setDeal]=useState("");
  const[cat,setCat]=useState("");
  const[role,setRole]=useState("egasi");
  const[form,setForm]=useState({title:"",description:"",price:"",currency:"ye",rooms:"",area:"",floor:"",floors:"",land_sotix:"",tamir:"",region:"",city:"",address:"",phone:"+998"});
  const[lat,setLat]=useState<number|null>(null);
  const[lng,setLng]=useState<number|null>(null);
  const[images,setImages]=useState<File[]>([]);
  const[previews,setPreviews]=useState<string[]>([]);
  const[loading,setLoading]=useState(false);
  const[success,setSuccess]=useState(false);
  const[error,setError]=useState("");
  const[showMap,setShowMap]=useState(false);

  useEffect(()=>{if(!getUser()){router.push("/login");}}, []);

  const set=(k:string,v:any)=>setForm(f=>({...f,[k]:v}));

  const handleImgs=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]);
    const combined=[...images,...files].slice(0,10);
    setImages(combined);setPreviews(combined.map(f=>URL.createObjectURL(f)));
  };
  const removeImg=(i:number)=>{
    const ni=images.filter((_,j)=>j!==i);
    setImages(ni);setPreviews(ni.map(f=>URL.createObjectURL(f)));
  };

  const handleSubmit=async()=>{
    if(!form.title||!form.price){setError("Sarlavha va narx shart");return;}
    setLoading(true);setError("");
    try{
      const fd=new FormData();
      fd.append("title",form.title);fd.append("deal_type",deal);fd.append("category",cat);
      fd.append("price",form.price);fd.append("currency",form.currency);
      fd.append("region",form.region||"Toshkent shahri");fd.append("city",form.city||"Toshkent");
      if(form.description) fd.append("description",form.description);
      if(form.rooms) fd.append("rooms",form.rooms);
      if(form.area) fd.append("area_m2",form.area);
      if(form.floor) fd.append("floor",form.floor);
      if(form.floors) fd.append("floors",form.floors);
      if(form.land_sotix) fd.append("land_sotix",form.land_sotix);
      if(form.tamir) fd.append("tamir",form.tamir);
      if(form.address) fd.append("address",form.address);
      if(lat) fd.append("lat",String(lat));
      if(lng) fd.append("lng",String(lng));
      for(const img of images) fd.append("images",img,img.name);
      await api.post("/api/listings",fd);
      setSuccess(true);
    }catch(e:any){
      setError(e?.response?.data?.detail||"Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
    setLoading(false);
  };

  if(success) return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"#fff"}}>
      <div style={{width:80,height:80,background:"#4d7378",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
        <CheckCircle size={44} color="#fff"/>
      </div>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>E'lon yuborildi! 🎉</h2>
      <p style={{color:"#8E8E93",textAlign:"center",marginBottom:24}}>E'loningiz muvaffaqiyatli joylashtirildi</p>
      <button className="yellow-btn" style={{padding:"14px 32px",fontSize:15,borderRadius:14}} onClick={()=>router.push("/")}>Bosh sahifaga</button>
      <button style={{marginTop:12,background:"none",border:"none",cursor:"pointer",color:"#007AFF",fontSize:15,fontWeight:600}} onClick={()=>{setSuccess(false);setStep("deal");setDeal("");setCat("");}}>Yana qo'shish</button>
    </div>
  );

  if(step==="deal") return(
    <div style={{minHeight:"100vh",background:"#F2F2F7",paddingBottom:72}}>
      <div style={{background:"#fff",padding:"16px 16px 12px"}}>
        <button onClick={()=>router.back()} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#555",fontSize:14,fontWeight:600,marginBottom:4}}><ArrowLeft size={18}/> Orqaga</button>
        <h1 style={{fontSize:26,fontWeight:900}}>Qo'shish</h1>
      </div>
      <div style={{padding:16}}>
        <p style={{fontSize:13,color:"#8E8E93",fontWeight:700,marginBottom:8,textTransform:"uppercase"}}>Egasi sifatida</p>
        {[{v:"kunlik",Ic:CalendarClock,l:"Kunlik ijaraga beraman"},{v:"rent",Ic:KeyRound,l:"Ijaraga beraman"},{v:"sale",Ic:Handshake,l:"Sotaman"}].map(({v,Ic,l})=>(
          <div key={v} className="card" style={{display:"flex",alignItems:"center",gap:14,padding:"18px 16px",marginBottom:8,cursor:"pointer",borderRadius:14}} onClick={()=>{setDeal(v);setStep("cat");}}>
            <Ic size={24} color="#4d7378"/><span style={{fontSize:16,fontWeight:600}}>{l}</span>
          </div>
        ))}
        <p style={{fontSize:13,color:"#8E8E93",fontWeight:700,marginBottom:8,marginTop:16,textTransform:"uppercase"}}>Xaridor sifatida</p>
        {[{v:"rent",Ic:KeyRound,l:"Ijaraga olaman"},{v:"sale",Ic:Handshake,l:"Sotib olaman"}].map(({v,Ic,l},idx)=>(
          <div key={idx} className="card" style={{display:"flex",alignItems:"center",gap:14,padding:"18px 16px",marginBottom:8,cursor:"pointer",borderRadius:14}} onClick={()=>{setDeal(v);setStep("cat");}}>
            <Ic size={24} color="#4d7378"/><span style={{fontSize:16,fontWeight:600}}>{l}</span>
          </div>
        ))}
      </div>
      <BottomNav/>
    </div>
  );

  if(step==="cat") return(
    <div style={{minHeight:"100vh",background:"#F2F2F7",paddingBottom:72}}>
      <div style={{background:"#fff",padding:"16px 16px 12px"}}>
        <button onClick={()=>setStep("deal")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#555",fontSize:14,fontWeight:600,marginBottom:4}}><ArrowLeft size={18}/> Orqaga</button>
        <h1 style={{fontSize:26,fontWeight:900}}>Qo'shish</h1>
      </div>
      <div style={{padding:16}}>
        {[{v:"apartment",Ic:Building2,l:"Kvartira"},{v:"house",Ic:Home,l:"Hovli/Kottej/Dacha"},{v:"hotel",Ic:BedDouble,l:"Mehmonxona"},{v:"commercial",Ic:Store,l:"Tijorat binolari"},{v:"land",Ic:Trees,l:"Yer"}].map(({v,Ic,l})=>(
          <div key={v} className="card" style={{display:"flex",alignItems:"center",gap:14,padding:"18px 16px",marginBottom:8,cursor:"pointer",borderRadius:14}} onClick={()=>{setCat(v);setStep("form");}}>
            <Ic size={22} color="#4d7378"/><span style={{fontSize:16,fontWeight:600}}>{l}</span>
          </div>
        ))}
      </div>
      <BottomNav/>
    </div>
  );

  const DEAL_L={sale:"Sotuv",rent:"Ijara",kunlik:"Kunlik"}[deal]||deal;
  const CAT_L={apartment:"Kvartira",house:"Hovli/Kottej/Dacha",hotel:"Mehmonxona",commercial:"Tijorat binolari",land:"Yer"}[cat]||cat;

  return(
    <div style={{minHeight:"100vh",background:"#F2F2F7",paddingBottom:80}}>
      <div style={{background:"#fff",padding:"16px 16px 12px",position:"sticky",top:0,zIndex:30}}>
        <button onClick={()=>setStep("cat")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#555",fontSize:14,fontWeight:600,marginBottom:6}}><ArrowLeft size={18}/> Orqaga</button>
        <div className="breadcrumb"><span>{DEAL_L}</span><span style={{color:"#C7C7CC"}}>›</span><span>{CAT_L}</span></div>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:16}}>

        {/* Images */}
        <div className="card" style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontWeight:800,fontSize:16}}>Rasmlar</span>
            <span style={{color:"#8E8E93",fontSize:13}}>{images.length}/10</span>
          </div>
          <p style={{fontSize:12,color:"#8E8E93",marginBottom:12}}>Birinchi rasm asosiy bo'ladi va e'lonlarda ko'rsatiladi</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
            {Array.from({length:10}).map((_,i)=>images[i]?(
              <div key={i} className="img-slot filled" style={{position:"relative"}}>
                <img src={previews[i]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/>
                <button onClick={()=>removeImg(i)} style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"rgba(0,0,0,.6)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <X size={10}/>
                </button>
              </div>
            ):(
              <label key={i} className="img-slot">
                <ImagePlus size={20} color="#C7C7CC"/>
                <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleImgs}/>
              </label>
            ))}
          </div>
        </div>

        {/* Title & desc */}
        <div className="card" style={{padding:16}}>
          <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>E'lon sarlavhasi (Qisqacha)</label>
          <div style={{position:"relative"}}>
            <input className="jm-input" placeholder="Sarlavhani kiriting" value={form.title} onChange={e=>set("title",e.target.value)} maxLength={120}/>
            <span style={{position:"absolute",bottom:10,right:12,fontSize:11,color:"#8E8E93"}}>{form.title.length}/120</span>
          </div>
          <label style={{fontSize:15,fontWeight:700,display:"block",margin:"16px 0 8px"}}>Tavsif</label>
          <div style={{position:"relative"}}>
            <textarea className="jm-input" placeholder="Tavsifni kiriting" value={form.description}
              onChange={e=>set("description",e.target.value)} rows={4} maxLength={1000} style={{resize:"none",paddingBottom:24}}/>
            <span style={{position:"absolute",bottom:10,right:12,fontSize:11,color:"#8E8E93"}}>{form.description.length}/1000</span>
          </div>
          <label style={{fontSize:15,fontWeight:700,display:"block",margin:"16px 0 8px"}}>Audio</label>
          <button style={{width:"100%",background:"#F2F2F7",border:"none",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"#4d7378",display:"flex",alignItems:"center",justifyContent:"center"}}><Mic size={18} color="#fff"/></div>
            <span style={{fontSize:15,color:"#555"}}>Audio yozish uchun bosing</span>
          </button>
        </div>

        {/* Params */}
        <div className="card" style={{padding:16}}>
          {cat==="apartment"&&(
            <>
              <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Kvartira turi</label>
              <div className="currency-toggle" style={{marginBottom:16}}>
                <button className={`currency-btn${form.tamir==="Yangi bino"?" active":""}`} onClick={()=>set("tamir","Yangi bino")}>Yangi bino</button>
                <button className={`currency-btn${form.tamir!=="Yangi bino"?" active":""}`} onClick={()=>set("tamir","Ikkilamchi")}>Ikkilamchi</button>
              </div>
            </>
          )}
          {cat!=="land"&&cat!=="commercial"&&(
            <>
              <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Xonalar soni</label>
              <input className="jm-input" placeholder="Xonalar sonini kiriting" type="number" value={form.rooms} onChange={e=>set("rooms",e.target.value)} style={{marginBottom:16}}/>
            </>
          )}
          <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Maydon, m²</label>
          <input className="jm-input" placeholder="Maydonni kiriting, m²" type="number" value={form.area} onChange={e=>set("area",e.target.value)} style={{marginBottom:16}}/>
          {cat==="land"&&(
            <>
              <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Maydon, sotix</label>
              <input className="jm-input" placeholder="Maydon, sotixni kiriting" type="number" value={form.land_sotix} onChange={e=>set("land_sotix",e.target.value)} style={{marginBottom:16}}/>
            </>
          )}
          {(cat==="apartment"||cat==="house")&&(
            <>
              <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Qavat</label>
              <input className="jm-input" placeholder="Qavatni kiriting" type="number" value={form.floor} onChange={e=>set("floor",e.target.value)} style={{marginBottom:16}}/>
              <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Uyning qavatlari soni</label>
              <input className="jm-input" placeholder="Uyning qavatlari sonini kiriting" type="number" value={form.floors} onChange={e=>set("floors",e.target.value)} style={{marginBottom:16}}/>
              <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Ta'mirlash</label>
              <div style={{position:"relative"}}>
                <select className="jm-input" value={form.tamir==="Yangi bino"||form.tamir==="Ikkilamchi"?"":form.tamir} onChange={e=>set("tamir",e.target.value)} style={{appearance:"none",paddingRight:40}}>
                  <option value="">Ta'mirni tanlang</option>
                  {TAMIRLAR.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#8E8E93",pointerEvents:"none"}}/>
              </div>
            </>
          )}
        </div>

        {/* Price */}
        <div className="card" style={{padding:16}}>
          <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Narx</label>
          <input className="jm-input" placeholder="Narxni kiriting" type="number" value={form.price} onChange={e=>set("price",e.target.value)} style={{marginBottom:10}}/>
          <div className="currency-toggle">
            <button className={`currency-btn${form.currency==="som"?" active":""}`} onClick={()=>set("currency","som")}>so'm</button>
            <button className={`currency-btn${form.currency==="ye"?" active":""}`} onClick={()=>set("currency","ye")}>y.e</button>
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{padding:16}}>
          <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Davlat</label>
          <div style={{background:"#F2F2F7",borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>🇺🇿 O'zbekiston</span><ChevronDown size={16} color="#8E8E93"/>
          </div>
          <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Manzil</label>
          <div style={{position:"relative",marginBottom:16}}>
            <select className="jm-input" value={form.region} onChange={e=>set("region",e.target.value)} style={{appearance:"none",paddingRight:40}}>
              <option value="">Hududni tanlang</option>
              {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={16} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#8E8E93",pointerEvents:"none"}}/>
          </div>
          <input className="jm-input" placeholder="Shahar" value={form.city} onChange={e=>set("city",e.target.value)} style={{marginBottom:16}}/>
          <input className="jm-input" placeholder="Ko'cha, uy raqami" value={form.address} onChange={e=>set("address",e.target.value)} style={{marginBottom:16}}/>
          <div onClick={()=>setShowMap(v=>!v)} style={{background:"#F2F2F7",borderRadius:14,padding:"16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,cursor:"pointer"}}>
            <div>
              <p style={{fontWeight:700,fontSize:14}}>{lat&&lng?"📍 Joylashuv tanlandi":"Joylashuv qo'shish"}</p>
              <p style={{fontSize:12,color:"#555",marginTop:4,lineHeight:1.4}}>{lat&&lng?`${lat.toFixed(5)}, ${lng.toFixed(5)} — o'zgartirish uchun bosing`:"• Xaritada ko'rsatilgan e'lonlar 3x ko'proq ko'riladi."}</p>
            </div>
            <span style={{fontSize:20,color:"#555"}}>{showMap?"⌃":"›"}</span>
          </div>
          {showMap&&(
            <div style={{marginBottom:16}}>
              <div style={{height:260,borderRadius:14,overflow:"hidden",position:"relative",zIndex:0}}>
                <MapComponent listings={[]} pickerMode onPick={(la:number,ln:number)=>{setLat(la);setLng(ln);}} picked={lat&&lng?{lat,lng}:null} center={lat&&lng?[lat,lng]:undefined} zoom={13}/>
              </div>
              <p style={{fontSize:12,color:"#8E8E93",marginTop:8,textAlign:"center"}}>Kerakli joyni tanlash uchun xaritani bosing</p>
            </div>
          )}
          <label style={{fontSize:15,fontWeight:700,display:"block",marginBottom:8}}>Telefon raqami (hamma ko'radi)</label>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#F2F2F7",borderRadius:12,padding:"10px 16px"}}>
            <span>🇺🇿</span>
            <input style={{background:"none",border:"none",outline:"none",fontSize:15,flex:1,fontFamily:"'Inter',sans-serif"}} placeholder="+998 (__) ___ __ __" value={form.phone} onChange={e=>set("phone",e.target.value)} type="tel"/>
          </div>
          <label style={{fontSize:15,fontWeight:700,display:"block",margin:"16px 0 8px"}}>Kim joylashtirdi</label>
          <div className="currency-toggle">
            <button className={`currency-btn${role==="egasi"?" active":""}`} onClick={()=>setRole("egasi")}>Egasi</button>
            <button className={`currency-btn${role==="rieltor"?" active":""}`} onClick={()=>setRole("rieltor")}>Rieltor</button>
          </div>
        </div>

        {error&&<p style={{color:"#FF3B30",fontSize:14,textAlign:"center"}}>{error}</p>}
        <button className="black-btn" style={{width:"100%",padding:"18px",fontSize:16}} onClick={handleSubmit} disabled={loading}>
          {loading?"Yuborilmoqda...":"Tayyor"}
        </button>
      </div>
    </div>
  );
}
