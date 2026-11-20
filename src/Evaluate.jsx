import {useState,useMemo} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {Plus,Sparkles,Pencil,Trash2,ListChecks,SlidersHorizontal,Undo2,RotateCcw,Check,AlertTriangle,Info,Lightbulb,Gauge,CheckCircle2,ArrowRight,ArrowUp,ArrowDown,Minus,Scale} from 'lucide-react'
import {useStore,CRIT,CHECKS,DEMO,DEF_W,QC,analyze,previewW,wNorm} from './store'
import {PageHead,CardHead,Stat,Badge,Form,Empty,Steps} from './ui'

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
const sg=n=>n>0?`+${n}`:n<0?`${n}`:'±0'

const Move=({from,to})=>{const d=from-to
 return<span className={`inline-flex items-center gap-0.5 text-xs font-bold ${d>0?'text-go':d<0?'text-chili':'text-gray-400'}`}>{d>0?<ArrowUp size={14}/>:d<0?<ArrowDown size={14}/>:<Minus size={14}/>}{d>0?`naik ${d}`:d<0?`turun ${-d}`:'tetap'}</span>}

const NOTE={ok:[CheckCircle2,'text-go-dark'],warn:[AlertTriangle,'text-amber-600'],info:[Info,'text-blue-600']}
const Notes=({list})=><ul className="space-y-1.5 mt-3">{list.map((n,i)=>{const[I,c]=NOTE[n.t];return<li key={i} className="flex gap-2 text-sm"><I size={16} className={`shrink-0 mt-0.5 ${c}`}/><span>{n.text}</span></li>})}</ul>

const Cmp=({label,a,b,good=0,tag})=><div className="rounded-xl bg-white border p-2.5">
 <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</div>
 <div className="flex items-center gap-1.5 text-sm mt-1 flex-wrap"><span className="text-gray-500">{a}</span><ArrowRight size={12} className="text-gray-400"/><b>{b}</b>
 {tag&&<span className={`text-xs font-bold ${good>0?'text-go':good<0?'text-chili':'text-gray-400'}`}>{tag}</span>}</div></div>

const Banner=({children,onUndo})=><motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-3 rounded-xl bg-go-soft border border-go/30 p-3 text-sm flex items-center justify-between gap-2 no-print">
 <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-go-dark shrink-0"/>{children}</span>
 <button className="btn !py-1 border border-go text-go-dark bg-white" onClick={onUndo}><Undo2 size={14}/>Urungkan</button></motion.div>

