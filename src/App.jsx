import {useState,lazy,Suspense} from 'react'
import {motion,AnimatePresence,useMotionValue,useSpring} from 'framer-motion'
import {LayoutDashboard,ListChecks,Target,GitCompare,SlidersHorizontal,Info,Plus,Trash2,Pencil,Download,Printer,Sparkles,Flame,X,ArrowUp,ArrowDown,Minus,Trophy} from 'lucide-react'
import {ScatterChart,Scatter,XAxis,YAxis,ZAxis,Tooltip,ResponsiveContainer,ReferenceLine,Cell,RadarChart,PolarGrid,PolarAngleAxis,Radar,Legend,BarChart,Bar,CartesianGrid} from 'recharts'
import {useStore,CRIT,SCAMPER,CHECKS,QC,DEMO,DEF_W,why,nextStep} from './store'

const TABS=[['dash','Dashboard',LayoutDashboard],['ideas','Ide & Penilaian',ListChecks],['matrix','Matriks Prioritas',Target],['cmp','Bandingkan',GitCompare],['w','Bobot',SlidersHorizontal],['about','Tentang',Info]]
const Hero3D=lazy(()=>import('./Scene3D').then(m=>({default:m.Hero})))
const Matrix3D=lazy(()=>import('./Scene3D').then(m=>({default:m.Matrix3D})))
const Load=()=><div className="h-full grid place-items-center text-sm text-gray-500">Memuat 3D…</div>
function TiltCard({children,className,delay=0}){const rx=useSpring(useMotionValue(0),{stiffness:150,damping:15}),ry=useSpring(useMotionValue(0),{stiffness:150,damping:15})
 return<motion.div initial={{y:40,opacity:0,rotateX:-25}} animate={{y:0,opacity:1,rotateX:0}} transition={{delay,type:'spring'}} style={{perspective:900}}>
 <motion.div className={className} style={{rotateX:rx,rotateY:ry,transformStyle:'preserve-3d'}} whileHover={{scale:1.03}}
 onMouseMove={e=>{const b=e.currentTarget.getBoundingClientRect();ry.set(((e.clientX-b.left)/b.width-.5)*14);rx.set(-((e.clientY-b.top)/b.height-.5)*14)}} onMouseLeave={()=>{rx.set(0);ry.set(0)}}>{children}</motion.div></motion.div>}
const dl=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
const Badge=({q})=><span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{background:QC[q]}}>{q}</span>
const Delta=({id})=>{const{ranked,base}=useStore();const r=ranked.find(x=>x.id===id)?.rank;const d=base[id]-r
 return<motion.span key={d} initial={{scale:.5,opacity:0}} animate={{scale:1,opacity:1}} className={`inline-flex items-center text-xs font-bold ${d>0?'text-go':d<0?'text-chili':'text-gray-400'}`}>{d>0?<ArrowUp size={14}/>:d<0?<ArrowDown size={14}/>:<Minus size={14}/>}{d?Math.abs(d):''}</motion.span>}
const Empty=()=>{const{d}=useStore();return<div className="card text-center py-14"><Flame className="mx-auto text-chili" size={40}/><h3 className="font-display text-2xl mt-3">Belum ada ide untuk divalidasi</h3><p className="text-gray-600 mt-1">Tambahkan ide di tab Ide & Penilaian, atau coba dulu dengan contoh.</p><button className="btn bg-go text-white mt-5" onClick={()=>d({t:'load',v:DEMO()})}><Sparkles size={16}/>Muat contoh seblak</button></div>}

