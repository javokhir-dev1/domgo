"use client";
import{useEffect,useState,useCallback,useRef}from"react";
import{useRouter}from"next/navigation";
import dynamic from"next/dynamic";
import{Search,SlidersHorizontal,Bell,MapPin,Loader2,Home,Star,Award}from"lucide-react";
import{api,getUser,fmt,REGIONS,type Listing}from"@/lib/api";
import ListingCard from"@/components/ListingCard";
import BottomNav from"@/components/BottomNav";
import Link from"next/link";

const MapComponent=dynamic(()=>import("@/components/Map"),{ssr:false});

const TOP_PROFILES=[
  {name:"shahzoda_shahzo",elonlar:2535,avatar:"https://i.pravatar.cc/48?img=47"},
  {name:"nodira_rieltor",elonlar:1759,avatar:"https://i.pravatar.cc/48?img=45"},
  {name:"nargiza_rieltor",elonlar:1549,avatar:"https://i.pravatar.cc/48?img=44"},
  {name:"Abu_Usmon",elonlar:1283,avatar:"https://i.pravatar.cc/48?img=32"},
];

export default function HomePage(){
  const router=useRouter();
  const[user,setUser]=useState<any>(null);
  const[view,setView]=useState<"gallery"|"map">("gallery");
  const[deal,setDeal]=useState("sale");
  const[cur,setCur]=useState<"ye"|"som">("ye");
  const[search,setSearch]=useState("");
  const[showFilter,setShowFilter]=useState(false);
  const[filterCat,setFilterCat]=useState("");
  const[filterRegion,setFilterRegion]=useState("");
  const[listings,setListings]=useState<Listing[]>([]);
  const[loading,setLoading]=useState(true);
  const[userPos,setUserPos]=useState<[number,number]|null>(null);
  const[nearLoading,setNearLoading]=useState(false);
  const[geoError,setGeoError]=useState("");
  const nearModeRef=useRef(false);

  // Geolokatsiya olish funksiyasi
  const getUserLocation=useCallback(():Promise<[number,number]>=>{
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation){
        reject(new Error("Brauzer geolokatsiyani qo'llab-quvvatlamaydi"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos)=>{
          const coords:[number,number]=[pos.coords.latitude,pos.coords.longitude];
          setUserPos(coords);
          resolve(coords);
        },
        (err)=>{
          let msg="Joylashuvni aniqlashda xato";
          if(err.code===1) msg="Joylashuv ruxsati rad etildi. Brauzer sozlamalaridan ruxsat bering.";
          else if(err.code===2) msg="Joylashuv aniqlanmadi. Internet yoki GPS ni tekshiring.";
          else if(err.code===3) msg="Joylashuv aniqlanishda vaqt tugadi.";
          reject(new Error(msg));
        },
        {enableHighAccuracy:true,timeout:10000,maximumAge:30000}
      );
    });
  },[]);

  useEffect(()=>{
    const u=getUser();
    if(!u){router.push("/login");return;}
    setUser(u);
    // Fon rejimda geolokatsiya olishga harakat
    getUserLocation().catch(()=>{});
    fetchListings();
  },[]);

  const fetchListings=useCallback(async(params:any={})=>{
    setLoading(true);
    nearModeRef.current=false;
    try{
      const{data}=await api.get("/api/listings",{params:{limit:100,...params}});
      setListings(data);
    }catch{setListings([]);}
    setLoading(false);
  },[]);

  useEffect(()=>{
    if(nearModeRef.current) return; // Near mode da filter o'zgartirmasin
    const params:any={deal_type:deal};
    if(filterCat) params.category=filterCat;
    if(filterRegion) params.region=filterRegion;
    fetchListings(params);
  },[deal,filterCat,filterRegion]);

  // "Menga yaqin" tugmasi bosilganda
  const handleNearMe=useCallback(async()=>{
    setGeoError("");
    setNearLoading(true);
    try{
      // Geolokatsiyani qayta olish (foydalanuvchi ruxsat bermagangi bo'lishi mumkin)
      let pos=userPos;
      if(!pos){
        pos=await getUserLocation();
      }
      nearModeRef.current=true;
      const{data}=await api.get("/api/listings/near",{
        params:{lat:pos[0],lng:pos[1],radius_km:50,deal_type:deal}
      });
      setListings(data);
    }catch(err:any){
      setGeoError(err.message||"Joylashuvni aniqlashda xato");
      nearModeRef.current=false;
      setTimeout(()=>setGeoError(""),4000);
    }finally{
      setNearLoading(false);
    }
  },[userPos,deal,getUserLocation]);

  const filtered=listings.filter(l=>!search||(
    l.title.toLowerCase().includes(search.toLowerCase())||
    l.city.toLowerCase().includes(search.toLowerCase())
  ));
  const vips=filtered.filter(l=>l.is_vip);
  const tops=filtered.filter(l=>l.is_top&&!l.is_vip);
  const regular=filtered.filter(l=>!l.is_vip&&!l.is_top);

  return(
    <div style={{paddingBottom:72,background:"#F2F2F7",minHeight:"100vh"}}>
      {/* Header */}
      <div style={{background:"#fff",padding:"12px 16px 12px",position:"sticky",top:0,zIndex:40,boxShadow:"0 1px 0 #E5E5EA"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:"#4d7378",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><Home size={20} color="#fff"/></div>
            <span style={{fontSize:20,fontWeight:900,letterSpacing:-0.5}}>DomGo</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Link href="/top10" style={{width:36,height:36,background:"#000",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>
              <span style={{fontSize:9,fontWeight:900,color:"#4d7378",lineHeight:1.1,textAlign:"center"}}>TOP{"\n"}10</span>
            </Link>
            <button style={{width:36,height:36,background:"#F2F2F7",borderRadius:"50%",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <Bell size={18} color="#000"/>
              <span style={{position:"absolute",top:6,right:6,width:8,height:8,background:"#FF3B30",borderRadius:"50%",border:"2px solid #fff"}}/>
            </button>
          </div>
        </div>
        <div className="toggle-wrap" style={{margin:"0 0 10px"}}>
          <button className={`toggle-btn${view==="gallery"?" active":""}`} onClick={()=>setView("gallery")}>≡ Galereya</button>
          <button className={`toggle-btn${view==="map"?" active":""}`} onClick={()=>setView("map")}>🗺 Xaritada</button>
        </div>
        {view==="gallery"&&(
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div style={{position:"relative",flex:1}}>
              <Search size={16} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#8E8E93"}}/>
              <input className="jm-input" style={{paddingLeft:38,paddingTop:11,paddingBottom:11,fontSize:14}} placeholder="Nimani qidiramiz?" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button onClick={()=>setShowFilter(true)} style={{width:44,height:44,background:"#F2F2F7",borderRadius:12,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <SlidersHorizontal size={18} color="#000"/>
            </button>
          </div>
        )}
      </div>

      {/* Map view */}
      {view==="map"&&(
        <div style={{height:"calc(100vh - 200px)",position:"relative",overflow:"hidden",touchAction:"none",overscrollBehavior:"none"}}>
          <MapComponent listings={filtered} center={userPos||[41.2995,69.2401]} zoom={userPos?13:11} cur={cur} userLoc={userPos} onSelect={(lid)=>router.push(`/listing/${lid}`)}/>

          {/* Deal type buttons - top */}
          <div style={{position:"absolute",top:10,left:10,right:10,display:"flex",gap:6,zIndex:500}}>
            {["sale","rent","kunlik"].map(d=>(
              <button key={d} onClick={()=>setDeal(d)} style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,background:deal===d?"#000":"#fff",color:deal===d?"#fff":"#000",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
                {d==="sale"?"Sotuv":d==="rent"?"Ijara":"Kunlik"}
              </button>
            ))}
          </div>

          {/* Geo error xabar */}
          {geoError&&(
            <div style={{position:"absolute",bottom:70,left:16,right:16,background:"#FF3B30",color:"#fff",borderRadius:12,padding:"10px 14px",fontSize:13,fontWeight:600,zIndex:600,textAlign:"center",boxShadow:"0 4px 16px rgba(255,59,48,.4)"}}>
              📍 {geoError}
            </div>
          )}

          {/* Menga yaqin tugmasi */}
          <button
            onClick={handleNearMe}
            disabled={nearLoading}
            style={{
              position:"absolute",bottom:16,right:16,
              background:nearLoading?"#555":"#000",
              color:"#fff",border:"none",borderRadius:50,
              padding:"12px 20px",fontWeight:700,fontSize:14,
              cursor:nearLoading?"not-allowed":"pointer",
              display:"flex",alignItems:"center",gap:8,
              boxShadow:"0 4px 16px rgba(0,0,0,.3)",
              zIndex:600,transition:"all .2s",
              opacity:nearLoading?0.8:1,
            }}
          >
            {nearLoading
              ? <><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> Aniqlanmoqda...</>
              : <><MapPin size={16}/> Menga yaqin</>
            }
          </button>

          {/* Joylashuvim belgisi */}
          {userPos&&(
            <div style={{position:"absolute",top:54,left:10,background:"#4d7378",borderRadius:50,padding:"7px 13px",fontWeight:700,fontSize:12,color:"#fff",zIndex:600,boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>
              📍 Joylashuvim aniqlandi
            </div>
          )}
        </div>
      )}

      {/* Gallery view */}
      {view==="gallery"&&(
        <div style={{padding:"0 12px 12px"}}>
          <div style={{display:"flex",gap:6,overflowX:"auto",padding:"10px 0",scrollbarWidth:"none"}}>
            {["sale","rent","kunlik"].map(d=>(
              <button key={d} className={`chip${deal===d?" active":""}`} onClick={()=>setDeal(d)}>
                {d==="sale"?"Sotuv":d==="rent"?"Ijara":"Kunlik"}
              </button>
            ))}
          </div>

          {loading?(
            <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
              <div className="spin" style={{width:32,height:32,border:"3px solid #F2F2F7",borderTop:"3px solid #4d7378",borderRadius:"50%"}}/>
            </div>
          ):(
            <>
              {vips.length>0&&(
                <div style={{marginBottom:16}}>
                  <h2 style={{fontSize:18,fontWeight:800,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Star size={18} color="#4d7378" fill="#4d7378"/> VIP E'lonlar</h2>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {vips.map(l=><ListingCard key={l.id} listing={l} cur={cur}/>)}
                  </div>
                </div>
              )}
              {tops.length>0&&(
                <div style={{marginBottom:16}}>
                  <h2 style={{fontSize:18,fontWeight:800,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Award size={18} color="#4d7378"/> TOP E'lonlar</h2>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {tops.map(l=><ListingCard key={l.id} listing={l} cur={cur}/>)}
                  </div>
                </div>
              )}
              {/* Top rieltorlar */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <h2 style={{fontSize:18,fontWeight:800}}>TOP 10 Rieltor</h2>
                  <Link href="/top10" style={{fontSize:13,color:"#007AFF",fontWeight:600,textDecoration:"none"}}>Hammasi →</Link>
                </div>
                <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
                  {TOP_PROFILES.map((p,i)=>(
                    <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:60}}>
                      <img src={p.avatar} alt={p.name} style={{width:48,height:48,borderRadius:"50%",border:"2px solid #4d7378"}}/>
                      <span style={{fontSize:10,fontWeight:600,textAlign:"center",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                      <span style={{fontSize:10,color:"#8E8E93"}}>{p.elonlar}</span>
                    </div>
                  ))}
                </div>
              </div>
              {regular.length>0&&(
                <div>
                  <h2 style={{fontSize:18,fontWeight:800,marginBottom:10}}>Barcha E'lonlar</h2>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {regular.map(l=><ListingCard key={l.id} listing={l} cur={cur}/>)}
                  </div>
                </div>
              )}
              {filtered.length===0&&(
                <div style={{textAlign:"center",padding:"40px 0",color:"#8E8E93"}}>
                  <div style={{fontSize:40}}>🔍</div>
                  <p style={{marginTop:8}}>E'lonlar topilmadi</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Filter modal */}
      {showFilter&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowFilter(false)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{marginBottom:16,fontWeight:800}}>Filter</h3>
            <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:4}}>Kategoriya</label>
            <select className="jm-input" style={{marginBottom:12}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
              <option value="">Barchasi</option>
              <option value="apartment">Kvartira</option>
              <option value="house">Uy</option>
              <option value="land">Yer</option>
              <option value="commercial">Tijorat</option>
            </select>
            <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:4}}>Viloyat</label>
            <select className="jm-input" style={{marginBottom:16}} value={filterRegion} onChange={e=>setFilterRegion(e.target.value)}>
              <option value="">Barchasi</option>
              {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={()=>setShowFilter(false)} style={{width:"100%",padding:"14px",background:"#000",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}}>
              Qo'llash
            </button>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}
