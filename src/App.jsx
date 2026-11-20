import {useState,lazy,Suspense} from 'react'
import {motion,AnimatePresence,useMotionValue,useSpring} from 'framer-motion'
import {LayoutDashboard,ListChecks,Target,GitCompare,Scale,Info,Download,Printer,Flame,Trophy,Lightbulb,Gauge,Users,Calculator,BookOpen,BarChart3} from 'lucide-react'
import {ScatterChart,Scatter,XAxis,YAxis,ZAxis,Tooltip,ResponsiveContainer,ReferenceLine,Cell,RadarChart,PolarGrid,PolarAngleAxis,Radar,Legend,BarChart,Bar,CartesianGrid} from 'recharts'
import {useStore,CRIT,QC,why,nextStep} from './store'
import {PageHead,CardHead,Stat,Badge,Modal,Empty,InfoCard} from './ui'
import {Ideas,Weights} from './Evaluate'

const TABS=[['dash','Dashboard',LayoutDashboard],['ideas','Ide & Penilaian',ListChecks],['matrix','Matriks Prioritas',Target],['cmp','Bandingkan',GitCompare],['w','Bobot',Scale],['about','Tentang',Info]]
const Hero3D=lazy(()=>import('./Scene3D').then(m=>({default:m.Hero})))
const Matrix3D=lazy(()=>import('./Scene3D').then(m=>({default:m.Matrix3D})))
const Load=()=><div className="h-full grid place-items-center text-sm text-gray-500">Memuat 3D…</div>
function TiltCard({children,className,delay=0}){const rx=useSpring(useMotionValue(0),{stiffness:150,damping:15}),ry=useSpring(useMotionValue(0),{stiffness:150,damping:15})
 return<motion.div initial={{y:40,opacity:0,rotateX:-25}} animate={{y:0,opacity:1,rotateX:0}} transition={{delay,type:'spring'}} style={{perspective:900}}>
 <motion.div className={className} style={{rotateX:rx,rotateY:ry,transformStyle:'preserve-3d'}} whileHover={{scale:1.03}}
 onMouseMove={e=>{const b=e.currentTarget.getBoundingClientRect();ry.set(((e.clientX-b.left)/b.width-.5)*14);rx.set(-((e.clientY-b.top)/b.height-.5)*14)}} onMouseLeave={()=>{rx.set(0);ry.set(0)}}>{children}</motion.div></motion.div>}
