import { useState, useMemo, useRef } from 'react';
import { P, STATUTS, EMPTY_FORM, EMPTY_FILTERS, DEFAULT_STEPS, MQ, CARBURANTS, BOITES, CATEGORIES, TVA_TYPES } from '../../utils/constants';
import { fmtP, fmtK, fmtD, r2, daysColor, fmtDays, calcMargin, daysInStock } from '../../utils/formatters';
import { useStore } from '../../store/useStore';
import { resizeImage } from '../../utils/imageUtils';
import { useIsMobile } from '../../hooks/useIsMobile';
import StepTracker from '../../components/StepTracker';
import { MarginBadge, PhotoPlaceholder, FuelTag, TvaTag, DaysBadge } from '../../components/VehicleBadges';
import * as XLSX from 'xlsx';
import { IconPlus, IconPencil, IconTrash, IconList, IconGrid, IconClose, IconCar, IconSearch, IconFilter, IconReset, IconCamera, IconSort, IconChevDown, IconSettings, IconDownload, IconKanban } from '../../components/Icons';

const PRIORITY_LABELS = ['','Modérée','Importante','Haute'];
const PRIORITY_COLOR  = '#F59E0B';

const COL_DEFS = [
  { id:'priorite',        label:'Priorité',    sortKey:'priorite',         group:'Identification' },
  { id:'marque',          label:'Marque',      sortKey:'marque',           group:'Identification' },
  { id:'modele',          label:'Modèle',      sortKey:'modele',           group:'Identification' },
  { id:'numeroVO',        label:'N° VO',       sortKey:'numeroVO',         group:'Identification' },
  { id:'vin',             label:'VIN',          sortKey:'vin',              group:'Identification' },
  { id:'statut',          label:'Statut',      sortKey:'statut',           group:'Identification' },
  { id:'carburant',       label:'Carburant',   sortKey:'carburant',        group:'Véhicule' },
  { id:'boite',           label:'Boîte',       sortKey:'boite',            group:'Véhicule' },
  { id:'categorie',       label:'Catégorie',   sortKey:'categorie',        group:'Véhicule' },
  { id:'puissanceFiscale',label:'CV fiscaux',  sortKey:'puissanceFiscale', group:'Véhicule' },
  { id:'km',              label:'Km',          sortKey:'kmAffiche',        group:'Suivi' },
  { id:'jours',           label:'Jours stock', sortKey:'dateAchat',        group:'Suivi' },
  { id:'dateAchat',       label:'Date achat',  sortKey:'dateAchat',        group:'Suivi' },
  { id:'dateMEC',         label:'MEC',         sortKey:'dateMEC',          group:'Suivi' },
  { id:'emplacement',     label:'Emplacement', sortKey:'emplacement',      group:'Suivi' },
  { id:'achat',           label:'Achat',       sortKey:'prixAchatTTC',     group:'Prix' },
  { id:'vente',           label:'Vente',       sortKey:'prixVenteTTC',     group:'Prix' },
  { id:'marge',           label:'Marge',       sortKey:null,               group:'Prix' },
  { id:'tva',             label:'TVA',         sortKey:'tva',              group:'Prix' },
];
const DEFAULT_COLS = ['priorite','marque','modele','carburant','km','jours','achat','vente','marge','tva'];
const COL_GROUPS = ['Identification','Véhicule','Suivi','Prix'];

