"use client";
import Link from "next/link";
import { type Listing, getImg, fmt } from "@/lib/api";
import { MapPin } from "lucide-react";
export default function ListingCard({ listing: l, cur="ye" }: { listing:Listing; cur?:"ye"|"som" }) {
  const cover = l.images[0];
  const days = l.published_at ? Math.floor((Date.now()-new Date(l.published_at).getTime())/86400000) : null;
  return (
    <Link href={`/listing/${l.id}`} className="listing-card block" style={{textDecoration:"none"}}>
      <div className="card" style={{overflow:"hidden",borderRadius:16}}>
        <div style={{position:"relative",height:180}}>
          <img src={cover?getImg(cover.file_path):"/ph.png"} alt={l.title}
            style={{width:"100%",height:"100%",objectFit:"cover"}}
            onError={(e)=>{(e.target as HTMLImageElement).src="/ph.png"}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(transparent,rgba(0,0,0,.65))"}}/>
          {l.is_vip && <div className="vip-badge"><span>VIP</span></div>}
          {l.is_top && !l.is_vip && <div className="top-badge"><span>TOP</span></div>}
          <div style={{position:"absolute",top:10,left:10,display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:"#ccc",overflow:"hidden"}}>
              <img src={`https://i.pravatar.cc/52?u=${l.owner_id}`} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
            </div>
            {l.owner_username&&<span style={{fontSize:11,fontWeight:600,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.5)"}}>{l.owner_username}</span>}
          </div>
          <div style={{position:"absolute",bottom:10,left:10}}>
            <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{fmt(l.price, cur as "ye"|"som")}</div>
            {l.description&&<div style={{fontSize:12,color:"rgba(255,255,255,.85)",marginTop:2,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.description}</div>}
          </div>
          {l.distance_km!=null&&<div style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,.55)",borderRadius:20,padding:"3px 8px",fontSize:11,color:"#fff",fontWeight:600}}>{l.distance_km<1?`${Math.round(l.distance_km*1000)}m`:`${l.distance_km.toFixed(1)}km`}</div>}
        </div>
        <div style={{padding:"10px 12px 12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            {l.rooms!=null&&<span style={{fontSize:13,color:"#555"}}>{l.rooms} xona</span>}
            {l.area_m2!=null&&<span style={{fontSize:13,color:"#555"}}>{l.area_m2} m²</span>}
            <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#8E8E93",marginLeft:"auto"}}>
              <MapPin size={11}/>{l.city}{days!==null&&<span style={{color:"#C7C7CC"}}> · {days===0?"Bugun":`${days}k`}</span>}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