const dl=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function Dash(){const{ranked}=useStore()
 const head=<PageHead icon={LayoutDashboard} title="Dashboard" desc="Ringkasan hasil validasi: ide terbaik, rata-rata skor, dan laporan yang siap diunduh."/>
 if(!ranked.length)return<div className="space-y-6">{head}<Empty/></div>
 const top=ranked.slice(0,3),avg=Math.round(ranked.reduce((a,x)=>a+x.score,0)/ranked.length)
 return<div className="space-y-6">{head}
 <div className="relative h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-chili-dark via-chili to-go-dark no-print">
 <Suspense fallback={<Load/>}><Hero3D ideas={ranked}/></Suspense>
 <div className="absolute left-6 bottom-5 text-white pointer-events-none"><div className="font-display font-black text-3xl">{top[0].name}</div><div className="text-sm text-white/80">Ide terbaik saat ini · skor {top[0].score}/100 · seret untuk memutar</div></div></div>
 <div className="grid sm:grid-cols-3 gap-4"><Stat icon={Lightbulb} label="Ide masuk" value={ranked.length}/><Stat icon={Gauge} label="Rata-rata skor" value={avg} tone="go"/><Stat icon={Trophy} label="Prioritas Utama" value={ranked.filter(x=>x.quad==='Prioritas Utama').length} hint="Feasibility dan Impact sama-sama 4 ke atas"/></div>
 <div className="space-y-4"><div className="card !py-3 !border-t-go"><CardHead icon={Trophy} tone="go" title="Ide paling layak dikembangkan" right={<span className="text-xs text-gray-500 hidden sm:inline">3 ide dengan skor tertinggi</span>}/><p className="text-sm text-gray-600 -mt-1">Urutan berdasarkan skor berbobot. Arahkan kursor ke kartu untuk efek 3D.</p></div>
 <div className="grid lg:grid-cols-3 gap-4">{top.map((x,n)=><TiltCard key={x.id} delay={n*.15} className={`card h-full ${n===0?'border-go bg-go-soft shadow-go/30':''}`}>
  <div className="flex justify-between"><span className="font-display text-3xl text-chili">#{x.rank}</span><Badge q={x.quad}/></div>
  <h3 className="font-bold text-lg mt-1">{x.name}</h3><p className="text-sm text-gray-600">{x.description}</p>
  <p className="text-sm mt-3"><b>Alasan:</b> {why(x)}</p><p className="text-sm mt-2 text-go-dark"><b>Langkah berikut:</b> {nextStep(x)}</p></TiltCard>)}</div></div>
 <div className="card h-[26rem] flex flex-col"><CardHead icon={BarChart3} title="Skor berbobot semua ide"/><div className="flex-1 min-h-0"><ResponsiveContainer><BarChart data={ranked} layout="vertical" margin={{left:20}}><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" domain={[0,100]}/><YAxis type="category" dataKey="name" width={150} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="score" radius={6} animationDuration={900}>{ranked.map(x=><Cell key={x.id} fill={QC[x.quad]}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
 <div className="card no-print flex flex-wrap items-center gap-3"><div className="flex-1 min-w-[12rem]"><h3 className="font-bold flex items-center gap-2"><Download size={16} className="text-chili"/>Ekspor & cetak laporan</h3><p className="text-xs text-gray-600">Unduh peringkat sebagai CSV atau JSON, atau cetak ringkasannya.</p></div><div className="flex gap-2 flex-wrap">
  <button className="btn bg-chili text-white" onClick={()=>dl('ranking.csv',['Rank,Ide,Target,Feasibility,Impact,Biaya,Urgensi,Skor,Confidence,Kuadran',...ranked.map(x=>[x.rank,`"${x.name}"`,x.target,x.s.f,x.s.i,x.s.c,x.s.u,x.score,x.conf,x.quad].join(','))].join('\n'),'text/csv')}><Download size={16}/>CSV</button>
  <button className="btn bg-chili text-white" onClick={()=>dl('ranking.json',JSON.stringify(ranked,null,2),'application/json')}><Download size={16}/>JSON</button>
  <button className="btn border border-chili text-chili" onClick={()=>window.print()}><Printer size={16}/>Cetak laporan</button></div></div></div>}

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
 const head=<PageHead icon={Target} tone="go" title="Matriks Prioritas" desc="Peta ide berdasarkan Feasibility, Impact, dan Confidence. Ide di zona hijau paling siap dikerjakan." actions={[['3d','Tampilan 3D'],['2d','Tampilan 2D']].map(([k,l])=><button key={k} onClick={()=>setM(k)} className={`btn border ${m===k?'bg-white text-go-dark border-white':'border-white/70 text-white hover:bg-white/15'}`}>{l}</button>)}/>
 if(!ranked.length)return<div className="space-y-4">{head}<Empty/></div>
 return<div className="space-y-4">{head}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 no-print">{Object.entries(QC).map(([k,c])=><div key={k} className="card py-3 flex items-center gap-3" style={{borderTopColor:c}}><span className="font-display text-3xl" style={{color:c}}>{ranked.filter(x=>x.quad===k).length}</span><span className="text-xs font-bold leading-tight">{k}</span></div>)}</div>
 {m==='2d'?<Matrix2D/>:<div className="card"><h2 className="font-display text-2xl">Matriks Prioritas 3D</h2><p className="text-sm text-gray-600 mb-3">Sumbu X Feasibility, Y Impact, Z Confidence. Seret untuk memutar, klik bola untuk detail. Kotak hijau adalah zona Prioritas Utama.</p>
 <div className="h-[30rem] rounded-2xl overflow-hidden bg-gradient-to-b from-chili-soft to-go-soft"><Suspense fallback={<Load/>}><Matrix3D ideas={ranked} onSelect={setSel}/></Suspense></div>
 <div className="flex flex-wrap gap-3 text-xs mt-2">{Object.entries(QC).map(([k,c])=><span key={k} className="flex items-center gap-1"><i className="w-3 h-3 rounded-full" style={{background:c}}/>{k}</span>)}</div>
 <AnimatePresence>{sel&&<Modal close={()=>setSel(null)}><Badge q={sel.quad}/><h3 className="font-display text-2xl mt-2">{sel.name}</h3><p className="text-sm text-gray-600">{sel.description}</p><p className="text-sm mt-3"><b>Alasan:</b> {why(sel)}</p><p className="text-sm mt-2 text-go-dark"><b>Langkah berikut:</b> {nextStep(sel)}</p></Modal>}</AnimatePresence></div>}</div>}