function Dash({go}){const{ranked,d}=useStore();if(!ranked.length)return<Empty/>
 const top=ranked.slice(0,3),avg=Math.round(ranked.reduce((a,x)=>a+x.score,0)/ranked.length)
 return<div className="space-y-6">
 <div className="relative h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-chili-dark via-chili to-go-dark no-print">
 <Suspense fallback={<Load/>}><Hero3D ideas={ranked}/></Suspense>
 <div className="absolute left-6 bottom-5 text-white pointer-events-none"><div className="font-display font-black text-3xl">{top[0].name}</div><div className="text-sm text-white/80">Ide terbaik saat ini · skor {top[0].score}/100 · seret untuk memutar</div></div></div>
 <div className="grid sm:grid-cols-3 gap-4">{[['Ide masuk',ranked.length],['Rata-rata skor',avg],['Prioritas Utama',ranked.filter(x=>x.quad==='Prioritas Utama').length]].map(([l,v])=><div key={l} className="card"><div className="text-sm text-gray-500">{l}</div><div className="font-display text-4xl text-chili">{v}</div></div>)}</div>
 <div><h2 className="font-display text-2xl mb-3 flex items-center gap-2"><Trophy className="text-go"/>Ide paling layak dikembangkan</h2>
 <div className="grid lg:grid-cols-3 gap-4">{top.map((x,n)=><TiltCard key={x.id} delay={n*.15} className={`card h-full ${n===0?'border-2 border-go bg-go-soft':''}`}>
  <div className="flex justify-between"><span className="font-display text-3xl text-chili">#{x.rank}</span><Badge q={x.quad}/></div>
  <h3 className="font-bold text-lg mt-1">{x.name}</h3><p className="text-sm text-gray-600">{x.description}</p>
  <p className="text-sm mt-3"><b>Alasan:</b> {why(x)}</p><p className="text-sm mt-2 text-go-dark"><b>Langkah berikut:</b> {nextStep(x)}</p></TiltCard>)}</div></div>
 <div className="card h-72"><h3 className="font-bold mb-2">Skor berbobot semua ide</h3><ResponsiveContainer><BarChart data={ranked} layout="vertical" margin={{left:20}}><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" domain={[0,100]}/><YAxis type="category" dataKey="name" width={150} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="score" radius={6} animationDuration={900}>{ranked.map(x=><Cell key={x.id} fill={QC[x.quad]}/>)}</Bar></BarChart></ResponsiveContainer></div>
 <div className="flex gap-2 flex-wrap no-print">
  <button className="btn bg-chili text-white" onClick={()=>dl('ranking.csv',['Rank,Ide,Target,Feasibility,Impact,Biaya,Urgensi,Skor,Confidence,Kuadran',...ranked.map(x=>[x.rank,`"${x.name}"`,x.target,x.s.f,x.s.i,x.s.c,x.s.u,x.score,x.conf,x.quad].join(','))].join('\n'),'text/csv')}><Download size={16}/>CSV</button>
  <button className="btn bg-chili text-white" onClick={()=>dl('ranking.json',JSON.stringify(ranked,null,2),'application/json')}><Download size={16}/>JSON</button>
  <button className="btn border border-chili text-chili" onClick={()=>window.print()}><Printer size={16}/>Cetak laporan</button></div></div>}

function Modal({children,close}){return<motion.div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 no-print" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={close}>
 <motion.div initial={{scale:.9,y:20}} animate={{scale:1,y:0}} exit={{scale:.9}} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e=>e.stopPropagation()}><button aria-label="Tutup" className="float-right" onClick={close}><X/></button>{children}</motion.div></motion.div>}

function Form({idea,close}){const{d}=useStore();const[v,setV]=useState(idea||{name:'',description:'',scamper:SCAMPER[0],target:'Pembeli'})
 const set=k=>e=>setV({...v,[k]:e.target.value});const inp='w-full border rounded-lg px-3 py-2 mt-1'
 return<Modal close={close}><h3 className="font-display text-2xl mb-4">{idea?'Edit ide':'Tambah ide'}</h3><div className="space-y-3">
 <label className="block text-sm font-bold">Nama singkat<input className={inp} value={v.name} onChange={set('name')}/></label>
 <label className="block text-sm font-bold">Deskripsi<textarea className={inp} rows={3} value={v.description} onChange={set('description')}/></label>
 <label className="block text-sm font-bold">Teknik SCAMPER asal<select className={inp} value={v.scamper} onChange={set('scamper')}>{SCAMPER.map(s=><option key={s}>{s}</option>)}</select></label>
 <label className="block text-sm font-bold">Target<select className={inp} value={v.target} onChange={set('target')}><option>Pembeli</option><option>Penjual</option></select></label>
 <button className="btn bg-go text-white" disabled={!v.name.trim()} onClick={()=>{d(idea?{t:'edit',id:idea.id,v:{name:v.name,description:v.description,scamper:v.scamper,target:v.target}}:{t:'add',v});close()}}>Simpan ide</button></div></Modal>}

