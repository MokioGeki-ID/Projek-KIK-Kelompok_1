import {useState} from 'react'
import {motion} from 'framer-motion'
import {X,Flame,Sparkles,Check} from 'lucide-react'
import {useStore,SCAMPER,QC,DEMO} from './store'

export const Badge=({q})=><span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{background:QC[q]}}>{q}</span>

export function Modal({children,close}){return<motion.div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 no-print" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={close}>
 <motion.div initial={{scale:.9,y:20}} animate={{scale:1,y:0}} exit={{scale:.9}} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e=>e.stopPropagation()}><button aria-label="Tutup" className="float-right" onClick={close}><X/></button>{children}</motion.div></motion.div>}

export function Form({idea,close}){const{d}=useStore();const[v,setV]=useState(idea||{name:'',description:'',scamper:SCAMPER[0],target:'Pembeli'})
 const set=k=>e=>setV({...v,[k]:e.target.value});const inp='w-full border rounded-lg px-3 py-2 mt-1'
 return<Modal close={close}><h3 className="font-display text-2xl mb-4">{idea?'Edit ide':'Tambah ide'}</h3><div className="space-y-3">
 <label className="block text-sm font-bold">Nama singkat<input className={inp} value={v.name} onChange={set('name')}/></label>
 <label className="block text-sm font-bold">Deskripsi<textarea className={inp} rows={3} value={v.description} onChange={set('description')}/></label>
 <label className="block text-sm font-bold">Teknik SCAMPER asal<select className={inp} value={v.scamper} onChange={set('scamper')}>{SCAMPER.map(s=><option key={s}>{s}</option>)}</select></label>
 <label className="block text-sm font-bold">Target<select className={inp} value={v.target} onChange={set('target')}><option>Pembeli</option><option>Penjual</option></select></label>
 <button className="btn bg-go text-white" disabled={!v.name.trim()} onClick={()=>{d(idea?{t:'edit',id:idea.id,v:{name:v.name,description:v.description,scamper:v.scamper,target:v.target}}:{t:'add',v});close()}}>Simpan ide</button></div></Modal>}

export const Empty=()=>{const{d}=useStore();return<div className="card text-center py-14"><Flame className="mx-auto text-chili" size={40}/><h3 className="font-display text-2xl mt-3">Belum ada ide untuk divalidasi</h3><p className="text-gray-600 mt-1">Tambahkan ide di tab Ide & Penilaian, atau coba dulu dengan contoh.</p><button className="btn bg-go text-white mt-5" onClick={()=>d({t:'load',v:DEMO()})}><Sparkles size={16}/>Muat contoh seblak</button></div>}

/* Alur perubahan: Ubah nilai -> Tinjau analisa -> Terapkan */
export const FLOW=['Ubah nilai','Tinjau analisa','Terapkan']
export const Steps=({current=0})=><ol className="flex flex-wrap gap-2">{FLOW.map((s,n)=>{const i=n+1,on=i===current,done=i<current
 return<li key={s} aria-current={on?'step':undefined} className={`flex items-center gap-1.5 text-xs font-bold rounded-full border px-2.5 py-1 ${on?'bg-chili text-white border-chili':done?'bg-go-soft text-go-dark border-go/30':'bg-white text-gray-600 border-gray-300'}`}>
 <span className={`grid place-items-center w-5 h-5 rounded-full text-[11px] ${on?'bg-white text-chili':done?'bg-go text-white':'bg-gray-200 text-gray-600'}`}>{done?<Check size={12}/>:i}</span>{s}</li>})}</ol>

const TONE={
 chili:{bg:'bg-gradient-to-r from-chili-dark via-chili to-chili'},
 go:{bg:'bg-gradient-to-r from-go-dark via-go-dark to-go'}}

/* Banner kepala di setiap halaman: warna solid, ikon, judul, penjelasan, (opsional) alur & tombol aksi */
export const PageHead=({icon:I,title,desc,flow=false,actions,tone='chili'})=>{const t=TONE[tone]
 return<motion.section initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className={`card no-print border-0 text-white ${t.bg} flex flex-col sm:flex-row sm:items-center gap-4`}>
 <div className="shrink-0 grid place-items-center w-14 h-14 rounded-2xl bg-white/20 ring-2 ring-white/40"><I size={28}/></div>
 <div className="flex-1 min-w-0"><h2 className="font-display font-black text-3xl leading-tight">{title}</h2><p className="text-sm text-white/90 mt-1">{desc}</p>{flow&&<div className="mt-3"><Steps/></div>}</div>
 {actions&&<div className="flex gap-2 flex-wrap">{actions}</div>}</motion.section>}

/* Judul di dalam card: chip ikon + judul + garis pemisah, supaya isi card terasa terstruktur */
export const CardHead=({icon:I,title,right,tone='chili'})=><div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-dashed border-chili/20">
 <div className="flex items-center gap-3 min-w-0"><span className={`shrink-0 grid place-items-center w-9 h-9 rounded-xl text-white ${tone==='go'?'bg-go':'bg-chili'}`}><I size={18}/></span><h3 className="font-display text-2xl leading-tight">{title}</h3></div>{right}</div>

export const Stat=({icon:I,label,value,hint,tone='chili'})=><div className={`card flex items-center gap-4 ${tone==='go'?'border-t-go':''}`}>
 <div className={`shrink-0 grid place-items-center w-11 h-11 rounded-xl ${tone==='go'?'bg-go-soft text-go-dark':'bg-chili-soft text-chili'}`}><I size={22}/></div>
 <div className="min-w-0"><div className="text-sm text-gray-500">{label}</div><div className="font-display text-3xl text-chili leading-none">{value}</div>{hint&&<div className="text-xs text-gray-500 mt-1">{hint}</div>}</div></div>

export const InfoCard=({icon:I,title,children})=><div className="card"><CardHead icon={I} title={title}/>{children}</div>
