export const fmtP = (v) => v ? Number(v).toLocaleString("fr-FR",{maximumFractionDigits:0})+" €" : "—";
export const fmtK = (v) => v ? Number(v).toLocaleString("fr-FR")+" km" : "—";
export const fmtD = (d) => {
  if(!d) return "—";
  const p = d.split("-");
  return p.length===3 ? p[2]+"/"+p[1]+"/"+p[0] : d;
};
export const r2 = (v) => Math.round(v*100)/100;
export const fmtSize = (b) => {
  if(!b) return "0 o";
  if(b<1024) return b+" o";
  if(b<1048576) return (b/1024).toFixed(1)+" Ko";
  return (b/1048576).toFixed(1)+" Mo";
};

export const daysInStock = (d) => {
  if(!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  return Math.max(0, Math.floor(diff/86400000));
};
export const fmtDays = (d) => {
  const n = daysInStock(d);
  return n===null ? "—" : n+"j";
};
export const daysColor = (d) => {
  const n = daysInStock(d);
  if(n===null) return {bg:"#DBEAFE",color:"#2563EB"};
  if(n<=30)  return {bg:"#DCFCE7",color:"#15803D"};
  if(n<=60)  return {bg:"#FEF3C7",color:"#B45309"};
  return {bg:"#FEE2E2",color:"#DC2626"};
};

export const folderId = (v) => {
  const slug = (v.marque||"VEH").substring(0,3).toUpperCase()+"-"+(v.modele||"X").substring(0,3).toUpperCase();
  return `GED/${slug}/${v.immatriculation||v.id}`;
};

export const calcMargin = (v) => {
  if(v.tva==="TVA déductible"){
    const a=Number(v.prixAchatHT)||0, s=Number(v.prixVenteHT)||0;
    if(!a||!s) return null;
    const m=r2(s-a);
    return {marge:m, pct:r2(m/a*100), label:"Marge HT"};
  } else {
    const a=Number(v.prixAchatTTC)||0, s=Number(v.prixVenteTTC)||0;
    if(!a||!s) return null;
    const mb=r2(s-a), tv=r2(mb-mb/1.2), mn=r2(mb-tv);
    return {marge:mn, pct:r2(mn/a*100), tvaSurMarge:tv, margeBrute:mb, label:"Marge nette"};
  }
};

export const getDP = (v) => v.tva==="TVA déductible"
  ? {achat:fmtP(v.prixAchatHT), vente:fmtP(v.prixVenteTTC)}
  : {achat:fmtP(v.prixAchatTTC), vente:fmtP(v.prixVenteTTC)};