export default function Stock() {
  const mob = useIsMobile();
  const vehicles    = useStore(s => s.vehicles);
  const addVehicle    = useStore(s => s.addVehicle);
  const updateVehicle = useStore(s => s.updateVehicle);
  const deleteVehicle = useStore(s => s.deleteVehicle);
  const stockListCols   = useStore(s => s.stockListCols);
  const setStockListCols = useStore(s => s.setStockListCols);
  const kanbanCols      = useStore(s => s.kanbanCols) || [{id:'entree',label:'Entrée stock'},{id:'preparation',label:'En préparation'},{id:'pret',label:'Prêt à vendre'},{id:'vendu',label:'Vendu'}];
  const setKanbanCols   = useStore(s => s.setKanbanCols);
  const [viewMode, setViewMode] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({...EMPTY_FORM});
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filters, setFilters] = useState({...EMPTY_FILTERS});
  const [showFilters, setShowFilters] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const fileRef = useRef(null);
  const colBtnRef = useRef(null);
  const [showColPicker, setShowColPicker] = useState(false);
  const [editingColId, setEditingColId] = useState(null);
  const [editingColLabel, setEditingColLabel] = useState('');
  const saveColName = (id) => {
    if(editingColLabel.trim()) setKanbanCols(kanbanCols.map(c=>c.id===id?{...c,label:editingColLabel.trim()}:c));
    setEditingColId(null);
  };

  const toggleSort = (key) => { if(sortKey===key) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortKey(key); setSortDir('asc'); } };
  const toggleExpand = (id) => setExpandedSteps(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleAllSteps = () => { if(showSteps){setExpandedSteps(new Set());}else{setExpandedSteps(new Set(vehicles.map(v=>v.id)));} setShowSteps(!showSteps); };

  const updateVehicleSteps = (id, newSteps) => updateVehicle(id, { steps: newSteps });
  const updateVehicleDocs  = (id, newDocs)  => updateVehicle(id, { documents: newDocs });

  const isElectric = form.carburant==='Électrique' || form.carburant==='Hybride Rechargeable';
  const modeles = form.marque ? (MQ[form.marque]||[]) : [];
  const canSave = form.immatriculation.trim() && form.marque && form.modele;
  const isDed = form.tva==='TVA déductible';

  const updateField = (key, val) => {
    setForm(prev => {
      const n = {...prev, [key]:val};
      if(key==='marque') n.modele='';
      if(key==='prixAchatHT')  { n.prixAchatTTC  = val ? String(r2(Number(val)*1.2)) : ''; }
      if(key==='prixAchatTTC') { n.prixAchatHT   = val ? String(r2(Number(val)/1.2)) : ''; }
      if(key==='prixVenteHT')  { n.prixVenteTTC  = val ? String(r2(Number(val)*1.2)) : ''; }
      if(key==='prixVenteTTC') { n.prixVenteHT   = val ? String(r2(Number(val)/1.2)) : ''; }
      return n;
    });
  };

  const updateFilter = (key, val) => setFilters(prev => { const n={...prev,[key]:val}; if(key==='marque') n.modele=''; return n; });

  const activeFilterCount = useMemo(() => {
    let n = 0;
    for(const [k,v] of Object.entries(filters)) {
      if(k==='statuts') { if(v.length!==1||v[0]!=='stock') n++; }
      else if(v!=='') n++;
    }
    return n;
  }, [filters]);

  const toggleStatutFilter = (k) => setFilters(prev => {
    const cur = prev.statuts||[];
    const next = cur.includes(k) ? cur.filter(s=>s!==k) : [...cur,k];
    return {...prev, statuts:next};
  });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const b = await resizeImage(file);
    setForm(prev=>({...prev, photo:b}));
  };

  const openAdd  = () => { setForm({...EMPTY_FORM, dateAchat: new Date().toISOString().slice(0,16), steps:JSON.parse(JSON.stringify(DEFAULT_STEPS))}); setEditId(null); setAttempted(false); setShowForm(true); };
  const openEdit = (v) => { setForm({...v}); setEditId(v.id); setAttempted(false); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setAttempted(false); };

  const handleSave = () => {
    setAttempted(true);
    if(!canSave) return;
    const entry = {...form, id:editId||String(Date.now()), kmAffiche:form.kilometrage?String(Number(form.kilometrage)+200):''};
    if(!entry.steps) entry.steps = JSON.parse(JSON.stringify(DEFAULT_STEPS));
    if(editId) { updateVehicle(editId, entry); } else { addVehicle(entry); }
    closeForm();
  };

  const handleDelete = (id) => { deleteVehicle(id); setDeleteConfirm(null); };

  const filtered = useMemo(() => {
    let r = vehicles;
    if(search.trim()){const q=search.toLowerCase();r=r.filter(v=>[v.immatriculation,v.numeroVO,v.marque,v.modele,v.carburant,v.vin,v.categorie].some(f=>f?.toLowerCase().includes(q)));}
    const f = filters;
    if(f.statuts&&f.statuts.length>0) r=r.filter(v=>f.statuts.includes(v.statut||'stock'));
    if(f.marque)    r=r.filter(v=>v.marque===f.marque);
    if(f.modele)    r=r.filter(v=>v.modele===f.modele);
    if(f.carburant) r=r.filter(v=>v.carburant===f.carburant);
    if(f.boite)     r=r.filter(v=>v.boite===f.boite);
    if(f.categorie) r=r.filter(v=>v.categorie===f.categorie);
    if(f.tva)       r=r.filter(v=>v.tva===f.tva);
    if(f.kmMin) r=r.filter(v=>Number(v.kmAffiche||v.kilometrage||0)>=Number(f.kmMin));
    if(f.kmMax) r=r.filter(v=>Number(v.kmAffiche||v.kilometrage||0)<=Number(f.kmMax));
    if(f.prixMin) r=r.filter(v=>Number(v.prixVenteTTC||0)>=Number(f.prixMin));
    if(f.prixMax) r=r.filter(v=>Number(v.prixVenteTTC||0)<=Number(f.prixMax));
    if(f.puissanceMin) r=r.filter(v=>Number(v.puissanceFiscale||0)>=Number(f.puissanceMin));
    if(f.puissanceMax) r=r.filter(v=>Number(v.puissanceFiscale||0)<=Number(f.puissanceMax));
    if(f.dateMECMin)   r=r.filter(v=>v.dateMEC>=f.dateMECMin);
    if(f.dateMECMax)   r=r.filter(v=>v.dateMEC<=f.dateMECMax);
    if(sortKey){r=[...r].sort((a,b)=>{let va=a[sortKey]||'',vb=b[sortKey]||'';if(['kilometrage','kmAffiche','prixAchatHT','prixAchatTTC','prixVenteHT','prixVenteTTC','puissanceFiscale','priorite'].includes(sortKey)){va=Number(va)||0;vb=Number(vb)||0;return sortDir==='asc'?va-vb:vb-va;}va=String(va).toLowerCase();vb=String(vb).toLowerCase();return sortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va);});}
    return r;
  }, [vehicles, search, sortKey, sortDir, filters]);

  // Options dynamiques pour les filtres (depuis le stock réel)
  const stockMarques    = useMemo(()=>[...new Set(vehicles.map(v=>v.marque).filter(Boolean))].sort(),[vehicles]);
  const stockModeles    = useMemo(()=>{const base=filters.marque?vehicles.filter(v=>v.marque===filters.marque):vehicles;return[...new Set(base.map(v=>v.modele).filter(Boolean))].sort();},[vehicles,filters.marque]);
  const stockCarburants = useMemo(()=>[...new Set(vehicles.map(v=>v.carburant).filter(Boolean))].sort(),[vehicles]);
  const stockBoites     = useMemo(()=>[...new Set(vehicles.map(v=>v.boite).filter(Boolean))].sort(),[vehicles]);
  const stockCategories = useMemo(()=>[...new Set(vehicles.map(v=>v.categorie).filter(Boolean))].sort(),[vehicles]);

  // Styles réutilisables
  const inp = (field, req) => ({padding:mob?'10px 12px':'8px 11px',borderRadius:7,fontSize:mob?16:13,color:P.text,outline:'none',background:'#FAFBFC',border:(attempted&&req&&!form[field])?`2px solid ${P.red}`:`1px solid ${P.border}`,width:'100%',boxSizing:'border-box'});
  const sel = (field, req) => ({...inp(field,req),appearance:'none',paddingRight:30,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 10px center'});
  const lbl  = {fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px',color:P.textSoft};
  const grp  = {display:'flex',flexDirection:'column',gap:4};
  const sec_ = {gridColumn:'1/-1',fontSize:13,fontWeight:700,color:P.accent,borderBottom:`1px solid ${P.border}`,paddingBottom:6,marginTop:6};
  const ibtn = {background:'none',border:'none',cursor:'pointer',padding:mob?8:4,borderRadius:6,display:'flex',alignItems:'center'};
  const hint = {fontSize:11,color:P.textSoft,marginTop:1};
  const fSel = {padding:mob?'10px 12px':'6px 9px',borderRadius:6,fontSize:mob?16:12,color:P.text,outline:'none',background:'#FAFBFC',border:`1px solid ${P.border}`,width:'100%',boxSizing:'border-box',appearance:'none',paddingRight:26,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 8px center'};
  const fInp = {padding:mob?'10px 12px':'6px 9px',borderRadius:6,fontSize:mob?16:12,color:P.text,outline:'none',background:'#FAFBFC',border:`1px solid ${P.border}`,width:'100%',boxSizing:'border-box'};
  const fLbl = {fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.3px',color:P.textSoft,marginBottom:3};
  const fGrp = {marginBottom:14};

  const getDP = (v) => v.tva==='TVA déductible' ? {achat:fmtP(v.prixAchatHT),vente:fmtP(v.prixVenteTTC)} : {achat:fmtP(v.prixAchatTTC),vente:fmtP(v.prixVenteTTC)};

  const exportToExcel = () => {
    const rows = filtered.map(v => {
      const m = calcMargin(v);
      return {
        'Immatriculation': v.immatriculation||'',
        'Statut': v.statut||'stock',
        'N° VO': v.numeroVO||'',
        'Marque': v.marque||'',
        'Modèle': v.modele||'',
        'Carburant': v.carburant||'',
        'Boîte': v.boite||'',
        'Catégorie': v.categorie||'',
        'CV fiscaux': v.puissanceFiscale||'',
        'Km affiché': v.kmAffiche||v.kilometrage||'',
        'Emplacement': v.emplacement||'',
        'Date achat': fmtD(v.dateAchat),
        'Date MEC': fmtD(v.dateMEC),
        'Jours stock': daysInStock(v.dateAchat)??'',
        'TVA': v.tva||'',
        'Prix achat HT': v.prixAchatHT||'',
        'Prix achat TTC': v.prixAchatTTC||'',
        'Prix vente TTC': v.prixVenteTTC||'',
        'Marge (€)': m?.marge??'',
        'Marge (%)': m?.pct??'',
        'VIN': v.vin||'',
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock');
    XLSX.writeFile(wb, `stock_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const filterContent = () => (<>
    <div style={{...fGrp,paddingBottom:12,marginBottom:14,borderBottom:`1px solid ${P.border}`}}>
      <div style={{...fLbl,marginBottom:6}}>Vue</div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {STATUTS.map(s=>{
          const checked=(filters.statuts||[]).includes(s.k);
          const count=vehicles.filter(v=>(v.statut||'stock')===s.k).length;
          return (
            <label key={s.k} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:6,cursor:'pointer',background:checked?s.bg:'transparent',border:`1px solid ${checked?s.color+'40':'transparent'}`,transition:'all 0.15s'}}>
              <input type="checkbox" checked={checked} onChange={()=>toggleStatutFilter(s.k)} style={{accentColor:s.color,width:15,height:15,flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:checked?s.color:P.text,flex:1}}>{s.l}</span>
              <span style={{fontSize:10,fontWeight:700,color:checked?s.color:P.textSoft,background:checked?'#ffffff80':P.bg,padding:'1px 7px',borderRadius:10}}>{count}</span>
            </label>
          );
        })}
      </div>
    </div>
    <div style={fGrp}><div style={fLbl}>Marque</div><select style={fSel} value={filters.marque} onChange={e=>updateFilter('marque',e.target.value)}><option value="">Toutes</option>{stockMarques.map(m=><option key={m}>{m}</option>)}</select></div>
    <div style={fGrp}><div style={fLbl}>Modèle</div><select style={fSel} value={filters.modele} onChange={e=>updateFilter('modele',e.target.value)}><option value="">Tous</option>{stockModeles.map(m=><option key={m}>{m}</option>)}</select></div>
    <div style={fGrp}><div style={fLbl}>Carburant</div><select style={fSel} value={filters.carburant} onChange={e=>updateFilter('carburant',e.target.value)}><option value="">Tous</option>{stockCarburants.map(c=><option key={c}>{c}</option>)}</select></div>
    <div style={fGrp}><div style={fLbl}>Boîte</div><select style={fSel} value={filters.boite} onChange={e=>updateFilter('boite',e.target.value)}><option value="">Toutes</option>{stockBoites.map(b=><option key={b}>{b}</option>)}</select></div>
    <div style={fGrp}><div style={fLbl}>Catégorie</div><select style={fSel} value={filters.categorie} onChange={e=>updateFilter('categorie',e.target.value)}><option value="">Toutes</option>{stockCategories.map(c=><option key={c}>{c}</option>)}</select></div>
    <div style={fGrp}><div style={fLbl}>TVA</div><select style={fSel} value={filters.tva} onChange={e=>updateFilter('tva',e.target.value)}><option value="">Toutes</option>{TVA_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
    <div style={fGrp}><div style={fLbl}>Km</div><div style={{display:'flex',gap:6,alignItems:'center'}}><input style={fInp} type="number" placeholder="Min" value={filters.kmMin} onChange={e=>updateFilter('kmMin',e.target.value)}/><span style={{color:P.textSoft,fontSize:11}}>à</span><input style={fInp} type="number" placeholder="Max" value={filters.kmMax} onChange={e=>updateFilter('kmMax',e.target.value)}/></div></div>
    <div style={fGrp}><div style={fLbl}>Prix vente</div><div style={{display:'flex',gap:6,alignItems:'center'}}><input style={fInp} type="number" placeholder="Min" value={filters.prixMin} onChange={e=>updateFilter('prixMin',e.target.value)}/><span style={{color:P.textSoft,fontSize:11}}>à</span><input style={fInp} type="number" placeholder="Max" value={filters.prixMax} onChange={e=>updateFilter('prixMax',e.target.value)}/></div></div>
    <div style={fGrp}><div style={fLbl}>CV</div><div style={{display:'flex',gap:6,alignItems:'center'}}><input style={fInp} type="number" placeholder="Min" value={filters.puissanceMin} onChange={e=>updateFilter('puissanceMin',e.target.value)}/><span style={{color:P.textSoft,fontSize:11}}>à</span><input style={fInp} type="number" placeholder="Max" value={filters.puissanceMax} onChange={e=>updateFilter('puissanceMax',e.target.value)}/></div></div>
    <div style={fGrp}><div style={fLbl}>MEC</div><div style={{display:'flex',flexDirection:'column',gap:4}}><input style={fInp} type="date" value={filters.dateMECMin} onChange={e=>updateFilter('dateMECMin',e.target.value)}/><input style={fInp} type="date" value={filters.dateMECMax} onChange={e=>updateFilter('dateMECMax',e.target.value)}/></div></div>
  </>);

  const visibleDefs = COL_DEFS.filter(d => stockListCols.includes(d.id));
  const columns = [{label:'',key:null},{label:'Immat.',key:'immatriculation'},...visibleDefs.map(d=>({label:d.label,key:d.sortKey})),{label:'',key:null}];
  const renderCell = (colId, v, dp, td) => {
    const s = STATUTS.find(x=>x.k===(v.statut||'stock'))||STATUTS[0];
    switch(colId) {
      case 'priorite': {
        const p=Number(v.priorite)||0;
        return <td key={colId} style={{...td,whiteSpace:'nowrap'}} onClick={e=>e.stopPropagation()}>
          <div style={{display:'flex',gap:0}}>
            {[1,2,3].map(n=>(
              <button key={n} onClick={()=>updateVehicle(v.id,{priorite:p===n?0:n})} title={PRIORITY_LABELS[n]}
                style={{background:'none',border:'none',cursor:'pointer',padding:'1px 2px',fontSize:16,lineHeight:1,color:p>=n?PRIORITY_COLOR:'#D1D5DB',transition:'color 0.1s'}}>★</button>
            ))}
          </div>
        </td>;
      }
      case 'marque':          return <td key={colId} style={{...td,fontWeight:600}}>{v.marque||'—'}</td>;
      case 'modele':          return <td key={colId} style={td}>{v.modele||'—'}</td>;
      case 'numeroVO':        return <td key={colId} style={{...td,fontFamily:'monospace',fontSize:11,color:P.textSoft}}>{v.numeroVO||'—'}</td>;
      case 'vin':             return <td key={colId} style={{...td,fontFamily:'monospace',fontSize:11,color:P.textSoft,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis'}}>{v.vin||'—'}</td>;
      case 'statut':          return <td key={colId} style={td}><span style={{background:s.bg,color:s.color,fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:10}}>{s.l}</span></td>;
      case 'carburant':       return <td key={colId} style={td}><FuelTag carburant={v.carburant}/></td>;
      case 'boite':           return <td key={colId} style={td}>{v.boite||'—'}</td>;
      case 'categorie':       return <td key={colId} style={td}>{v.categorie||'—'}</td>;
      case 'puissanceFiscale':return <td key={colId} style={td}>{v.puissanceFiscale?v.puissanceFiscale+' CV':'—'}</td>;
      case 'km':              return <td key={colId} style={td}>{fmtK(v.kmAffiche||v.kilometrage)}</td>;
      case 'jours':           return <td key={colId} style={td}><DaysBadge dateAchat={v.dateAchat}/></td>;
      case 'dateAchat':       return <td key={colId} style={td}>{fmtD(v.dateAchat)}</td>;
      case 'dateMEC':         return <td key={colId} style={td}>{fmtD(v.dateMEC)}</td>;
      case 'emplacement':     return <td key={colId} style={td}>{v.emplacement||'—'}</td>;
      case 'achat':           return <td key={colId} style={td}>{dp.achat}</td>;
      case 'vente':           return <td key={colId} style={{...td,fontWeight:700}}>{dp.vente}</td>;
      case 'marge':           return <td key={colId} style={td}><MarginBadge v={v} compact/></td>;
      case 'tva':             return <td key={colId} style={td}><TvaTag tva={v.tva}/></td>;
      default:                return <td key={colId} style={td}>—</td>;
    }
  };

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",color:P.text}}>
      {/* TOOLBAR */}
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:mob?14:20}}>
        {/* Ligne recherche — pleine largeur sur mobile */}
        {mob&&(
          <div style={{display:'flex',alignItems:'center',background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:'9px 12px',gap:8}}>
            <IconSearch/>
            <input style={{border:'none',outline:'none',fontSize:16,background:'transparent',flex:1,color:P.text,minWidth:0}} placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:P.textSoft,padding:2,display:'flex',alignItems:'center'}}><IconClose/></button>}
          </div>
        )}
        {/* Ligne boutons */}
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <span style={{background:P.accentSoft,color:P.accent,fontSize:12,fontWeight:600,padding:'3px 10px',borderRadius:20}}>{filtered.length}/{vehicles.length}</span>
          {!mob&&(
            <div style={{display:'flex',alignItems:'center',background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:'7px 12px',gap:8,minWidth:160,maxWidth:260}}>
              <IconSearch/>
              <input style={{border:'none',outline:'none',fontSize:13,background:'transparent',flex:1,color:P.text,minWidth:0}} placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          )}
          <button onClick={()=>setShowFilters(f=>!f)} style={{display:'flex',alignItems:'center',gap:5,background:showFilters&&!mob?P.accentSoft:P.card,color:showFilters&&!mob?P.accent:P.textSoft,border:`1px solid ${showFilters&&!mob?P.accent:P.border}`,borderRadius:8,padding:mob?'9px 12px':'7px 12px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            <IconFilter/>{mob?'':'Filtres'}{activeFilterCount>0&&<span style={{background:P.accent,color:'#fff',fontSize:10,padding:'1px 6px',borderRadius:10,fontWeight:700}}>{activeFilterCount}</span>}
          </button>
          <button onClick={toggleAllSteps} style={{display:'flex',alignItems:'center',gap:5,background:showSteps?P.accentSoft:P.card,color:showSteps?P.accent:P.textSoft,border:`1px solid ${showSteps?P.accent:P.border}`,borderRadius:8,padding:mob?'9px 12px':'7px 12px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            {mob?'📋':'📋 Étapes'}
          </button>
          <div style={{display:'flex',background:P.card,border:`1px solid ${P.border}`,borderRadius:8,overflow:'hidden'}}>
            <button style={{padding:'7px 10px',background:viewMode==='list'?P.accent:'transparent',color:viewMode==='list'?'#fff':P.textSoft,border:'none',cursor:'pointer',display:'flex',alignItems:'center'}} onClick={()=>setViewMode('list')}><IconList/></button>
            <button style={{padding:'7px 10px',background:viewMode==='grid'?P.accent:'transparent',color:viewMode==='grid'?'#fff':P.textSoft,border:'none',cursor:'pointer',display:'flex',alignItems:'center'}} onClick={()=>setViewMode('grid')}><IconKanban/></button>
          </div>
          {!mob&&viewMode==='list'&&(
            <button ref={colBtnRef} onClick={()=>setShowColPicker(p=>!p)} title="Personnaliser les colonnes" style={{display:'flex',alignItems:'center',background:showColPicker?P.accentSoft:P.card,color:showColPicker?P.accent:P.textSoft,border:`1px solid ${showColPicker?P.accent:P.border}`,borderRadius:8,padding:'7px 10px',cursor:'pointer'}}>
              <IconSettings/>
            </button>
          )}
          {!mob&&(
            <button onClick={exportToExcel} title="Exporter en Excel" style={{display:'flex',alignItems:'center',gap:5,background:P.card,color:P.textSoft,border:`1px solid ${P.border}`,borderRadius:8,padding:'7px 12px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
              <IconDownload/><span>Excel</span>
            </button>
          )}
          <button style={{display:'flex',alignItems:'center',gap:6,background:P.accent,color:'#fff',border:'none',borderRadius:8,padding:mob?'10px 14px':'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={openAdd}>
            <IconPlus/>{mob?'':'Ajouter'}
          </button>
        </div>
      </div>

      {/* CONTENU */}
      {filtered.length===0&&vehicles.length===0 ? (
        <div style={{textAlign:'center',padding:'50px 20px',color:P.textSoft}}>
          <div style={{fontSize:36,marginBottom:12,opacity:0.3,display:'flex',justifyContent:'center'}}><IconCar/></div>
          <div style={{fontSize:15,fontWeight:600}}>Aucun véhicule</div>
          <div style={{fontSize:13,marginTop:4}}>Cliquez sur « Ajouter » pour commencer</div>
        </div>
      ) : (
        <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
          {/* SIDEBAR FILTRES DESKTOP */}
          {showFilters&&!mob&&(
            <div style={{width:220,minWidth:220,background:P.card,borderRadius:12,border:`1px solid ${P.border}`,padding:'14px 16px',boxShadow:'0 1px 3px rgba(0,0,0,0.04)',position:'sticky',top:20,maxHeight:'calc(100vh - 100px)',overflowY:'auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <span style={{fontSize:13,fontWeight:700,color:P.accent}}>Filtres{activeFilterCount>0&&<span style={{background:P.accent,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10,marginLeft:6}}>{activeFilterCount}</span>}</span>
                {activeFilterCount>0&&<button onClick={()=>setFilters({...EMPTY_FILTERS})} style={{background:'none',border:'none',cursor:'pointer',color:P.red,fontSize:11,fontWeight:600,display:'flex',alignItems:'center'}}><IconReset/></button>}
              </div>
              {filterContent()}
            </div>
          )}
          <div style={{flex:1,minWidth:0}}>
            {filtered.length===0 ? (
              <div style={{textAlign:'center',padding:'40px 20px',color:P.textSoft,background:P.card,borderRadius:12}}>
                <div style={{fontSize:15,fontWeight:600}}>Aucun résultat</div>
                {activeFilterCount>0&&<button onClick={()=>setFilters({...EMPTY_FILTERS})} style={{marginTop:12,background:P.accent,color:'#fff',border:'none',borderRadius:8,padding:'10px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Réinitialiser</button>}
              </div>
            ) : viewMode==='grid' ? (
              /* VUE KANBAN */
              <div style={{display:'flex',gap:12,overflowX:'auto',WebkitOverflowScrolling:'touch',alignItems:'flex-start',paddingBottom:8}}>
                {kanbanCols.map((col,ci)=>{
                  const colVehicles=filtered.filter(v=>(v.kanbanCol||kanbanCols[0]?.id)===col.id);
                  const isEditingCol=editingColId===col.id;
                  return (
                    <div key={col.id} style={{minWidth:250,width:250,flexShrink:0}}>
                      {/* En-tête colonne */}
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8,padding:'4px 2px'}}>
                        {isEditingCol
                          ?<input autoFocus value={editingColLabel} onChange={e=>setEditingColLabel(e.target.value)} onBlur={()=>saveColName(col.id)} onKeyDown={e=>{if(e.key==='Enter')saveColName(col.id);if(e.key==='Escape')setEditingColId(null);}} style={{flex:1,border:'none',outline:`2px solid ${P.accent}`,borderRadius:6,padding:'4px 8px',fontSize:13,fontWeight:700,fontFamily:'inherit',background:P.card}}/>
                          :<span onClick={()=>{setEditingColId(col.id);setEditingColLabel(col.label);}} title="Cliquer pour renommer" style={{flex:1,fontWeight:700,fontSize:13,cursor:'text',color:P.text,padding:'4px 2px'}}>{col.label}</span>
                        }
                        <span style={{background:P.accentSoft,color:P.accent,fontSize:11,fontWeight:700,padding:'1px 8px',borderRadius:10,flexShrink:0}}>{colVehicles.length}</span>
                        {kanbanCols.length>1&&(
                          <button title="Supprimer cette étape" onClick={()=>{const rest=kanbanCols.filter(c=>c.id!==col.id);const dest=rest[Math.max(0,ci-1)]?.id||'';colVehicles.forEach(v=>updateVehicle(v.id,{kanbanCol:dest}));setKanbanCols(rest);}} style={{background:'none',border:'none',cursor:'pointer',color:P.textSoft,fontSize:16,padding:'2px 4px',borderRadius:4,lineHeight:1,flexShrink:0}}>×</button>
                        )}
                      </div>
                      {/* Cartes */}
                      <div style={{background:P.bg,borderRadius:10,border:`1px solid ${P.border}`,padding:8,display:'flex',flexDirection:'column',gap:8,minHeight:100}}>
                        {colVehicles.map(v=>{
                          const dp=getDP(v); const prio=Number(v.priorite)||0;
                          return (
                            <div key={v.id} style={{background:P.card,borderRadius:8,border:`1px solid ${P.border}`,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                              {v.photo
                                ?<div style={{height:90,overflow:'hidden'}}><img src={v.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
                                :<div style={{height:32,background:P.accentSoft,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.35}}><IconCar/></div>
                              }
                              <div style={{padding:'8px 10px'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:13,fontWeight:700,color:P.accent,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.marque} {v.modele}</div>
                                    <div style={{fontSize:11,color:P.textSoft}}>{v.immatriculation}</div>
                                  </div>
                                  {prio>0&&<span style={{color:PRIORITY_COLOR,fontSize:12,marginLeft:4,flexShrink:0,letterSpacing:0.5}}>{'★'.repeat(prio)}</span>}
                                </div>
                                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:5}}>
                                  <FuelTag carburant={v.carburant}/>
                                  <DaysBadge dateAchat={v.dateAchat}/>
                                </div>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                                  <span style={{fontSize:12,fontWeight:700,color:P.text}}>{dp.vente}</span>
                                  <MarginBadge v={v} compact/>
                                </div>
                                <div style={{display:'flex',gap:4,paddingTop:6,borderTop:`1px solid ${P.border}`}}>
                                  <button disabled={ci===0} onClick={()=>updateVehicle(v.id,{kanbanCol:kanbanCols[ci-1].id})} style={{flex:1,background:ci===0?'transparent':P.accentSoft,color:ci===0?P.textSoft:P.accent,border:'none',borderRadius:6,padding:'4px 0',cursor:ci===0?'default':'pointer',fontSize:13,opacity:ci===0?0.25:1}}>←</button>
                                  <button onClick={()=>openEdit(v)} style={{background:P.accentSoft,color:P.accent,border:'none',borderRadius:6,padding:'4px 7px',cursor:'pointer',display:'flex',alignItems:'center'}}><IconPencil/></button>
                                  <button onClick={()=>setDeleteConfirm(v.id)} style={{background:P.redSoft,color:P.red,border:'none',borderRadius:6,padding:'4px 7px',cursor:'pointer',display:'flex',alignItems:'center'}}><IconTrash/></button>
                                  <button disabled={ci===kanbanCols.length-1} onClick={()=>updateVehicle(v.id,{kanbanCol:kanbanCols[ci+1].id})} style={{flex:1,background:ci===kanbanCols.length-1?'transparent':P.accentSoft,color:ci===kanbanCols.length-1?P.textSoft:P.accent,border:'none',borderRadius:6,padding:'4px 0',cursor:ci===kanbanCols.length-1?'default':'pointer',fontSize:13,opacity:ci===kanbanCols.length-1?0.25:1}}>→</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {colVehicles.length===0&&<div style={{textAlign:'center',padding:'18px 8px',color:P.textSoft,fontSize:12}}>Aucun véhicule</div>}
                      </div>
                    </div>
                  );
                })}
                {/* Ajouter une colonne */}
                <button onClick={()=>{const id='col_'+Date.now();setKanbanCols([...kanbanCols,{id,label:'Nouvelle étape'}]);setEditingColId(id);setEditingColLabel('Nouvelle étape');}} style={{minWidth:180,height:54,background:'transparent',border:`2px dashed ${P.border}`,borderRadius:10,cursor:'pointer',color:P.textSoft,fontSize:13,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6,flexShrink:0,alignSelf:'flex-start',marginTop:38}}>
                  <IconPlus/> Étape
                </button>
              </div>
            ) : (
              /* VUE LISTE */
              <div style={{background:P.card,borderRadius:12,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
                <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
                <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,minWidth:mob?500:undefined}}>
                  <thead>
                    <tr>
                      {columns.map((col,i)=>(
                        <th key={i} onClick={col.key?()=>toggleSort(col.key):undefined} style={{textAlign:'left',padding:'10px 10px',fontSize:10.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:sortKey===col.key?P.accent:P.textSoft,borderBottom:`2px solid ${P.border}`,background:'#FAFBFC',whiteSpace:'nowrap',cursor:col.key?'pointer':'default',userSelect:'none'}}>
                          <span style={{display:'inline-flex',alignItems:'center',gap:3}}>
                            {col.label}
                            {col.key&&<IconSort active={sortKey===col.key} dir={sortDir}/>}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(v=>{
                      const td={padding:'8px 10px',fontSize:13,borderBottom:`1px solid ${P.border}`,whiteSpace:'nowrap',verticalAlign:'middle'};
                      const dp=getDP(v); const isExp=expandedSteps.has(v.id);
                      return [
                        <tr key={v.id} style={{cursor:'pointer',transition:'background 0.1s'}} onClick={()=>toggleExpand(v.id)} onMouseEnter={e=>e.currentTarget.style.background='#E8EDF4'} onMouseLeave={e=>e.currentTarget.style.background=isExp?'#EEF2F8':''}>

                          <td style={{...td,padding:'6px 10px'}}>{v.photo?<img src={v.photo} alt="" style={{width:40,height:40,borderRadius:6,objectFit:'cover',display:'block'}}/>:<PhotoPlaceholder size={40}/>}</td>
                          <td style={{...td,fontWeight:700,color:P.accent}}>{v.immatriculation||'—'}</td>
                          {visibleDefs.map(d=>renderCell(d.id,v,dp,td))}
                          <td style={{...td,whiteSpace:'nowrap'}} onClick={e=>e.stopPropagation()}>
                            <button style={ibtn} onClick={()=>openEdit(v)} onMouseEnter={e=>e.currentTarget.style.background=P.accentSoft} onMouseLeave={e=>e.currentTarget.style.background=''}><span style={{color:P.accent}}><IconPencil/></span></button>
                            <button style={{...ibtn,marginLeft:2}} onClick={()=>setDeleteConfirm(v.id)} onMouseEnter={e=>e.currentTarget.style.background=P.redSoft} onMouseLeave={e=>e.currentTarget.style.background=''}><span style={{color:P.red}}><IconTrash/></span></button>
                          </td>
                        </tr>,
                        isExp&&(
                          <tr key={v.id+'_steps'}><td colSpan={columns.length} style={{padding:0}}>
                            <StepTracker vehicle={v} onUpdate={ns=>updateVehicleSteps(v.id,ns)} onUpdateDocs={d=>updateVehicleDocs(v.id,d)} mob={mob}/>
                          </td></tr>
                        )
                      ];
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COLUMN PICKER */}
      {showColPicker&&!mob&&(()=>{
        const rect=colBtnRef.current?.getBoundingClientRect();
        return (
          <div style={{position:'fixed',inset:0,zIndex:999}} onClick={()=>setShowColPicker(false)}>
            <div style={{position:'fixed',top:rect?rect.bottom+6:100,right:rect?window.innerWidth-rect.right:20,background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:'16px 18px',boxShadow:'0 8px 32px rgba(0,0,0,0.12)',minWidth:230,maxHeight:'80vh',overflowY:'auto',zIndex:1000}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <span style={{fontSize:13,fontWeight:700,color:P.text}}>Colonnes visibles</span>
                <button onClick={()=>setStockListCols([...DEFAULT_COLS])} style={{background:'none',border:'none',cursor:'pointer',color:P.accent,fontSize:11,fontWeight:600}}>Réinitialiser</button>
              </div>
              {COL_GROUPS.map(grp=>{
                const grpCols=COL_DEFS.filter(d=>d.group===grp);
                return (
                  <div key={grp} style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:P.textSoft,marginBottom:5,paddingBottom:3,borderBottom:`1px solid ${P.border}`}}>{grp}</div>
                    {grpCols.map(def=>{
                      const checked=stockListCols.includes(def.id);
                      return (
                        <label key={def.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 2px',cursor:'pointer',borderRadius:6}}>
                          <input type="checkbox" checked={checked} onChange={()=>setStockListCols(checked?stockListCols.filter(c=>c!==def.id):[...stockListCols,def.id])} style={{accentColor:P.accent,width:14,height:14,flexShrink:0,cursor:'pointer'}}/>
                          <span style={{fontSize:13,color:checked?P.text:P.textSoft}}>{def.label}</span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* FILTRES MOBILE */}
      {showFilters&&mob&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',justifyContent:'flex-end'}} onClick={e=>{if(e.target===e.currentTarget)setShowFilters(false);}}>
          <div style={{width:'85%',maxWidth:360,background:P.card,height:'100%',overflowY:'auto',padding:'20px 18px'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <span style={{fontSize:16,fontWeight:700,color:P.accent}}>Filtres</span>
              <button onClick={()=>setShowFilters(false)} style={{background:'none',border:'none',cursor:'pointer',color:P.textSoft,padding:8}}><IconClose/></button>
            </div>
            {activeFilterCount>0&&<button onClick={()=>setFilters({...EMPTY_FILTERS})} style={{background:P.redSoft,color:P.red,border:'none',borderRadius:8,padding:10,fontSize:13,fontWeight:600,cursor:'pointer',width:'100%',marginBottom:16}}>Réinitialiser</button>}
            {filterContent()}
            <button onClick={()=>setShowFilters(false)} style={{background:P.accent,color:'#fff',border:'none',borderRadius:10,padding:14,fontSize:14,fontWeight:600,cursor:'pointer',width:'100%',marginTop:20}}>Voir {filtered.length} résultat{filtered.length>1?'s':''}</button>
          </div>
        </div>
      )}

      {/* FORMULAIRE */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:mob?'transparent':'rgba(0,0,0,0.35)',zIndex:1000,display:'flex',alignItems:mob?'stretch':'flex-start',justifyContent:'center',padding:mob?0:'24px 16px',overflowY:mob?'hidden':'auto'}}>
          <div style={{background:P.card,borderRadius:mob?0:16,width:'100%',maxWidth:mob?'100%':680,height:mob?'100%':'auto',boxShadow:mob?'none':'0 20px 60px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:mob?'14px 16px':'16px 24px',borderBottom:`1px solid ${P.border}`,flexShrink:0}}>
              <span style={{fontSize:mob?16:17,fontWeight:700,color:P.accent}}>{editId?'Modifier':'Ajouter un véhicule'}</span>
              <button style={{background:'none',border:'none',cursor:'pointer',color:P.textSoft,padding:8}} onClick={closeForm}><IconClose/></button>
            </div>
            {attempted&&!canSave&&(
              <div style={{margin:mob?'12px 16px 0':'12px 24px 0',padding:'10px 14px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,fontSize:13,color:P.red,fontWeight:500,flexShrink:0}}>
                Remplissez : Immatriculation, Marque et Modèle
              </div>
            )}
            <div style={{padding:mob?'16px':'20px 24px',flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
              <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:mob?'12px':'14px 18px'}}>
                <div style={sec_}>Photo</div>
                <div style={{gridColumn:'1/-1',display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
                  {form.photo
                    ? <div style={{position:'relative'}}><img src={form.photo} alt="" style={{width:120,height:90,borderRadius:10,objectFit:'cover',border:`2px solid ${P.border}`}}/><button onClick={()=>setForm(p=>({...p,photo:''}))} style={{position:'absolute',top:-8,right:-8,width:24,height:24,borderRadius:12,background:P.red,color:'#fff',border:'none',cursor:'pointer',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button></div>
                    : <div style={{width:120,height:90,borderRadius:10,border:`2px dashed ${P.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'#FAFBFC',gap:4}} onClick={()=>fileRef.current?.click()}><IconCamera/><span style={{fontSize:11,color:P.textSoft}}>Photo</span></div>
                  }
                  <button onClick={()=>fileRef.current?.click()} style={{background:P.accentSoft,color:P.accent,border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}}>{form.photo?'Changer':'Parcourir'}</button>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto}/>
                </div>

                <div style={sec_}>Identification</div>
                <div style={{...grp,gridColumn:'1/-1'}}>
                  <label style={lbl}>Statut</label>
                  <div style={{display:'flex',gap:6}}>
                    {STATUTS.map(s=>(
                      <button key={s.k} onClick={()=>updateField('statut',s.k)} style={{flex:1,padding:mob?'10px':'8px 10px',borderRadius:8,border:`2px solid ${form.statut===s.k?s.color:P.border}`,background:form.statut===s.k?s.bg:P.card,color:form.statut===s.k?s.color:P.textSoft,fontSize:mob?13:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',fontFamily:'inherit'}}>
                        {s.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={grp}><label style={lbl}>Immatriculation *</label><input style={inp('immatriculation',true)} value={form.immatriculation} onChange={e=>updateField('immatriculation',e.target.value.toUpperCase())} placeholder="AB-123-CD"/>{attempted&&!form.immatriculation.trim()&&<span style={{fontSize:11,color:P.red}}>Obligatoire</span>}</div>
                <div style={grp}><label style={lbl}>N° VO</label><input style={inp('numeroVO',false)} value={form.numeroVO} onChange={e=>updateField('numeroVO',e.target.value)} placeholder="VO-2024-001"/></div>
                <div style={grp}><label style={lbl}>VIN</label><input style={{...inp('vin',false),fontFamily:'monospace',letterSpacing:1}} value={form.vin} onChange={e=>updateField('vin',e.target.value.toUpperCase())} maxLength={17} placeholder="17 car."/></div>
                <div style={grp}><label style={lbl}>Date achat (Cerfa)</label><input style={inp('dateAchat',false)} type="datetime-local" value={form.dateAchat} onChange={e=>updateField('dateAchat',e.target.value)}/></div>
                <div style={grp}><label style={lbl}>Date MEC</label><input style={inp('dateMEC',false)} type="date" value={form.dateMEC} onChange={e=>updateField('dateMEC',e.target.value)}/></div>
                <div style={{...grp,gridColumn:'1/-1'}}><label style={lbl}>Emplacement</label><input style={inp('emplacement',false)} value={form.emplacement||''} onChange={e=>updateField('emplacement',e.target.value)} placeholder="Ex : Hall A, Parking 3, Extérieur..."/></div>
                <div style={{...grp,gridColumn:'1/-1'}}>
                  <label style={lbl}>Priorité de traitement</label>
                  <div style={{display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                    {[1,2,3].map(n=>{
                      const active=(form.priorite||0)>=n;
                      return (
                        <button key={n} type="button" onClick={()=>updateField('priorite',(form.priorite||0)===n?0:n)}
                          style={{background:'none',border:'none',cursor:'pointer',padding:'2px 4px',fontSize:26,lineHeight:1,color:active?PRIORITY_COLOR:'#D1D5DB',transition:'color 0.15s,transform 0.1s'}}
                          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.2)'}}
                          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'}}>★</button>
                      );
                    })}
                    {(form.priorite||0)>0&&(
                      <span style={{fontSize:12,color:PRIORITY_COLOR,fontWeight:600,marginLeft:4}}>{PRIORITY_LABELS[form.priorite||0]}</span>
                    )}
                    {(form.priorite||0)===0&&<span style={{fontSize:12,color:P.textSoft,marginLeft:4}}>Aucune</span>}
                  </div>
                </div>

                <div style={sec_}>Véhicule</div>
                <div style={grp}><label style={lbl}>Marque *</label><select style={sel('marque',true)} value={form.marque} onChange={e=>updateField('marque',e.target.value)}><option value="">Sélectionner</option>{Object.keys(MQ).sort().map(m=><option key={m}>{m}</option>)}</select>{attempted&&!form.marque&&<span style={{fontSize:11,color:P.red}}>Obligatoire</span>}</div>
                <div style={grp}><label style={lbl}>Modèle *</label><select style={sel('modele',true)} value={form.modele} onChange={e=>updateField('modele',e.target.value)}><option value="">{form.marque?'Sélectionner':'Marque d\'abord'}</option>{modeles.map(m=><option key={m}>{m}</option>)}</select>{attempted&&!form.modele&&<span style={{fontSize:11,color:P.red}}>Obligatoire</span>}</div>
                <div style={grp}><label style={lbl}>Carburant</label><select style={sel('carburant',false)} value={form.carburant} onChange={e=>updateField('carburant',e.target.value)}><option value="">Sélectionner</option>{CARBURANTS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div style={grp}><label style={lbl}>Boîte</label><select style={sel('boite',false)} value={form.boite} onChange={e=>updateField('boite',e.target.value)}><option value="">Sélectionner</option>{BOITES.map(b=><option key={b}>{b}</option>)}</select></div>
                <div style={grp}><label style={lbl}>Catégorie</label><select style={sel('categorie',false)} value={form.categorie} onChange={e=>updateField('categorie',e.target.value)}><option value="">Sélectionner</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div style={grp}><label style={lbl}>Places</label><select style={sel('nbPlaces',false)} value={form.nbPlaces} onChange={e=>updateField('nbPlaces',e.target.value)}>{[2,3,4,5,6,7,8,9].map(n=><option key={n} value={String(n)}>{n}</option>)}</select></div>

                {isElectric&&(<>
                  <div style={sec_}>⚡ Électrique</div>
                  <div style={grp}><label style={lbl}>Batterie (kWh utiles)</label><input style={inp('capaciteBatterie',false)} type="number" value={form.capaciteBatterie} onChange={e=>updateField('capaciteBatterie',e.target.value)} placeholder="77"/></div>
                  <div style={grp}><label style={lbl}>Charge AC (kW)</label><input style={inp('puissanceAC',false)} type="number" value={form.puissanceAC} onChange={e=>updateField('puissanceAC',e.target.value)} placeholder="11"/></div>
                  <div style={{...grp,gridColumn:'1/-1'}}><div style={{display:'flex',gap:20,marginTop:4}}><label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer'}}><input type="checkbox" style={{accentColor:P.accent,width:18,height:18}} checked={form.chargeurAC} onChange={e=>updateField('chargeurAC',e.target.checked)}/> AC</label><label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer'}}><input type="checkbox" style={{accentColor:P.accent,width:18,height:18}} checked={form.chargeurDC} onChange={e=>updateField('chargeurDC',e.target.checked)}/> DC</label></div></div>
                  {form.chargeurDC&&(<><div style={grp}><label style={lbl}>Standard DC</label><select style={sel('typeDC',false)} value={form.typeDC} onChange={e=>updateField('typeDC',e.target.value)}><option value="COMBO CCS">Combo CCS</option><option value="CHAdeMO">CHAdeMO</option></select></div><div style={grp}><label style={lbl}>Charge DC (kW)</label><input style={inp('puissanceDC',false)} type="number" value={form.puissanceDC} onChange={e=>updateField('puissanceDC',e.target.value)} placeholder="135"/></div></>)}
                </>)}

                <div style={sec_}>Kilométrage</div>
                <div style={grp}><label style={lbl}>Km réel</label><input style={inp('kilometrage',false)} type="number" value={form.kilometrage} onChange={e=>updateField('kilometrage',e.target.value)} placeholder="45000"/>{form.kilometrage&&<span style={{fontSize:11,color:P.green,marginTop:2}}>Affiché : {(Number(form.kilometrage)+200).toLocaleString('fr-FR')} km</span>}</div>
                <div style={grp}><label style={lbl}>CV fiscaux</label><input style={inp('puissanceFiscale',false)} type="number" value={form.puissanceFiscale} onChange={e=>updateField('puissanceFiscale',e.target.value)} placeholder="P.6"/></div>

                <div style={sec_}>Tarification</div>
                <div style={{...grp,gridColumn:'1/-1'}}><label style={lbl}>Régime TVA</label><div style={{display:'flex',gap:8}}>{TVA_TYPES.map(t=>(<button key={t} onClick={()=>updateField('tva',t)} style={{flex:1,padding:mob?'12px':'9px 14px',borderRadius:8,border:`2px solid ${form.tva===t?P.accent:P.border}`,background:form.tva===t?P.accentSoft:P.card,color:form.tva===t?P.accent:P.textSoft,fontSize:mob?14:13,fontWeight:600,cursor:'pointer'}}>{t.replace('TVA ','')}</button>))}</div></div>
                {isDed ? (<>
                  <div style={grp}><label style={lbl}>Achat HT (€)</label><input style={inp('prixAchatHT',false)} type="number" value={form.prixAchatHT} onChange={e=>updateField('prixAchatHT',e.target.value)} placeholder="HT"/>{form.prixAchatHT&&<span style={hint}>TTC : {fmtP(form.prixAchatTTC)}</span>}</div>
                  <div style={grp}><label style={lbl}>Achat TTC (€)</label><input style={inp('prixAchatTTC',false)} type="number" value={form.prixAchatTTC} onChange={e=>updateField('prixAchatTTC',e.target.value)} placeholder="TTC"/></div>
                  <div style={grp}><label style={lbl}>Vente HT (€)</label><input style={inp('prixVenteHT',false)} type="number" value={form.prixVenteHT} onChange={e=>updateField('prixVenteHT',e.target.value)} placeholder="HT"/>{form.prixVenteHT&&<span style={hint}>TTC : {fmtP(form.prixVenteTTC)}</span>}</div>
                  <div style={grp}><label style={lbl}>Vente TTC (€)</label><input style={inp('prixVenteTTC',false)} type="number" value={form.prixVenteTTC} onChange={e=>updateField('prixVenteTTC',e.target.value)} placeholder="TTC"/></div>
                </>) : (<>
                  <div style={grp}><label style={lbl}>Prix d'achat (€)</label><input style={inp('prixAchatTTC',false)} type="number" value={form.prixAchatTTC} onChange={e=>updateField('prixAchatTTC',e.target.value)} placeholder="Achat"/></div>
                  <div style={grp}><label style={lbl}>Prix de vente (€)</label><input style={inp('prixVenteTTC',false)} type="number" value={form.prixVenteTTC} onChange={e=>updateField('prixVenteTTC',e.target.value)} placeholder="Vente"/></div>
                </>)}
                {(form.prixAchatTTC||form.prixAchatHT)&&form.prixVenteTTC&&(<div style={{gridColumn:'1/-1'}}><MarginBadge v={form}/></div>)}
              </div>
            </div>
            <div style={{display:'flex',gap:10,padding:mob?'16px':'16px 24px',borderTop:`1px solid ${P.border}`,flexShrink:0}}>
              {!mob&&<button onClick={closeForm} style={{background:P.bg,color:P.text,border:`1px solid ${P.border}`,borderRadius:8,padding:'9px 22px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Annuler</button>}
              <button onClick={handleSave} style={{background:P.accent,color:'#fff',border:'none',borderRadius:mob?10:8,padding:mob?'14px':'9px 22px',fontSize:mob?15:13,fontWeight:600,cursor:'pointer',flex:mob?1:undefined}}>
                {editId?'Enregistrer':'Ajouter au stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUPPRESSION */}
      {deleteConfirm&&(()=>{
        const v = vehicles.find(x=>x.id===deleteConfirm);
        if(!v) return null;
        return (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1001,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setDeleteConfirm(null)}>
            <div style={{background:P.card,borderRadius:16,maxWidth:360,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:24,textAlign:'center'}}>
                <div style={{fontSize:17,fontWeight:700,color:P.red,marginBottom:8}}>Supprimer ?</div>
                <div style={{fontSize:13,color:P.textSoft,marginBottom:20}}>{v.marque} {v.modele} — {v.immatriculation}</div>
                <div style={{display:'flex',gap:10}}>
                  <button style={{background:P.bg,color:P.text,border:`1px solid ${P.border}`,borderRadius:8,padding:'10px',fontSize:13,fontWeight:600,cursor:'pointer',flex:1}} onClick={()=>setDeleteConfirm(null)}>Annuler</button>
                  <button style={{background:P.orange,color:'#fff',border:'none',borderRadius:8,padding:'10px',fontSize:13,fontWeight:600,cursor:'pointer',flex:1}} onClick={()=>{ updateVehicle(deleteConfirm,{statut:'vendu'}); setDeleteConfirm(null); }}>Vendu</button>
                  <button style={{background:P.red,color:'#fff',border:'none',borderRadius:8,padding:'10px',fontSize:13,fontWeight:600,cursor:'pointer',flex:1}} onClick={()=>handleDelete(deleteConfirm)}>Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
