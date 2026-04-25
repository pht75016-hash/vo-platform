import { useState, useRef } from 'react';
import { P, DEFAULT_STEPS, ACHAT_ADMIN, VENTE_ADMIN, VENTE_PHYS } from '../utils/constants';
import { folderId, fmtSize, fmtD } from '../utils/formatters';
import { readFileBase64 } from '../utils/imageUtils';
import { StepBadge } from './VehicleBadges';
import { IconChevDown, IconUpload, IconFolder, IconFile } from './Icons';

export default function StepTracker({vehicle, onUpdate, onUpdateDocs, mob}) {
  const [openMeca, setOpenMeca] = useState(false);
  const [openCarro, setOpenCarro] = useState(false);
  const [openAnnonce, setOpenAnnonce] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [mecaPos, setMecaPos] = useState({top:0,left:0});
  const [carroPos, setCarroPos] = useState({top:0,left:0});
  const [annoncePos, setAnnoncePos] = useState({top:0,left:0});
  const [docsPos, setDocsPos] = useState({top:0,left:0});
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mecaRef = useRef(null);
  const carroRef = useRef(null);
  const annonceRef = useRef(null);
  const docsRef = useRef(null);
  const fileInRef = useRef(null);

  const steps = vehicle.steps || JSON.parse(JSON.stringify(DEFAULT_STEPS));
  const documents = vehicle.documents || [];

  const handleFiles = async (fileList) => {
    if(!fileList||fileList.length===0) return;
    setUploading(true);
    const newDocs = [];
    for(const file of Array.from(fileList)) {
      try {
        const data = file.size < 2*1048576 ? await readFileBase64(file) : null;
        newDocs.push({id:String(Date.now())+Math.random().toString(36).slice(2,7),name:file.name,size:file.size,type:file.type||"application/octet-stream",date:new Date().toISOString(),data,oversized:!data});
      } catch(e) {}
    }
    onUpdateDocs([...documents, ...newDocs]);
    setUploading(false);
  };

  const removeDoc = (id) => onUpdateDocs(documents.filter(d=>d.id!==id));
  const downloadDoc = (doc) => {
    if(!doc.data) return;
    const a = document.createElement('a');
    a.href = doc.data; a.download = doc.name; a.click();
  };

  const cycle = (path) => {
    const ns = JSON.parse(JSON.stringify(steps));
    const keys = path.split('.');
    let ref = ns;
    for(let i=0; i<keys.length-1; i++) ref = ref[keys[i]];
    ref[keys[keys.length-1]] = (ref[keys[keys.length-1]]+1)%3;
    onUpdate(ns);
  };

  const updateMecaItem = (field, val) => {
    const ns = JSON.parse(JSON.stringify(steps));
    ns.achat.prepa.mecanique[field] = val;
    const items = [ns.achat.prepa.mecanique.ct, ns.achat.prepa.mecanique.nettoyage, ns.achat.prepa.mecanique.mecanique];
    const done = items.filter(Boolean).length;
    ns.achat.prepa.mecanique.status = done===3?2:done>0?1:0;
    onUpdate(ns);
  };

  const updateCarroField = (field, val) => {
    const ns = JSON.parse(JSON.stringify(steps));
    ns.achat.prepa.carrosserie[field] = val;
    if(field==="ras"&&val) ns.achat.prepa.carrosserie.status = 2;
    onUpdate(ns);
  };

  const cycleCarroStatus = () => {
    const ns = JSON.parse(JSON.stringify(steps));
    ns.achat.prepa.carrosserie.status = (ns.achat.prepa.carrosserie.status+1)%3;
    onUpdate(ns);
  };

  const toggleMeca = () => {
    if(!openMeca&&mecaRef.current){const r=mecaRef.current.getBoundingClientRect();setMecaPos({top:r.bottom+4,left:r.left});}
    setOpenMeca(!openMeca);setOpenCarro(false);setOpenAnnonce(false);
  };
  const toggleCarro = () => {
    if(!openCarro&&carroRef.current){const r=carroRef.current.getBoundingClientRect();setCarroPos({top:r.bottom+4,left:r.left});}
    setOpenCarro(!openCarro);setOpenMeca(false);setOpenAnnonce(false);
  };
  const toggleAnnonce = () => {
    if(!openAnnonce&&annonceRef.current){const r=annonceRef.current.getBoundingClientRect();setAnnoncePos({top:r.bottom+4,left:r.left});}
    setOpenAnnonce(!openAnnonce);setOpenMeca(false);setOpenCarro(false);setOpenDocs(false);
  };
  const toggleDocs = () => {
    if(!openDocs&&docsRef.current){const r=docsRef.current.getBoundingClientRect();setDocsPos({top:r.bottom+4,left:Math.max(10,r.right-320)});}
    setOpenDocs(!openDocs);setOpenMeca(false);setOpenCarro(false);setOpenAnnonce(false);
  };

  const updateAnnonceItem = (field, val) => {
    const ns = JSON.parse(JSON.stringify(steps));
    ns.achat.prepa.annonce[field] = val;
    const items = [ns.achat.prepa.annonce.leboncoin, ns.achat.prepa.annonce.lacentrale, ns.achat.prepa.annonce.autoscout24];
    const done = items.filter(Boolean).length;
    ns.achat.prepa.annonce.status = done===3?2:done>0?1:0;
    onUpdate(ns);
  };

  const cycleAnnonceStatus = () => {
    const ns = JSON.parse(JSON.stringify(steps));
    ns.achat.prepa.annonce.status = ((ns.achat.prepa.annonce.status||0)+1)%3;
    onUpdate(ns);
  };

  const subLabel = {fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textSoft,minWidth:mob?72:90,paddingTop:6,letterSpacing:"0.3px"};
  const subLine = {display:"flex",alignItems:"flex-start",gap:6,padding:"4px 0"};
  const badgeWrap = {display:"flex",gap:4,flexWrap:"wrap",alignItems:"center",flex:1};
  const ddStyle = {position:"fixed",background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:12,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",zIndex:9999};

  const Section = ({title, color, children}) => (
    <div style={{display:"flex",alignItems:"stretch",gap:0,marginBottom:6}}>
      <div style={{minWidth:mob?56:72,display:"flex",alignItems:"center",justifyContent:"center",background:color.bg,color:color.fg,fontSize:11,fontWeight:800,letterSpacing:"0.6px",borderRadius:8,padding:"8px 6px",marginRight:10}}>
        {title}
      </div>
      <div style={{flex:1,minWidth:0}}>{children}</div>
    </div>
  );

  return (
    <div style={{padding:mob?"10px 12px":"10px 16px 12px 58px",background:"#FAFBFC",borderBottom:`1px solid ${P.border}`}}>
      <Section title="ACHAT" color={{bg:"#E8EDF5",fg:"#1B2A4A"}}>
        <div style={subLine}>
          <span style={subLabel}>Administratif</span>
          <div style={badgeWrap}>
            {ACHAT_ADMIN.map(s=>(
              <StepBadge key={s.k} status={steps.achat.admin[s.k]} label={s.l} onClick={()=>cycle("achat.admin."+s.k)}/>
            ))}
          </div>
        </div>
        <div style={subLine}>
          <span style={subLabel}>Préparation</span>
          <div style={badgeWrap}>
            <StepBadge status={steps.achat.prepa.etatDesLieux} label="État des lieux" onClick={()=>cycle("achat.prepa.etatDesLieux")}/>
            <div ref={mecaRef} style={{display:"inline-flex"}}>
              <StepBadge status={steps.achat.prepa.mecanique.status} label="Mécanique" onClick={()=>{const ns=JSON.parse(JSON.stringify(steps));ns.achat.prepa.mecanique.status=(ns.achat.prepa.mecanique.status+1)%3;onUpdate(ns);}} hasDropdown onToggle={toggleMeca} isOpen={openMeca}/>
            </div>
            <div ref={carroRef} style={{display:"inline-flex"}}>
              <StepBadge status={steps.achat.prepa.carrosserie.status} label="Carrosserie" onClick={cycleCarroStatus} hasDropdown onToggle={toggleCarro} isOpen={openCarro}/>
            </div>
            <StepBadge status={steps.achat.prepa.photos} label="Photos" onClick={()=>cycle("achat.prepa.photos")}/>
            <StepBadge status={steps.achat.prepa.video} label="Vidéo" onClick={()=>cycle("achat.prepa.video")}/>
            <div ref={annonceRef} style={{display:"inline-flex"}}>
              <StepBadge status={steps.achat.prepa.annonce?.status||0} label="Annonce" onClick={cycleAnnonceStatus} hasDropdown onToggle={toggleAnnonce} isOpen={openAnnonce}/>
            </div>
            <div onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={(e)=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);}} onClick={()=>fileInRef.current?.click()} style={{height:26,padding:"0 12px",borderRadius:6,border:`1.5px dashed ${dragOver?P.accent:"#C4CCD9"}`,background:dragOver?P.accentSoft:"#fff",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,transition:"all 0.15s",marginLeft:6}} title={`Dossier GED : ${folderId(vehicle)}`}>
              <span style={{color:dragOver?P.accent:P.textSoft,display:"flex",alignItems:"center"}}><IconUpload/></span>
              <span style={{fontSize:11,fontWeight:600,color:dragOver?P.accent:P.textSoft}}>{uploading?"Envoi...":"Déposer documents"}</span>
              <input ref={fileInRef} type="file" multiple style={{display:"none"}} onChange={(e)=>handleFiles(e.target.files)}/>
            </div>
            <div ref={docsRef} style={{display:"inline-flex"}}>
              <button onClick={(e)=>{e.stopPropagation();toggleDocs();}} style={{height:26,padding:"0 10px",borderRadius:6,border:`1.5px solid ${P.border}`,background:documents.length>0?P.accentSoft:"#fff",color:documents.length>0?P.accent:P.textSoft,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,fontFamily:"inherit"}}>
                <IconFolder/>
                <span style={{background:documents.length>0?P.accent:"#94A3B8",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,minWidth:14,textAlign:"center"}}>{documents.length}</span>
                <IconChevDown open={openDocs}/>
              </button>
            </div>
          </div>
        </div>
      </Section>

      <div style={{height:1,background:P.border,margin:"10px 0"}}/>

      <Section title="VENTE" color={{bg:"#FEF3C7",fg:"#92400E"}}>
        <div style={subLine}>
          <span style={subLabel}>Administratif</span>
          <div style={badgeWrap}>
            {VENTE_ADMIN.map(s=>(
              <StepBadge key={s.k} status={steps.vente.admin[s.k]} label={s.l} onClick={()=>cycle("vente.admin."+s.k)}/>
            ))}
          </div>
        </div>
        <div style={subLine}>
          <span style={subLabel}>Vente</span>
          <div style={badgeWrap}>
            {VENTE_PHYS.map(s=>(
              <StepBadge key={s.k} status={steps.vente.physique[s.k]} label={s.l} onClick={()=>cycle("vente.physique."+s.k)}/>
            ))}
          </div>
        </div>
      </Section>

      {openMeca&&(<><div style={{position:"fixed",inset:0,zIndex:9998}} onClick={()=>setOpenMeca(false)}/><div style={{...ddStyle,top:mecaPos.top,left:mecaPos.left,minWidth:200}}><div style={{fontSize:11,fontWeight:700,color:P.accent,marginBottom:8}}>Checklist mécanique</div>{[{k:"ct",l:"Contrôle technique"},{k:"nettoyage",l:"Nettoyage"},{k:"mecanique",l:"Mécanique"}].map(item=>(<label key={item.k} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={steps.achat.prepa.mecanique[item.k]} onChange={e=>updateMecaItem(item.k,e.target.checked)} style={{accentColor:P.accent,width:16,height:16}}/>{item.l}</label>))}</div></>)}
      {openCarro&&(<><div style={{position:"fixed",inset:0,zIndex:9998}} onClick={()=>setOpenCarro(false)}/><div style={{...ddStyle,top:carroPos.top,left:carroPos.left,minWidth:240}}><div style={{fontSize:11,fontWeight:700,color:P.accent,marginBottom:8}}>Carrosserie</div><label style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={steps.achat.prepa.carrosserie.ras} onChange={e=>updateCarroField("ras",e.target.checked)} style={{accentColor:P.accent,width:16,height:16}}/>RAS (rien à signaler)</label>{!steps.achat.prepa.carrosserie.ras&&(<><div style={{marginTop:8}}><div style={{fontSize:11,color:P.textSoft,marginBottom:3}}>Travaux à faire</div><input value={steps.achat.prepa.carrosserie.travaux} onChange={e=>updateCarroField("travaux",e.target.value)} placeholder="Décrire..." style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${P.border}`,fontSize:13,boxSizing:"border-box",outline:"none"}}/></div><div style={{marginTop:8}}><div style={{fontSize:11,color:P.textSoft,marginBottom:3}}>Note</div><textarea value={steps.achat.prepa.carrosserie.note} onChange={e=>updateCarroField("note",e.target.value)} placeholder="Note..." rows={2} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${P.border}`,fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",fontFamily:"inherit"}}/></div></>)}</div></>)}
      {openAnnonce&&(<><div style={{position:"fixed",inset:0,zIndex:9998}} onClick={()=>setOpenAnnonce(false)}/><div style={{...ddStyle,top:annoncePos.top,left:annoncePos.left,minWidth:220}}><div style={{fontSize:11,fontWeight:700,color:P.accent,marginBottom:8}}>Diffusion de l'annonce</div>{[{k:"leboncoin",l:"Leboncoin"},{k:"lacentrale",l:"La Centrale"},{k:"autoscout24",l:"AutoScout24"}].map(item=>(<label key={item.k} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={!!steps.achat.prepa.annonce?.[item.k]} onChange={e=>updateAnnonceItem(item.k,e.target.checked)} style={{accentColor:P.accent,width:16,height:16}}/>{item.l}</label>))}</div></>)}
      {openDocs&&(<><div style={{position:"fixed",inset:0,zIndex:9998}} onClick={()=>setOpenDocs(false)}/><div style={{...ddStyle,top:docsPos.top,left:docsPos.left,minWidth:320,maxWidth:380,maxHeight:340,overflowY:"auto"}}><div style={{fontSize:11,fontWeight:700,color:P.accent,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span>Documents ({documents.length})</span><span style={{fontSize:9,color:P.textSoft,fontWeight:500,fontFamily:"monospace"}}>{folderId(vehicle)}</span></div>{documents.length===0?(<div style={{fontSize:12,color:P.textSoft,padding:"12px 4px",textAlign:"center"}}>Aucun document déposé</div>):(<div style={{display:"flex",flexDirection:"column",gap:5}}>{documents.map(doc=>(<div key={doc.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",background:"#FAFBFC",border:`1px solid ${P.border}`,borderRadius:7}}><span style={{color:P.accent,display:"flex",alignItems:"center",flexShrink:0}}><IconFile/></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:P.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={doc.name}>{doc.name}</div><div style={{fontSize:10,color:P.textSoft,marginTop:1}}>{fmtSize(doc.size)} · {fmtD(doc.date?.split("T")[0])}{doc.oversized&&" · trop volumineux"}</div></div>{doc.data&&<button onClick={()=>downloadDoc(doc)} style={{background:P.accentSoft,color:P.accent,border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>↓</button>}<button onClick={()=>removeDoc(doc.id)} style={{background:"none",color:P.red,border:"none",cursor:"pointer",padding:4,fontSize:16,fontWeight:700,lineHeight:1}}>×</button></div>))}</div>)}</div></>)}
    </div>
  );
}