function IdeaCard({x}){const{d}=useStore();const[edit,setEdit]=useState(false)
 return<motion.div layout transition={{type:'spring',stiffness:300,damping:30}} className="card">
 <div className="flex flex-wrap items-center gap-2 justify-between"><div className="flex items-center gap-2"><span className="font-display text-2xl text-chili">#{x.rank}</span><Delta id={x.id}/><h3 className="font-bold">{x.name}</h3></div><Badge q={x.quad}/></div>
 <p className="text-sm text-gray-600 mt-1">{x.description}</p><p className="text-xs text-gray-500 mt-1">{x.scamper} · {x.target}</p>
 <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">{CRIT.map(c=><label key={c.k} className="text-xs font-bold">{c.n}: {x.s[c.k]} <span className="font-normal text-gray-500">({c.d})</span><input type="range" min={1} max={5} value={x.s[c.k]} onChange={e=>d({t:'score',id:x.id,k:c.k,v:+e.target.value})}/></label>)}</div>
 <div className="flex flex-wrap gap-3 mt-3">{CHECKS.map(([k,l])=><label key={k} className="text-xs flex items-center gap-1"><input type="checkbox" className="accent-[#00AA13]" checked={!!x.checks[k]} onChange={e=>d({t:'check',id:x.id,k,v:e.target.checked})}/>{l}</label>)}</div>
 <div className="flex items-center justify-between mt-4"><div className="text-sm"><b className="text-lg text-go">{x.score}</b>/100 · simple {x.simple} · confidence <b>{x.conf}%</b></div>
 <div className="flex gap-1 no-print"><button aria-label="Edit" className="p-2 hover:bg-go-soft rounded-full" onClick={()=>setEdit(true)}><Pencil size={16}/></button><button aria-label="Hapus" className="p-2 hover:bg-chili-soft rounded-full text-chili" onClick={()=>confirm('Hapus ide ini?')&&d({t:'del',id:x.id})}><Trash2 size={16}/></button></div></div>
 <AnimatePresence>{edit&&<Form idea={x} close={()=>setEdit(false)}/>}</AnimatePresence></motion.div>}

function Ideas(){const{ranked,d}=useStore();const[add,setAdd]=useState(false)
 return<div className="space-y-4"><div className="flex gap-2 flex-wrap no-print"><button className="btn bg-chili text-white" onClick={()=>setAdd(true)}><Plus size={16}/>Tambah ide</button><button className="btn bg-go text-white" onClick={()=>d({t:'load',v:DEMO()})}><Sparkles size={16}/>Muat contoh seblak</button></div>
 {!ranked.length&&<Empty/>}<AnimatePresence>{ranked.map(x=><IdeaCard key={x.id} x={x}/>)}</AnimatePresence>
 <AnimatePresence>{add&&<Form close={()=>setAdd(false)}/>}</AnimatePresence></div>}

function Matrix2D(){const{ranked}=useStore();const[sel,setSel]=useState(null)
 if(!ranked.length)return<Empty/>
 const data=ranked.map((x,n)=>({...x,x:x.s.f+((n%5)-2)*.07,y:x.s.i+((Math.floor(n/5)%5)-2)*.07}))
 return<div className="card"><h2 className="font-display text-2xl mb-1">Matriks Prioritas</h2><p className="text-sm text-gray-600 mb-3">Klik titik untuk membuka detail. Garis batas di nilai 3,5.</p>
 <div className="h-[28rem]"><ResponsiveContainer><ScatterChart margin={{top:20,right:30,bottom:30,left:10}}><CartesianGrid strokeDasharray="3 3"/>
 <XAxis type="number" dataKey="x" domain={[0.5,5.5]} ticks={[1,2,3,4,5]} label={{value:'Feasibility',position:'bottom'}}/><YAxis type="number" dataKey="y" domain={[0.5,5.5]} ticks={[1,2,3,4,5]} label={{value:'Impact',angle:-90,position:'insideLeft'}}/><ZAxis range={[220,220]}/>
 <ReferenceLine x={3.5} stroke="#D62718" strokeDasharray="5 5"/><ReferenceLine y={3.5} stroke="#D62718" strokeDasharray="5 5"/>
 <ReferenceLine y={5.4} stroke="none" label={{value:'Prioritas Utama →',position:'insideTopRight',fill:'#00AA13',fontWeight:700}}/>
 <ReferenceLine y={5.4} x={0.6} stroke="none" label={{value:'Impact tinggi, sulit dibuat',position:'insideTopLeft',fill:'#F59E0B'}}/>
 <ReferenceLine y={0.7} stroke="none" label={{value:'Mudah, dampak kecil',position:'insideBottomRight',fill:'#3B82F6'}}/>
 <ReferenceLine y={0.7} x={0.6} stroke="none" label={{value:'Prioritas Rendah',position:'insideBottomLeft',fill:'#D62718'}}/>
 <Tooltip cursor={{strokeDasharray:'3 3'}} content={({payload})=>payload?.[0]?<div className="bg-white border rounded-lg p-2 text-xs shadow"><b>{payload[0].payload.name}</b><br/>F {payload[0].payload.s.f} · I {payload[0].payload.s.i}<br/>{payload[0].payload.quad}</div>:null}/>
 <Scatter data={data} animationDuration={900} onClick={p=>setSel(p.payload||p)} cursor="pointer">{data.map(x=><Cell key={x.id} fill={QC[x.quad]} stroke="#fff" strokeWidth={2}/>)}</Scatter></ScatterChart></ResponsiveContainer></div>
 <div className="flex flex-wrap gap-3 text-xs mt-2">{Object.entries(QC).map(([k,c])=><span key={k} className="flex items-center gap-1"><i className="w-3 h-3 rounded-full" style={{background:c}}/>{k}</span>)}</div>
 <AnimatePresence>{sel&&<Modal close={()=>setSel(null)}><Badge q={sel.quad}/><h3 className="font-display text-2xl mt-2">{sel.name}</h3><p className="text-sm text-gray-600">{sel.description}</p><p className="text-sm mt-3"><b>Alasan:</b> {why(sel)}</p><p className="text-sm mt-2 text-go-dark"><b>Langkah berikut:</b> {nextStep(sel)}</p></Modal>}</AnimatePresence></div>}