/* ---------- Kartu ide: nilai dikerjakan sebagai DRAFT, baru masuk ke peringkat setelah diterapkan ---------- */
function IdeaCard({x}){const{d,ideas,w}=useStore()
 const[edit,setEdit]=useState(false)
 const saved={s:x.s,checks:x.checks}
 const[dr,setDr]=useState(saved)
 const[undo,setUndo]=useState(null)
 const dirty=!same(dr,saved)
 const an=useMemo(()=>dirty?analyze(ideas,w,x.id,dr):null,[dirty,ideas,w,x.id,dr])
 const apply=()=>{setUndo(saved);d({t:'apply',id:x.id,v:dr})}
 const revert=()=>{d({t:'apply',id:x.id,v:undo});setDr(undo);setUndo(null)}
 return<motion.div layout transition={{type:'spring',stiffness:300,damping:30}} style={{borderTopColor:QC[x.quad]}} className={`card ${dirty?'ring-4 ring-chili/25':''}`}>
 <div className="flex flex-wrap items-center gap-2 justify-between"><div className="flex items-center gap-2"><span className="font-display text-2xl text-chili">#{x.rank}</span><h3 className="font-bold">{x.name}</h3></div><Badge q={x.quad}/></div>
 <p className="text-sm text-gray-600 mt-1">{x.description}</p><p className="text-xs text-gray-500 mt-1">{x.scamper} · {x.target}</p>

 <div className="rounded-xl bg-chili-soft/60 border border-chili/20 p-3 mt-3">
 <div className="flex flex-wrap items-center justify-between gap-2 mb-2"><span className="text-xs font-bold text-gray-600">Penilaian</span>
 {!dirty&&<span className="text-xs text-gray-500 no-print">Geser nilai untuk mencoba. Peringkat baru berubah setelah kamu menerapkan.</span>}
 {dirty&&<span className="text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 no-print">Draft belum diterapkan</span>}</div>
 <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">{CRIT.map(c=>{const ch=dr.s[c.k]!==x.s[c.k]
  return<label key={c.k} className="text-xs font-bold">{c.n}: <span className={ch?'text-chili':''}>{dr.s[c.k]}</span>{ch&&<span className="font-normal text-gray-500"> (tersimpan {x.s[c.k]})</span>} <span className="font-normal text-gray-500">({c.d})</span>
  <input type="range" min={1} max={5} value={dr.s[c.k]} onChange={e=>setDr({...dr,s:{...dr.s,[c.k]:+e.target.value}})}/></label>})}</div>
 <div className="flex flex-wrap gap-3 mt-3">{CHECKS.map(([k,l])=><label key={k} className="text-xs flex items-center gap-1"><input type="checkbox" className="accent-[#00AA13]" checked={!!dr.checks[k]} onChange={e=>setDr({...dr,checks:{...dr.checks,[k]:e.target.checked?1:0}})}/>{l}</label>)}</div></div>

 <AnimatePresence initial={false}>{dirty&&an&&<motion.div key="an" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden no-print">
 <div className="mt-3 rounded-xl border-2 border-dashed border-chili/40 bg-chili-soft/50 p-4">
 <Steps current={2}/>
 <h4 className="font-bold mt-3 flex items-center gap-2"><Gauge size={16} className="text-chili"/>Analisa perubahan</h4>
 <p className="text-xs text-gray-600 mt-1">Skor dan peringkat yang tersimpan belum berubah. Periksa dampaknya dulu, lalu terapkan atau batalkan.</p>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
 <Cmp label="Skor" a={an.now.score} b={an.next.score} good={an.next.score-an.now.score} tag={sg(an.next.score-an.now.score)}/>
 <Cmp label="Peringkat" a={'#'+an.now.rank} b={'#'+an.next.rank} good={an.now.rank-an.next.rank} tag={sg(an.now.rank-an.next.rank)}/>
 <Cmp label="Confidence" a={an.now.conf+'%'} b={an.next.conf+'%'} good={an.next.conf-an.now.conf} tag={an.next.conf!==an.now.conf?sg(an.next.conf-an.now.conf)+'%':''}/>
 <Cmp label="Kuadran" a={an.now.quad} b={an.next.quad}/></div>
 <div className="flex flex-wrap gap-1.5 mt-3">{an.diffs.map(c=><span key={c.k} className="text-xs rounded-full bg-white border px-2.5 py-1"><b>{c.n}</b> {c.from} → {c.to}</span>)}
 {an.chk.map(c=><span key={c.k} className="text-xs rounded-full bg-white border px-2.5 py-1">Checklist “{c.l}” {c.on?'dicentang':'dilepas'}</span>)}</div>
 <Notes list={an.notes}/>
 {an.moved.length>0&&<p className="text-xs text-gray-600 mt-2"><b>Ide lain yang ikut bergeser:</b> {an.moved.slice(0,3).map(m=>`${m.name} (#${m.from} → #${m.to})`).join(', ')}{an.moved.length>3?`, +${an.moved.length-3} lainnya`:''}</p>}
 <div className="flex flex-wrap gap-2 mt-4"><button className="btn bg-go text-white" onClick={apply}><Check size={16}/>Terapkan perubahan</button>
 <button className="btn border border-gray-400 bg-white" onClick={()=>setDr(saved)}><RotateCcw size={16}/>Batalkan</button></div></div></motion.div>}</AnimatePresence>

 <AnimatePresence>{undo&&!dirty&&<Banner onUndo={revert}>Penilaian diterapkan. Peringkat sudah diperbarui.</Banner>}</AnimatePresence>

 <div className="flex items-center justify-between mt-4"><div className="text-sm">Tersimpan: <b className="text-lg text-go">{x.score}</b>/100 · simple {x.simple} · confidence <b>{x.conf}%</b></div>
 <div className="flex gap-1 no-print"><button aria-label="Edit" className="p-2 hover:bg-go-soft rounded-full" onClick={()=>setEdit(true)}><Pencil size={16}/></button><button aria-label="Hapus" className="p-2 hover:bg-chili-soft rounded-full text-chili" onClick={()=>confirm('Hapus ide ini?')&&d({t:'del',id:x.id})}><Trash2 size={16}/></button></div></div>
 <AnimatePresence>{edit&&<Form idea={x} close={()=>setEdit(false)}/>}</AnimatePresence></motion.div>}

