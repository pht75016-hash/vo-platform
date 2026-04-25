import { P, STEP_COLORS } from '../utils/constants';
import { calcMargin } from '../utils/formatters';
import { IconChevDown } from './Icons';

export function StepBadge({status, label, onClick, hasDropdown, isOpen, onToggle}) {
  const sc = STEP_COLORS[status] || STEP_COLORS[0];
  return (
    <button
      onClick={hasDropdown ? (e) => { e.stopPropagation(); onClick(); } : onClick}
      style={{height:26,padding:"0 10px",borderRadius:6,border:`1.5px solid ${sc.border}`,background:sc.bg,color:sc.color,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:5,boxSizing:"border-box",fontFamily:"inherit",verticalAlign:"middle"}}>
      <span>{label}</span>
      {hasDropdown && (
        <span onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{display:"inline-flex",alignItems:"center",marginLeft:1,paddingLeft:5,borderLeft:`1px solid ${sc.color}33`,height:14}}>
          <IconChevDown open={isOpen}/>
        </span>
      )}
    </button>
  );
}

export function MarginBadge({v, compact=false}) {
  const m = calcMargin(v);
  if(!m) return null;
  const pos = m.marge >= 0;
  const bg = pos ? "#F0FDF4" : "#FEF2F2";
  const col = pos ? "#15803D" : "#DC2626";
  if(compact) return (
    <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:6,fontSize:11,fontWeight:600,background:bg,color:col}}>
      {pos?"+":""}{m.pct}%
    </span>
  );
  return (
    <div style={{padding:"6px 10px",borderRadius:8,background:bg,border:`1px solid ${pos?"#BBF7D0":"#FECACA"}`}}>
      <div style={{fontSize:11,fontWeight:700,color:col}}>{m.label} : {pos?"+":""}{m.marge.toLocaleString("fr-FR")} € ({pos?"+":""}{m.pct}%)</div>
      {m.tvaSurMarge!=null && (
        <div style={{fontSize:10,color:P.textSoft,marginTop:2}}>TVA marge : {m.tvaSurMarge.toLocaleString("fr-FR")} € · Brute : {m.margeBrute.toLocaleString("fr-FR")} €</div>
      )}
    </div>
  );
}

export function PhotoPlaceholder({size=40}) {
  return (
    <div style={{width:size,height:size,borderRadius:8,background:P.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width={size*0.45} height={size*0.45} viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="1.5" style={{opacity:0.4}}>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </div>
  );
}

export function FuelTag({carburant}) {
  const mk = (bg, color, text) => <span style={{display:"inline-block",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,background:bg,color}}>{text}</span>;
  if(carburant==="Électrique") return mk(P.greenSoft, P.green, carburant);
  if(carburant?.startsWith("Hybride")) return mk(P.orangeSoft, "#B45309", carburant);
  if(carburant==="Diesel") return mk("#F1F5F9", "#475569", carburant);
  if(carburant) return mk("#FFF7ED", "#C2410C", carburant);
  return "—";
}

export function TvaTag({tva}) {
  return tva==="TVA déductible"
    ? <span style={{display:"inline-block",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,background:P.greenSoft,color:P.green}}>Déd.</span>
    : <span style={{display:"inline-block",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,background:P.orangeSoft,color:P.orange}}>Marge</span>;
}

export function DaysBadge({dateAchat}) {
  const daysInStock = (d) => {
    if(!d) return null;
    return Math.max(0, Math.floor((Date.now()-new Date(d).getTime())/86400000));
  };
  const n = daysInStock(dateAchat);
  if(n===null) return null;
  const dc = n<=30 ? {bg:"#DCFCE7",color:"#15803D"} : n<=60 ? {bg:"#FEF3C7",color:"#B45309"} : {bg:"#FEE2E2",color:"#DC2626"};
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,background:dc.bg,color:dc.color}}>{n}j</span>;
}