function Matrix(){const{ranked}=useStore();const[m,setM]=useState('3d');const[sel,setSel]=useState(null)
 if(!ranked.length)return<Empty/>
 return<div className="space-y-3"><div className="flex gap-2 no-print">{[['3d','Tampilan 3D'],['2d','Tampilan 2D']].map(([k,l])=><button key={k} onClick={()=>setM(k)} className={`btn border ${m===k?'bg-chili text-white border-chili':'border-gray-300'}`}>{l}</button>)}</div>
 {m==='2d'?<Matrix2D/>:<div className="card"><h2 className="font-display text-2xl">Matriks Prioritas 3D</h2><p className="text-sm text-gray-600 mb-3">Sumbu X Feasibility, Y Impact, Z Confidence. Seret untuk memutar, klik bola untuk detail. Kotak hijau adalah zona Prioritas Utama.</p>
 <div className="h-[30rem] rounded-2xl overflow-hidden bg-gradient-to-b from-chili-soft to-go-soft"><Suspense fallback={<Load/>}><Matrix3D ideas={ranked} onSelect={setSel}/></Suspense></div>
 <div className="flex flex-wrap gap-3 text-xs mt-2">{Object.entries(QC).map(([k,c])=><span key={k} className="flex items-center gap-1"><i className="w-3 h-3 rounded-full" style={{background:c}}/>{k}</span>)}</div>
 <AnimatePresence>{sel&&<Modal close={()=>setSel(null)}><Badge q={sel.quad}/><h3 className="font-display text-2xl mt-2">{sel.name}</h3><p className="text-sm text-gray-600">{sel.description}</p><p className="text-sm mt-3"><b>Alasan:</b> {why(sel)}</p><p className="text-sm mt-2 text-go-dark"><b>Langkah berikut:</b> {nextStep(sel)}</p></Modal>}</AnimatePresence></div>}</div>}

function Compare(){const{ranked}=useStore();const[ids,setIds]=useState([])
 const tog=id=>setIds(ids.includes(id)?ids.filter(i=>i!==id):ids.length<3?[...ids,id]:ids)
 const ch=ranked.filter(x=>ids.includes(x.id)),cols=['#D62718','#00AA13','#F59E0B']
 if(!ranked.length)return<Empty/>
 return<div className="space-y-4"><div className="card"><h2 className="font-display text-2xl mb-2">Pilih 2–3 ide</h2><div className="flex flex-wrap gap-2">{ranked.map(x=><button key={x.id} onClick={()=>tog(x.id)} className={`btn border ${ids.includes(x.id)?'bg-chili text-white border-chili':'border-gray-300'}`}>{x.name}</button>)}</div></div>
 {ch.length>=2?<motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid lg:grid-cols-2 gap-4">
 <div className="card h-80"><ResponsiveContainer><RadarChart data={CRIT.map(c=>({k:c.n,...Object.fromEntries(ch.map(x=>[x.name,x.s[c.k]]))}))}><PolarGrid/><PolarAngleAxis dataKey="k"/>{ch.map((x,n)=><Radar key={x.id} dataKey={x.name} stroke={cols[n]} fill={cols[n]} fillOpacity={.25}/>)}<Legend/></RadarChart></ResponsiveContainer></div>
 <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr><th/>{ch.map(x=><th key={x.id} className="text-left p-1">{x.name}</th>)}</tr></thead><tbody>
 {[['Peringkat',x=>'#'+x.rank],['Skor',x=>x.score],['Kuadran',x=>x.quad],['Confidence',x=>x.conf+'%'],...CRIT.map(c=>[c.n,x=>x.s[c.k]])].map(([l,f])=><tr key={l} className="border-t"><td className="p-1 font-bold">{l}</td>{ch.map(x=><td key={x.id} className="p-1">{f(x)}</td>)}</tr>)}</tbody></table></div></motion.div>:<p className="text-gray-600">Pilih minimal dua ide untuk melihat perbandingan.</p>}</div>}