export function Ideas(){const{ranked,d}=useStore();const[add,setAdd]=useState(false)
 const avg=ranked.length?Math.round(ranked.reduce((a,x)=>a+x.score,0)/ranked.length):0
 return<div className="space-y-4">
 <PageHead icon={ListChecks} title="Ide & Penilaian" flow desc="Beri nilai tiap ide. Perubahan tidak langsung mengubah peringkat: kamu akan melihat analisa dampaknya dulu, baru memutuskan menerapkan atau membatalkan."
 actions={<><button className="btn bg-white text-chili hover:bg-chili-soft" onClick={()=>setAdd(true)}><Plus size={16}/>Tambah ide</button><button className="btn bg-white text-go-dark hover:bg-go-soft" onClick={()=>d({t:'load',v:DEMO()})}><Sparkles size={16}/>Muat contoh seblak</button></>}/>
 {ranked.length>0&&<div className="grid sm:grid-cols-3 gap-4">
 <Stat icon={Lightbulb} label="Total ide" value={ranked.length}/>
 <Stat icon={Gauge} label="Rata-rata skor" value={avg} tone="go"/>
 <Stat icon={AlertTriangle} label="Perlu validasi" value={ranked.filter(x=>x.conf<67).length} hint="confidence di bawah 67%"/></div>}
 {!ranked.length&&<Empty/>}<AnimatePresence>{ranked.map(x=><IdeaCard key={x.id} x={x}/>)}</AnimatePresence>
 <AnimatePresence>{add&&<Form close={()=>setAdd(false)}/>}</AnimatePresence></div>}