function Compare(){const{ranked}=useStore();const[ids,setIds]=useState([])
 const tog=id=>setIds(ids.includes(id)?ids.filter(i=>i!==id):ids.length<3?[...ids,id]:ids)
 const ch=ranked.filter(x=>ids.includes(x.id)),cols=['#D62718','#00AA13','#F59E0B']
 const head=<PageHead icon={GitCompare} title="Bandingkan Ide" desc="Letakkan 2–3 ide berdampingan untuk melihat kekuatan dan kelemahan masing-masing."/>
 if(!ranked.length)return<div className="space-y-4">{head}<Empty/></div>
 return<div className="space-y-4">{head}<div className="card"><h2 className="font-display text-2xl mb-2">Pilih 2–3 ide <span className="text-sm font-sans font-normal text-gray-500">({ids.length}/3 dipilih)</span></h2><div className="flex flex-wrap gap-2">{ranked.map(x=><button key={x.id} onClick={()=>tog(x.id)} className={`btn border ${ids.includes(x.id)?'bg-chili text-white border-chili':'border-gray-300'}`}>{x.name}</button>)}</div></div>
 {ch.length>=2?<motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid lg:grid-cols-2 gap-4">
 <div className="card h-80"><ResponsiveContainer><RadarChart data={CRIT.map(c=>({k:c.n,...Object.fromEntries(ch.map(x=>[x.name,x.s[c.k]]))}))}><PolarGrid/><PolarAngleAxis dataKey="k"/>{ch.map((x,n)=><Radar key={x.id} dataKey={x.name} stroke={cols[n]} fill={cols[n]} fillOpacity={.25}/>)}<Legend/></RadarChart></ResponsiveContainer></div>
 <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr><th/>{ch.map(x=><th key={x.id} className="text-left p-1">{x.name}</th>)}</tr></thead><tbody>
 {[['Peringkat',x=>'#'+x.rank],['Skor',x=>x.score],['Kuadran',x=>x.quad],['Confidence',x=>x.conf+'%'],...CRIT.map(c=>[c.n,x=>x.s[c.k]])].map(([l,f])=><tr key={l} className="border-t"><td className="p-1 font-bold">{l}</td>{ch.map(x=><td key={x.id} className="p-1">{f(x)}</td>)}</tr>)}</tbody></table></div></motion.div>:<div className="card flex items-center gap-3 text-gray-600"><Info className="text-chili shrink-0"/>Pilih minimal dua ide untuk melihat perbandingan.</div>}</div>}

function About(){return<div className="space-y-4">
 <PageHead icon={Info} title="Tentang IdeaValid" desc="Tugas LKPD 6 “Validasi Ide” – Kreativitas Inovasi dan Kewirausahaan. Studi kasus: fitur digital GoFood/GoBiz untuk seblak."/>
 <div className="grid md:grid-cols-2 gap-4">
 <InfoCard icon={Users} title="Kelompok 1 – XI PPLG 2"><ul className="list-disc pl-5 text-sm">{['Al Dylan Muhamad Daffarafa','Muhammad Irsyad Ikhram','Revana Oktavianty','Talita Dzakiran Istiqomah'].map(n=><li key={n}>{n}</li>)}</ul></InfoCard>
 <InfoCard icon={Lightbulb} title="Metode SCAMPER"><p className="text-sm">Substitute (ganti), Combine (gabung), Adapt (sesuaikan), Modify (ubah), Put to another use (fungsi lain), Eliminate (hilangkan), Reverse (balik).</p></InfoCard>
 <InfoCard icon={Calculator} title="Rumus skor"><p className="text-sm">Skor = Σ(bobot × nilai) ÷ Σbobot ÷ 5 × 100. Prioritas Utama jika Feasibility ≥ 4 dan Impact ≥ 4. Confidence = jawaban “ya” pada checklist ÷ 3.</p></InfoCard>
 <InfoCard icon={BookOpen} title="Alur penilaian"><p className="text-sm">Ubah nilai atau bobot, tinjau analisa dampaknya, lalu terapkan. Peringkat tidak berubah sebelum kamu menerapkan, dan hasilnya bisa diurungkan.</p></InfoCard></div></div>}

export default function App(){const[tab,setTab]=useState('dash')
 const P={dash:<Dash/>,ideas:<Ideas/>,matrix:<Matrix/>,cmp:<Compare/>,w:<Weights/>,about:<About/>}
 return<div className="min-h-screen font-sans">
 <header className="bg-chili text-white no-print"><div className="max-w-6xl mx-auto px-4 pt-6 pb-0">
 <motion.h1 initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} className="font-display font-black text-4xl flex items-center gap-2"><Flame/>IdeaValid</motion.h1>
 <p className="text-white/80 text-sm mb-4">Nilai banyak ide, pilih yang paling layak dibuat.</p>
 <nav className="flex gap-1 overflow-x-auto">{TABS.map(([k,l,I])=><button key={k} onClick={()=>setTab(k)} className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl whitespace-nowrap ${tab===k?'bg-paper text-chili':'hover:bg-chili-dark'}`}><I size={16}/>{l}{tab===k&&<motion.i layoutId="u" className="absolute bottom-0 left-3 right-3 h-1 bg-go rounded"/>}</button>)}</nav></div></header>
 <main className="max-w-6xl mx-auto px-4 py-6"><h1 className="hidden print:block font-display text-2xl mb-4">Laporan IdeaValid – Kelompok 1 XI PPLG 2</h1>
 <AnimatePresence mode="wait"><motion.div key={tab} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.2}}>{P[tab]}</motion.div></AnimatePresence></main></div>}
