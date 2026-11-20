import {createContext,useContext,useReducer,useMemo,useEffect} from 'react'
export const DEF_W={f:40,i:40,c:10,u:10}
export const CRIT=[{k:'f',n:'Feasibility',d:'Kemudahan teknis'},{k:'i',n:'Impact',d:'Dampak ke pengguna'},{k:'c',n:'Biaya/Effort',d:'5 = sangat murah'},{k:'u',n:'Urgensi pasar',d:'Seberapa dibutuhkan'}]
export const SCAMPER=['Substitute','Combine','Adapt','Modify','Put to another use','Eliminate','Reverse']
export const CHECKS=[['real','Masalahnya nyata?'],['user','Ada pengguna yang mau?'],['proto','Prototipe bisa dibuat dalam 1 minggu?']]
export const QC={'Prioritas Utama':'#00AA13','Prioritas Tinggi':'#F59E0B','Prioritas Sedang':'#3B82F6','Prioritas Rendah':'#D62718'}
export const quad=(f,i)=>f>=4&&i>=4?'Prioritas Utama':(f>=4||i>=4)?'Prioritas Tinggi':(f>=3||i>=3)?'Prioritas Sedang':'Prioritas Rendah'
const mk=(name,description,scamper,target,f,i,c,u,ch)=>({id:crypto.randomUUID(),name,description,scamper,target,s:{f,i,c,u},checks:{real:ch[0],user:ch[1],proto:ch[2]}})
export const DEMO=()=>[
mk('Pre-order seblak jadwal','Pembeli memesan untuk jam tertentu agar tidak antre.','Adapt','Pembeli',5,5,5,4,[1,1,1]),
mk('Pilihan level pedas di aplikasi','Slider level pedas 0-5 saat memesan.','Modify','Pembeli',5,4,5,4,[1,1,1]),
mk('Paket hemat seblak + minuman','Bundling otomatis dengan harga khusus.','Combine','Pembeli',5,4,4,3,[1,1,1]),
mk('Kustomisasi topping real-time','Pembeli menyusun topping, harga terhitung langsung.','Modify','Pembeli',4,5,3,4,[1,1,0]),
mk('Dashboard stok bahan untuk penjual','Notifikasi stok kerupuk, ceker, dan bakso menipis.','Put to another use','Penjual',3,4,3,4,[1,1,0]),
mk('Langganan seblak mingguan','Paket langganan dengan diskon rutin.','Adapt','Pembeli',4,3,4,3,[1,0,1]),
mk('Kemasan ramah lingkungan terukur','Opsi kemasan kompos dengan label di menu.','Substitute','Penjual',3,3,2,2,[1,0,0]),
mk('Seblak siap masak (frozen kit)','Kit bumbu dan isian dikirim dingin.','Reverse','Pembeli',2,4,2,3,[1,1,0]),
mk('Robot pengantar di komplek','Pengiriman otomatis dalam perumahan.','Eliminate','Pembeli',1,3,1,1,[0,0,0]),
mk('Prediksi permintaan berbasis AI','Model memprediksi jam ramai pesanan.','Adapt','Penjual',2,3,2,2,[1,0,0])]
export const calc=(ideas,w)=>{const t=Object.values(w).reduce((a,b)=>a+b,0)||1
 const e=ideas.map(x=>{const{f,i,c,u}=x.s;const total=(w.f*f+w.i*i+w.c*c+w.u*u)/t;const conf=Math.round(Object.values(x.checks).filter(Boolean).length/3*100)
  return{...x,simple:f+i,score:Math.round(total/5*100),conf,quad:quad(f,i)}})
 return e.sort((a,b)=>b.score-a.score||b.simple-a.simple||b.conf-a.conf).map((x,n)=>({...x,rank:n+1}))}