function Weights(){const{w,d,ranked,base}=useStore();const t=Object.values(w).reduce((a,b)=>a+b,0)
 return<div className="grid lg:grid-cols-2 gap-4"><div className="card"><h2 className="font-display text-2xl mb-3">Bobot kriteria</h2>
 {CRIT.map(c=><label key={c.k} className="block text-sm font-bold mb-3">{c.n}: {t?Math.round(w[c.k]/t*100):0}%<input type="range" min={0} max={100} value={w[c.k]} onChange={e=>d({t:'w',k:c.k,v:+e.target.value})}/></label>)}
 <p className="text-xs text-gray-500">Bobot dinormalisasi otomatis. Default: 40 / 40 / 10 / 10.</p><button className="btn border border-chili text-chili mt-3" onClick={()=>d({t:'resetw'})}>Reset ke default</button></div>
 <div className="card"><h2 className="font-display text-2xl mb-3">Analisis sensitivitas</h2><p className="text-sm text-gray-600 mb-3">Perubahan peringkat dibanding bobot default.</p>
 {!ranked.length&&<p className="text-sm">Belum ada ide.</p>}
 {ranked.map(x=><motion.div layout key={x.id} className="flex items-center gap-3 py-1.5 border-b text-sm"><b className="w-8 text-chili">#{x.rank}</b><span className="flex-1">{x.name}</span><span className="text-xs text-gray-500">awal #{base[x.id]}</span><Delta id={x.id}/></motion.div>)}</div></div>}

function About(){return<div className="card max-w-2xl space-y-3"><h2 className="font-display text-3xl">Tentang IdeaValid</h2>
 <p>Tugas LKPD 6 “Validasi Ide” – Kreativitas Inovasi dan Kewirausahaan. Studi kasus: fitur digital GoFood/GoBiz untuk seblak.</p>
 <h3 className="font-bold">Kelompok 1 – XI PPLG 2</h3><ul className="list-disc pl-5">{['Al Dylan Muhamad Daffarafa','Muhammad Irsyad Ikhram','Revana Oktavianty','Talita Dzakiran Istiqomah'].map(n=><li key={n}>{n}</li>)}</ul>
 <h3 className="font-bold">Metode SCAMPER</h3><p className="text-sm">Substitute (ganti), Combine (gabung), Adapt (sesuaikan), Modify (ubah), Put to another use (fungsi lain), Eliminate (hilangkan), Reverse (balik).</p>
 <h3 className="font-bold">Rumus skor</h3><p className="text-sm">Skor = Σ(bobot × nilai) ÷ Σbobot ÷ 5 × 100. Prioritas Utama jika Feasibility ≥ 4 dan Impact ≥ 4. Confidence = jawaban “ya” pada checklist ÷ 3.</p></div>}

export default function App(){const[tab,setTab]=useState('dash')
 const P={dash:<Dash/>,ideas:<Ideas/>,matrix:<Matrix/>,cmp:<Compare/>,w:<Weights/>,about:<About/>}
 return<div className="min-h-screen font-sans">
 <header className="bg-chili text-white no-print"><div className="max-w-6xl mx-auto px-4 pt-6 pb-0">
 <motion.h1 initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} className="font-display font-black text-4xl flex items-center gap-2"><Flame/>IdeaValid</motion.h1>
 <p className="text-white/80 text-sm mb-4">Nilai banyak ide, pilih yang paling layak dibuat.</p>
 <nav className="flex gap-1 overflow-x-auto">{TABS.map(([k,l,I])=><button key={k} onClick={()=>setTab(k)} className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl whitespace-nowrap ${tab===k?'bg-[#FFF8F3] text-chili':'hover:bg-chili-dark'}`}><I size={16}/>{l}{tab===k&&<motion.i layoutId="u" className="absolute bottom-0 left-3 right-3 h-1 bg-go rounded"/>}</button>)}</nav></div></header>
 <main className="max-w-6xl mx-auto px-4 py-6"><h1 className="hidden print:block font-display text-2xl mb-4">Laporan IdeaValid – Kelompok 1 XI PPLG 2</h1>
 <AnimatePresence mode="wait"><motion.div key={tab} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.2}}>{P[tab]}</motion.div></AnimatePresence></main></div>}
