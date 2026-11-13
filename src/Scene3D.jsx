import {useRef,useState} from 'react'
import {Canvas,useFrame} from '@react-three/fiber'
import {OrbitControls,Float,Html} from '@react-three/drei'
import {QC} from './store'

function Core(){const m=useRef();useFrame((_,dt)=>{m.current.rotation.x+=dt*.4;m.current.rotation.y+=dt*.6})
 return<mesh ref={m}><torusKnotGeometry args={[.8,.28,160,24]}/><meshStandardMaterial color="#ff4a36" metalness={.7} roughness={.2} emissive="#9E1409" emissiveIntensity={.5}/></mesh>}

function Orbit({ideas}){const g=useRef();useFrame((_,dt)=>{g.current.rotation.y+=dt*.25})
 return<group ref={g}>{ideas.map((x,n)=>{const a=n/ideas.length*Math.PI*2,r=2.6+(n%3)*.4
  return<Float key={x.id} speed={2} floatIntensity={1.2}><mesh position={[Math.cos(a)*r,Math.sin(n*1.7)*.9,Math.sin(a)*r]} scale={.25+x.score/100*.35}>
  <icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={QC[x.quad]} metalness={.4} roughness={.25} emissive={QC[x.quad]} emissiveIntensity={.3}/></mesh></Float>})}</group>}

export const Hero=({ideas})=><Canvas camera={{position:[0,1.5,7.5],fov:45}} dpr={[1,2]}>
 <ambientLight intensity={.7}/><pointLight position={[5,5,5]} intensity={90}/><pointLight position={[-5,-2,3]} intensity={60} color="#00AA13"/>
 <Core/><Orbit ideas={ideas}/><OrbitControls enableZoom={false} enablePan={false}/></Canvas>

function Pt({x,pos,onSelect}){const m=useRef();const[h,setH]=useState(false);const base=.18+x.score/100*.22
 useFrame((_,dt)=>{const t=h?base*1.5:base;m.current.scale.x+=(t-m.current.scale.x)*Math.min(1,dt*10);m.current.scale.y=m.current.scale.z=m.current.scale.x})
 return<mesh ref={m} position={pos} scale={.001} onClick={e=>{e.stopPropagation();onSelect(x)}} onPointerOver={e=>{e.stopPropagation();setH(true);document.body.style.cursor='pointer'}} onPointerOut={()=>{setH(false);document.body.style.cursor='auto'}}>
 <sphereGeometry args={[1,32,32]}/><meshStandardMaterial color={QC[x.quad]} metalness={.3} roughness={.25} emissive={QC[x.quad]} emissiveIntensity={h?.6:.2}/>
 {h&&<Html distanceFactor={9} center style={{pointerEvents:'none'}}><div style={{background:'#fff',padding:'4px 8px',borderRadius:8,fontSize:12,whiteSpace:'nowrap',boxShadow:'0 2px 8px #0003',transform:'translateY(-28px)'}}><b>{x.name}</b><br/>F {x.s.f} · I {x.s.i} · skor {x.score}</div></Html>}</mesh>}

const Lbl=({p,t})=><Html position={p} center style={{pointerEvents:'none',fontSize:12,fontWeight:700,color:'#9E1409',whiteSpace:'nowrap'}}>{t}</Html>

export const Matrix3D=({ideas,onSelect})=><Canvas camera={{position:[6,4.5,7],fov:45}} dpr={[1,2]}>
 <ambientLight intensity={.8}/><directionalLight position={[5,8,5]} intensity={2.5}/>
 <gridHelper args={[5,5,'#D62718','#e8c9c4']} position={[0,-2.5,0]}/>
 <mesh position={[1.25,1.25,0]}><boxGeometry args={[2.5,2.5,5]}/><meshStandardMaterial color="#00AA13" transparent opacity={.12} depthWrite={false}/></mesh>
 <Lbl p={[3,-2.5,-2.9]} t="Feasibility →"/><Lbl p={[-2.9,3,-2.9]} t="Impact ↑"/><Lbl p={[-2.9,-2.5,3]} t="Confidence →"/>
 {ideas.map((x,n)=><Pt key={x.id} x={x} onSelect={onSelect} pos={[x.s.f-3+((n%3)-1)*.08,x.s.i-3+((n%4)-1.5)*.08,x.conf/100*5-2.5]}/>)}
 <OrbitControls autoRotate autoRotateSpeed={.8} enablePan={false} minDistance={5} maxDistance={16}/></Canvas>
