export const MQ={"Audi":["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q5","Q7","Q8","e-tron","e-tron GT","RS3","RS6","TT","R8"],"BMW":["Série 1","Série 2","Série 3","Série 4","Série 5","Série 7","X1","X3","X5","X7","Z4","i4","iX","M3","M4"],"Citroën":["C1","C3","C3 Aircross","C4","C5 Aircross","C5 X","Berlingo","ë-C4","Ami"],"Dacia":["Sandero","Duster","Jogger","Spring","Logan"],"DS":["DS 3","DS 4","DS 7","DS 9"],"Fiat":["500","500X","500e","Panda","Tipo"],"Ford":["Fiesta","Focus","Puma","Kuga","Mustang","Mustang Mach-E","Ranger"],"Honda":["Civic","HR-V","CR-V","ZR-V","Jazz"],"Hyundai":["i10","i20","i30","Tucson","Kona","Ioniq 5","Ioniq 6"],"Jeep":["Renegade","Compass","Avenger","Wrangler"],"Kia":["Picanto","Rio","Ceed","Sportage","Niro","EV6","EV9"],"Land Rover":["Defender","Discovery","Range Rover","Range Rover Sport","Evoque"],"Mazda":["Mazda2","Mazda3","CX-30","CX-5","CX-60","MX-5"],"Mercedes":["Classe A","Classe B","Classe C","Classe E","Classe S","CLA","GLA","GLC","GLE","EQA","EQB","EQE","EQS","AMG GT"],"Nissan":["Micra","Juke","Qashqai","X-Trail","Leaf","Ariya","NV200"],"Opel":["Corsa","Astra","Mokka","Grandland"],"Peugeot":["208","308","408","508","2008","3008","5008","e-208","e-3008"],"Porsche":["911","Cayenne","Macan","Panamera","Taycan"],"Renault":["Clio","Captur","Mégane","Austral","Arkana","Scénic","Kangoo","Zoé","Mégane E-Tech"],"Seat":["Ibiza","Arona","Leon","Ateca"],"Škoda":["Fabia","Octavia","Superb","Kamiq","Karoq","Kodiaq","Enyaq"],"Smart":["Fortwo","Forfour","#1"],"Tesla":["Model 3","Model Y","Model S","Model X"],"Toyota":["Yaris","Yaris Cross","Corolla","C-HR","RAV4","bZ4X","Supra"],"Volkswagen":["Polo","Golf","T-Roc","T-Cross","Tiguan","Passat","ID.3","ID.4","ID.5","ID. Buzz"],"Volvo":["XC40","XC60","XC90","C40","EX30","EX90"],"Cupra":["Formentor","Born","Leon"],"MG":["ZS","ZS EV","MG4","MG5"],"BYD":["Atto 3","Dolphin","Seal"],"Alpine":["A110","A290"],"Jaguar":["E-Pace","F-Pace","I-Pace"],"Mini":["Cooper","Countryman","Cooper SE"],"Alfa Romeo":["Giulia","Stelvio","Tonale"],"Lexus":["UX","NX","RX","RZ"],"Suzuki":["Swift","Vitara","S-Cross","Jimny"],"Mitsubishi":["ASX","Eclipse Cross","Outlander"]};

export const CARBURANTS = ["Essence","Diesel","Hybride","Hybride Rechargeable","Électrique","GPL","E85 (Flexfuel)","GNV"];
export const BOITES = ["Manuelle","Automatique","Robotisée"];
export const CATEGORIES = ["Citadine","Berline","Break","SUV / Crossover","Coupé","Cabriolet","Monospace","Utilitaire","Pick-up","Sportive"];
export const TVA_TYPES = ["TVA déductible","TVA sur marge"];

export const ACHAT_ADMIN = [{k:"achat",l:"Achat"},{k:"virement",l:"Virement OK"},{k:"transport",l:"Transport OK"},{k:"carteGrise",l:"Carte Grise reçue"},{k:"da",l:"DA OK"}];
export const VENTE_ADMIN = [{k:"bonCommande",l:"Bon de commande"},{k:"acompte",l:"Acompte reçu"},{k:"solde",l:"Solde reçu"},{k:"cession",l:"Cession OK"}];
export const VENTE_PHYS = [{k:"prepaFinale",l:"Prépa finale"},{k:"livraison",l:"Livraison"},{k:"clefs",l:"Remise des clés"}];

export const DEFAULT_STEPS = {
  achat:{
    admin:{achat:0,virement:0,transport:0,carteGrise:0,da:0},
    prepa:{etatDesLieux:0,mecanique:{status:0,ct:false,nettoyage:false,mecanique:false},carrosserie:{status:0,ras:true,travaux:"",note:""},photos:0,video:0,annonce:{status:0,leboncoin:false,lacentrale:false,autoscout24:false}}
  },
  vente:{
    admin:{bonCommande:0,acompte:0,solde:0,cession:0},
    physique:{prepaFinale:0,livraison:0,clefs:0}
  }
};

export const STATUTS = [
  {k:"projet",l:"Projet d'achat",bg:"#FEF3C7",color:"#B45309"},
  {k:"stock",l:"En stock",bg:"#DCFCE7",color:"#15803D"},
  {k:"vendu",l:"Vendu",bg:"#DBEAFE",color:"#1B2A4A"}
];

export const EMPTY_FORM = {
  statut:"stock",priorite:0,immatriculation:"",numeroVO:"",dateAchat:"",marque:"",modele:"",
  carburant:"",capaciteBatterie:"",chargeurAC:true,chargeurDC:false,typeDC:"COMBO CCS",
  puissanceAC:"",puissanceDC:"",kilometrage:"",dateMEC:"",boite:"",categorie:"",
  nbPlaces:"5",tva:"TVA sur marge",prixAchatHT:"",prixAchatTTC:"",prixVenteHT:"",
  prixVenteTTC:"",puissanceFiscale:"",vin:"",photo:"",emplacement:"",
  steps:JSON.parse(JSON.stringify(DEFAULT_STEPS))
};

export const EMPTY_FILTERS = {
  statuts:["stock"],marque:"",modele:"",carburant:"",boite:"",categorie:"",tva:"",
  kmMin:"",kmMax:"",prixMin:"",prixMax:"",dateMECMin:"",dateMECMax:"",
  dateAchatMin:"",dateAchatMax:"",puissanceMin:"",puissanceMax:""
};

// Design palette — alignée sur DESIGN.md
export const P = {
  bg:"#F7F7F8",card:"#FFFFFF",
  accent:"#2563EB",accentLight:"#1D4ED8",accentSoft:"#DBEAFE",
  border:"#E8E8E8",borderLight:"#E0E0E0",
  text:"#111111",textSoft:"#666666",textMuted:"#999999",
  green:"#16A34A",greenSoft:"#DCFCE7",
  red:"#DC2626",redSoft:"#FEE2E2",
  orange:"#D97706",orangeSoft:"#FEF3C7"
};

export const STEP_COLORS = [
  {bg:"#FEE2E2",color:"#DC2626",border:"#FECACA"},
  {bg:"#FEF3C7",color:"#B45309",border:"#FDE68A"},
  {bg:"#DCFCE7",color:"#15803D",border:"#BBF7D0"}
];
