"use client";
import { useState, useRef } from "react";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, saveAuth } from "@/lib/api";

type Step = "phone"|"method"|"otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+998");
  const [method, setMethod] = useState<"sms"|"telegram">("sms");
  const [otp, setOtp] = useState(["","","","",""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const refs = useRef<(HTMLInputElement|null)[]>([]);

  const sendOtp = async (m: "sms"|"telegram") => {
    setMethod(m); setLoading(true); setError("");
    try {
      const { data } = await api.post("/api/auth/send-otp", { phone, method: m });
      if (data.demo_code) {
        setDemoCode(data.demo_code);
        alert("Demo rejim! Kod: " + data.demo_code);
      }
      setStep("otp");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Xatolik");
    }
    setLoading(false);
  };

  const verify = async (code?: string) => {
    const c = code || otp.join("");
    if (c.length < 5) return;
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/api/auth/verify-otp", { phone, code: c });
      saveAuth(data.access_token, data.user);
      router.push("/");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Kod noto'g'ri");
    }
    setLoading(false);
  };

  const onOtp = (i: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n); setError("");
    if (val && i < 4) refs.current[i+1]?.focus();
    if (n.every(d=>d)) setTimeout(() => verify(n.join("")), 100);
  };

  const BG = { minHeight:"100vh", background:"#fff", display:"flex", flexDirection:"column" as const, alignItems:"center", padding:"40px 24px 24px" };
  const LOGO = (
    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:48 }}>
      <div style={{ width:72, height:72, background:"#4d7378", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center" }}><Home size={38} color="#fff"/></div>
      <span style={{ fontSize:32, fontWeight:900, letterSpacing:-1 }}>DomGo</span>
    </div>
  );

  if (step === "phone") return (
    <div style={BG}>
      {LOGO}
      <div style={{ width:"100%", maxWidth:360 }}>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:24, textAlign:"center" }}>Tizimga kirish</h2>
        <div style={{ background:"#F2F2F7", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <span>🇺🇿</span>
          <input style={{ background:"none", border:"none", outline:"none", fontSize:16, flex:1, fontFamily:"'Inter',sans-serif", fontWeight:600 }}
            value={phone} onChange={e=>setPhone(e.target.value)} type="tel" autoFocus placeholder="+998 (__) ___ __ __"/>
        </div>
        {error && <p style={{ color:"#FF3B30", fontSize:13, marginBottom:10 }}>{error}</p>}
        <p style={{ fontSize:12, color:"#8E8E93", textAlign:"center", marginBottom:24, lineHeight:1.5 }}>
          Davom etish orqali siz <a href="#" style={{ color:"#000", textDecoration:"underline" }}>foydalanish shartlari</a>ga rozilik bildirasiz
        </p>
        <button className="black-btn" style={{ width:"100%", padding:16, fontSize:16 }}
          onClick={()=>{ if(phone.replace(/\D/g,"").length<11){setError("To'g'ri raqam kiriting");return;} setStep("method"); }}>
          Keyingi
        </button>
      </div>
    </div>
  );

  if (step === "method") return (
    <div style={BG}>
      {LOGO}
      <div style={{ width:"100%", maxWidth:360 }}>
        <div style={{ background:"#F2F2F7", borderRadius:16, padding:"16px 20px", marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>{phone}</div>
          <div style={{ fontSize:14, color:"#555" }}>Raqam to'g'rimi?</div>
          <div style={{ fontSize:14, color:"#555", marginTop:6 }}>Kod yuborish usulini tanlang:</div>
        </div>
        {[{m:"telegram" as const, label:"Telegram orqali (tavsiya etiladi)"},{m:"sms" as const, label:"SMS orqali"}].map(({m,label})=>(
          <button key={m} onClick={()=>sendOtp(m)} disabled={loading}
            style={{ width:"100%", padding:"16px", background:"#fff", border:"1px solid #E5E5EA", borderRadius:14, fontSize:16, fontWeight:600, color:"#007AFF", cursor:"pointer", marginBottom:8 }}>
            {loading && method===m ? "Yuborilmoqda..." : label}
          </button>
        ))}
        <button onClick={()=>setStep("phone")} style={{ width:"100%", padding:"14px", background:"none", border:"none", color:"#FF3B30", fontSize:15, fontWeight:600, cursor:"pointer" }}>
          Tahrirlash
        </button>
      </div>
    </div>
  );

  return (
    <div style={BG}>
      {LOGO}
      <div style={{ width:"100%", maxWidth:360 }}>
        <p style={{ fontSize:15, color:"#555", textAlign:"center", marginBottom:32, lineHeight:1.5 }}>
          <b style={{ color:"#000" }}>{phone}</b> ga yuborilgan kodni kiriting
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24 }}>
          {otp.map((d,i)=>(
            <input key={i} ref={el=>{refs.current[i]=el;}} className={`otp-box${d?" filled":""}`}
              value={d} onChange={e=>onOtp(i,e.target.value)}
              onKeyDown={e=>e.key==="Backspace"&&!d&&i>0&&refs.current[i-1]?.focus()}
              maxLength={1} inputMode="numeric" autoFocus={i===0}/>
          ))}
        </div>
        {error && <p style={{ color:"#FF3B30", fontSize:13, textAlign:"center", marginBottom:12 }}>{error}</p>}
        {demoCode && <p style={{ color:"#555", fontSize:13, textAlign:"center", marginBottom:12 }}>Demo kod: <b>{demoCode}</b></p>}
        <button className="black-btn" style={{ width:"100%", padding:"16px", fontSize:16 }} onClick={()=>verify()} disabled={loading}>
          {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
        </button>
        <button onClick={()=>sendOtp(method)} style={{ width:"100%", padding:"14px", background:"none", border:"none", color:"#007AFF", fontSize:15, fontWeight:600, cursor:"pointer", marginTop:8 }}>
          Qayta yuborish
        </button>
      </div>
    </div>
  );
}