/* ---------- Bobot: slider mengubah DRAFT; peringkat asli hanya berubah setelah "Terapkan" ---------- */
export function Weights(){const{w,d,ideas,ranked}=useStore()
 const[dw,setDw]=useState(w);const[undo,setUndo]=useState(null)
 const dirty=!same(dw,w),tot=Object.values(dw).reduce((a,b)=>a+b,0),nd=wNorm(dw),nw=wNorm(w)
 const pv=useMemo(()=>previewW(ideas,w,dw),[ideas,w,dw])
 const moved=pv.filter(x=>x.from!==x.rank)
 const big=[...moved].sort((a,b)=>Math.abs(b.from-b.rank)-Math.abs(a.from-a.rank))[0]
 const notes=[]
 if(dirty){
  if(tot===0)notes.push({t:'warn',text:'Semua bobot 0%. Naikkan minimal satu kriteria agar skor bisa dihitung.'})
  else{
   CRIT.filter(c=>dw[c.k]===0).forEach(c=>notes.push({t:'warn',text:`${c.n} diabaikan sepenuhnya (0%).`}))
   if(!pv.length)notes.push({t:'info',text:'Belum ada ide. Tambahkan ide di tab Ide & Penilaian untuk melihat dampak bobot ini.'})
   else{
    const a=ranked[0],b=pv[0]
    notes.push(a.id===b.id?{t:'ok',text:`Ide terbaik tetap: ${b.name}.`}:{t:'warn',text:`Ide terbaik berganti dari ${a.name} ke ${b.name}.`})
    notes.push(moved.length?{t:'info',text:`${moved.length} dari ${pv.length} ide berpindah peringkat${big?`; perubahan terbesar: ${big.name} (#${big.from} → #${big.rank})`:''}.`}:{t:'ok',text:'Urutan peringkat tidak berubah, jadi keputusan stabil terhadap bobot ini.'})
    if(moved.length>=pv.length/2)notes.push({t:'warn',text:'Urutan sangat sensitif terhadap bobot ini. Sebaiknya diskusikan alasannya bersama tim sebelum menerapkan.'})}
   notes.push({t:'info',text:'Kuadran prioritas tidak terpengaruh bobot (hanya ditentukan Feasibility & Impact).'})}}
 const apply=()=>{setUndo(w);d({t:'setw',v:dw})}
 const revert=()=>{d({t:'setw',v:undo});setDw(undo);setUndo(null)}
 return<div className="space-y-4">
 <PageHead icon={Scale} tone="go" title="Bobot Kriteria" flow desc="Tentukan seberapa penting tiap kriteria. Geser slider untuk mencoba; pratinjau dan analisa muncul dulu, peringkat asli tidak berubah sampai kamu menerapkannya."/>
 <div className="grid lg:grid-cols-2 gap-4">
 <div className="card"><CardHead icon={SlidersHorizontal} title="Atur bobot" right={<span className={`text-xs font-bold rounded-full px-2 py-0.5 ${dirty?'text-amber-700 bg-amber-100':'text-go-dark bg-go-soft'}`}>{dirty?'Draft':'Sesuai bobot terpakai'}</span>}/>
 <p className="text-xs text-gray-500 mb-3">Bobot dinormalisasi otomatis. Default: 40 / 40 / 10 / 10.</p>
 {CRIT.map(c=>{const ch=nd[c.k]!==nw[c.k];return<label key={c.k} className="block text-sm font-bold mb-3">{c.n}: <span className={ch?'text-chili':''}>{nd[c.k]}%</span>{ch&&<span className="font-normal text-xs text-gray-500"> (terpakai {nw[c.k]}%)</span>}
 <input type="range" min={0} max={100} value={dw[c.k]} onChange={e=>setDw({...dw,[c.k]:+e.target.value})}/></label>})}
 <div className="flex flex-wrap gap-2 mt-3"><button className="btn border border-gray-400 bg-white disabled:opacity-40" disabled={!dirty} onClick={()=>setDw(w)}><RotateCcw size={16}/>Batalkan perubahan</button>
 <button className="btn border border-chili text-chili bg-white disabled:opacity-40" disabled={same(dw,DEF_W)} onClick={()=>setDw(DEF_W)}>Coba bobot default</button></div></div>

 <div className="card !border-t-go"><CardHead icon={ListChecks} tone="go" title={dirty?'Pratinjau peringkat':'Peringkat saat ini'}/>
 <p className="text-sm text-gray-600 mb-3">{dirty?'Simulasi dengan bobot draft. Belum tersimpan.':'Geser slider di kiri untuk melihat simulasinya di sini.'}</p>
 {!pv.length&&<p className="text-sm">Belum ada ide.</p>}
 {pv.map(x=><motion.div layout key={x.id} className="flex items-center gap-3 py-1.5 border-b text-sm"><b className="w-8 text-chili">#{x.rank}</b><span className="flex-1">{x.name}</span>
 {dirty&&<><span className="text-xs text-gray-500 hidden sm:inline">sekarang #{x.from}</span><Move from={x.from} to={x.rank}/><span className="text-xs text-gray-600 w-16 text-right">{x.fromScore} → {x.score}</span></>}
 {!dirty&&<span className="text-xs text-gray-600">{x.score}/100</span>}</motion.div>)}</div></div>

 <AnimatePresence initial={false}>{dirty&&<motion.div key="wa" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden no-print">
 <div className="card border-2 border-dashed border-chili/40 bg-chili-soft/50"><Steps current={2}/>
 <h3 className="font-display text-xl mt-3 flex items-center gap-2"><SlidersHorizontal size={18} className="text-chili"/>Analisa perubahan bobot</h3>
 <div className="flex flex-wrap gap-1.5 mt-2">{CRIT.filter(c=>nd[c.k]!==nw[c.k]).map(c=><span key={c.k} className="text-xs rounded-full bg-white border px-2.5 py-1"><b>{c.n}</b> {nw[c.k]}% → {nd[c.k]}%</span>)}</div>
 <Notes list={notes}/>
 <div className="flex flex-wrap gap-2 mt-4"><button className="btn bg-go text-white disabled:opacity-40" disabled={tot===0} onClick={apply}><Check size={16}/>Terapkan bobot ke peringkat</button>
 <button className="btn border border-gray-400 bg-white" onClick={()=>setDw(w)}><RotateCcw size={16}/>Batalkan</button></div></div></motion.div>}</AnimatePresence>

 <AnimatePresence>{undo&&!dirty&&<Banner onUndo={revert}>Bobot diterapkan. Peringkat sudah dihitung ulang.</Banner>}</AnimatePresence></div>}