export const why=x=>`Feasibility ${x.s.f} dan Impact ${x.s.i}, masuk kuadran ${x.quad}. Skor berbobot ${x.score}/100 dengan confidence ${x.conf}%.`
export const nextStep=x=>x.conf<67?'Validasi dulu: wawancarai 5 calon pengguna sebelum membuat apa pun.':x.quad==='Prioritas Utama'?'Buat prototype dalam 1 minggu, lalu uji ke 5 pengguna.':'Uji minat lewat survei singkat, lalu putuskan lanjut atau tunda.'
export const wNorm=w=>{const t=Object.values(w).reduce((a,b)=>a+b,0)||1;return Object.fromEntries(Object.entries(w).map(([k,v])=>[k,Math.round(v/t*100)]))}
export const previewW=(ideas,w,dw)=>{const a=calc(ideas,w);return calc(ideas,dw).map(x=>{const o=a.find(y=>y.id===x.id);return{...x,from:o.rank,fromScore:o.score}})}
// Analisa perubahan penilaian satu ide TANPA mengubah state: bandingkan kondisi tersimpan vs draft.
export const analyze=(ideas,w,id,draft)=>{
 const before=calc(ideas,w),after=calc(ideas.map(x=>x.id===id?{...x,...draft}:x),w)
 const now=before.find(x=>x.id===id),next=after.find(x=>x.id===id)
 const moved=after.filter(x=>x.id!==id).map(x=>({name:x.name,from:before.find(y=>y.id===x.id).rank,to:x.rank})).filter(x=>x.from!==x.to)
 const diffs=CRIT.filter(c=>now.s[c.k]!==draft.s[c.k]).map(c=>({...c,from:now.s[c.k],to:draft.s[c.k]}))
 const chk=CHECKS.filter(([k])=>!!now.checks[k]!==!!draft.checks[k]).map(([k,l])=>({k,l,on:!!draft.checks[k]}))
 const notes=[]
 notes.push(next.rank<now.rank?{t:'ok',text:`Peringkat naik dari #${now.rank} ke #${next.rank}.`}:next.rank>now.rank?{t:'warn',text:`Peringkat turun dari #${now.rank} ke #${next.rank}.`}:{t:'info',text:`Peringkat tetap #${now.rank}.`})
 if(next.quad!==now.quad)notes.push({t:'info',text:`Kuadran berubah dari ${now.quad} ke ${next.quad}.`})
 const big=diffs.filter(c=>Math.abs(c.to-c.from)>=2)
 if(big.length)notes.push({t:'warn',text:`Ada lompatan 2 poin atau lebih pada ${big.map(c=>c.n).join(', ')}. Pastikan ada dasarnya (wawancara, data), bukan sekadar perkiraan.`})
 if(nextStep(now)!==nextStep(next))notes.push({t:'info',text:`Rekomendasi langkah berikut ikut berubah: ${nextStep(next)}`})
 if(moved.length)notes.push({t:'info',text:`${moved.length} ide lain ikut bergeser peringkat.`})
 return{now,next,moved,diffs,chk,notes}}
// Pengunjung baru (belum ada data tersimpan) langsung melihat contoh seblak; setelah itu data mereka sendiri yang dipakai.
const init=()=>{try{return JSON.parse(localStorage.getItem('ideavalid'))||{ideas:DEMO(),w:DEF_W}}catch{return{ideas:DEMO(),w:DEF_W}}}
const red=(st,a)=>{switch(a.t){
 case'add':return{...st,ideas:[...st.ideas,{id:crypto.randomUUID(),s:{f:3,i:3,c:3,u:3},checks:{real:0,user:0,proto:0},...a.v}]}
 case'edit':return{...st,ideas:st.ideas.map(x=>x.id===a.id?{...x,...a.v}:x)}
 case'score':return{...st,ideas:st.ideas.map(x=>x.id===a.id?{...x,s:{...x.s,[a.k]:a.v}}:x)}
 case'check':return{...st,ideas:st.ideas.map(x=>x.id===a.id?{...x,checks:{...x.checks,[a.k]:a.v?1:0}}:x)}
 case'del':return{...st,ideas:st.ideas.filter(x=>x.id!==a.id)}
 case'load':return{...st,ideas:a.v}
 case'w':return{...st,w:{...st.w,[a.k]:a.v}}
 case'apply':return{...st,ideas:st.ideas.map(x=>x.id===a.id?{...x,s:a.v.s,checks:a.v.checks}:x)}
 case'setw':return{...st,w:a.v}
 case'resetw':return{...st,w:DEF_W}
 case'import':return a.v
 default:return st}}
const Ctx=createContext()
export const StoreProvider=({children})=>{const[st,d]=useReducer(red,null,init)
 useEffect(()=>{try{localStorage.setItem('ideavalid',JSON.stringify(st))}catch{}},[st])
 const ranked=useMemo(()=>calc(st.ideas,st.w),[st])
 const base=useMemo(()=>{const m={};calc(st.ideas,DEF_W).forEach(x=>m[x.id]=x.rank);return m},[st.ideas])
 return<Ctx.Provider value={{...st,d,ranked,base}}>{children}</Ctx.Provider>}
export const useStore=()=>useContext(Ctx)
