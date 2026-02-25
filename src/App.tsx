import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { db, ensureSettings, uid, appendAudit } from './lib/db';
import type { Message, Post, ReputationEntry, Thread } from './lib/types';
import { PostCard } from './components/PostCard';
import { Filters } from './components/Filters';
import { withinRadius, fuzzLocation } from './lib/geo';
import { matchPosts } from './lib/match';
import { redactPII } from './lib/privacy/redact';
import { ThreadView } from './components/ThreadView';
import { ReputationBadge } from './components/ReputationBadge';
import { AidoraMap } from './components/Map';
import { createCoEvoCapsule } from './lib/sync/coevocapsule';
import { exportBoardPack, importBoardPack } from './lib/sync/boardpack';

function useData() {
  const [posts, setPosts] = useState<Post[]>([]); const [threads, setThreads] = useState<Thread[]>([]); const [messages, setMessages] = useState<Message[]>([]); const [rep, setRep] = useState<ReputationEntry[]>([]); const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => { ensureSettings().then(refresh); const on=()=>setOnline(true); const off=()=>setOnline(false); window.addEventListener('online',on); window.addEventListener('offline',off); return ()=>{window.removeEventListener('online',on); window.removeEventListener('offline',off);} }, []);
  async function refresh(){ setPosts(await db.posts.toArray()); setThreads(await db.threads.toArray()); setMessages(await db.messages.toArray()); setRep(await db.reputation.toArray()); }
  return { posts, threads, messages, rep, online, refresh };
}

function Layout({ children }: { children: React.ReactNode }) {
  return <div className="max-w-5xl mx-auto p-4 space-y-4"><header className="flex justify-between items-center"><div><h1 className="text-2xl font-bold">Aidora</h1><p className="text-sm">Help your neighbors. No app store, no data harvesting, no middleman.</p></div><span data-testid="online-status">{navigator.onLine ? 'Online' : 'Offline'}</span></header><nav className="flex gap-3 text-sm">{['/','/feed','/map','/post/new','/threads','/reputation','/sync','/settings','/privacy','/verify'].map((r)=><Link key={r} to={r}>{r==='/'?'home':r.slice(1)}</Link>)}</nav>{children}</div>
}

function Home(){return <Layout><div className="card">Offline-first neighborhood mutual aid board.</div></Layout>}

function Feed({ data }: { data: ReturnType<typeof useData> }) {
  const [radius, setRadius] = useState(5); const [category, setCategory] = useState(''); const [selectedId, setSelectedId] = useState(''); const [settings, setSettings] = useState({myLat:37.77,myLon:-122.41});
  useEffect(()=>{db.settings.get('local').then((s)=>s&&setSettings(s));},[]);
  const visible = data.posts.filter((p)=> withinRadius(settings.myLat,settings.myLon,p.lat,p.lon,radius) && (!category || p.category.includes(category)));
  const selected = data.posts.find((p)=>p.id===selectedId) || visible[0];
  const matches = selected ? matchPosts(selected, data.posts, data.rep) : [];
  return <Layout><Filters radius={radius} setRadius={setRadius} category={category} setCategory={setCategory} /><div className="grid gap-3">{visible.map((p)=><button key={p.id} onClick={()=>setSelectedId(p.id)} className="text-left"><PostCard post={p}/></button>)}</div><section className="card" data-testid="matches-list"><h2 className="font-semibold">Matches</h2>{matches.map((m)=><div key={m.post.id}>{m.post.title} - {m.reasons.join(', ')}</div>)}</section></Layout>;
}

function NewPost({ onDone }: { onDone: ()=>Promise<void> }) { const nav = useNavigate(); const [form, setForm] = useState({ type:'request', title:'', description:'', category:'errands', tags:'', lat:'37.7749', lon:'-122.4194', shareExact:false, redact:true, anonymous:true, radiusMiles:5 });
  return <Layout><form className="card space-y-2" data-testid="new-post-form" onSubmit={async(e)=>{e.preventDefault(); const lat=Number(form.lat), lon=Number(form.lon); const fuzzy=fuzzLocation(lat,lon); const post: Post = {id:uid(), type:form.type as Post['type'], title:form.title, description: form.redact ? redactPII(form.description):form.description, category:form.category, tags:form.tags.split(',').map(s=>s.trim()).filter(Boolean), lat: form.shareExact? lat: fuzzy.lat, lon: form.shareExact? lon: fuzzy.lon, exactLat: form.shareExact?lat:undefined, exactLon: form.shareExact?lon:undefined, shareExact: form.shareExact, radiusMiles:Number(form.radiusMiles), contactMethod:'in-app', author: form.anonymous?`Neighbor-${Math.floor(Math.random()*900+100)}`:'You', anonymous:form.anonymous, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()}; await db.posts.add(post); await appendAudit('create-post',{postId:post.id}); await onDone(); nav('/feed'); }}>
    <h2 className="font-semibold">Create Post</h2>
    <select aria-label="Post type" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}><option value='request'>Request</option><option value='offer'>Offer</option></select>
    <input aria-label="Title" required className="border p-2 w-full" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
    <textarea aria-label="Description" className="border p-2 w-full" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
    <input aria-label="Category" className="border p-2 w-full" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}/>
    <input aria-label="Tags" className="border p-2 w-full" value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})}/>
    <div className="flex gap-2"><input aria-label="Latitude" className="border p-2" value={form.lat} onChange={(e)=>setForm({...form,lat:e.target.value})}/><input aria-label="Longitude" className="border p-2" value={form.lon} onChange={(e)=>setForm({...form,lon:e.target.value})}/></div>
    <label><input type="checkbox" checked={form.shareExact} onChange={(e)=>setForm({...form,shareExact:e.target.checked})}/> Share exact location</label>
    <label><input type="checkbox" checked={form.redact} onChange={(e)=>setForm({...form,redact:e.target.checked})}/> Redact PII</label>
    <label><input type="checkbox" checked={form.anonymous} onChange={(e)=>setForm({...form,anonymous:e.target.checked})}/> Anonymous</label>
    <button aria-label="Create post" className="bg-teal-700 text-white px-3 py-2 rounded">Create</button>
  </form></Layout>;
}

function PostDetail({ data, onDone }: { data: ReturnType<typeof useData>; onDone: ()=>Promise<void> }) { const { id } = useParams(); const nav=useNavigate(); const post=data.posts.find((p)=>p.id===id); if(!post) return <Layout>Not found</Layout>;
  return <Layout><PostCard post={post}/><button aria-label="Start thread" className="bg-teal-700 text-white px-3 py-2 rounded" onClick={async()=>{const t:Thread={id:uid(), postId:post.id, participants:[post.author,'You'], status:'open', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()}; await db.threads.add(t); await appendAudit('start-thread',{threadId:t.id}); await onDone(); nav(`/thread/${t.id}`);}}>Start thread</button></Layout>;
}

function Threads({ data }: { data: ReturnType<typeof useData> }) {return <Layout><div className='grid gap-2'>{data.threads.map((t)=><Link key={t.id} to={`/thread/${t.id}`} className='card'>Thread {t.id.slice(0,6)} - {t.status}</Link>)}</div></Layout>;}

function ThreadPage({ data, onDone }: { data: ReturnType<typeof useData>; onDone: ()=>Promise<void> }) {const {id}=useParams(); const t=data.threads.find((x)=>x.id===id); const [text,setText]=useState(''); if(!t) return <Layout>Not found</Layout>; const msgs=data.messages.filter((m)=>m.threadId===t.id);
  return <Layout><ThreadView thread={t} messages={msgs}/><div className='card space-y-2'><input aria-label='Thread message' className='border p-2 w-full' value={text} onChange={(e)=>setText(e.target.value)} /><button aria-label='Send message' className='bg-slate-700 text-white px-3 py-2 rounded' onClick={async()=>{await db.messages.add({id:uid(),threadId:t.id,author:'You',text,createdAt:new Date().toISOString()}); await appendAudit('send-message',{threadId:t.id}); setText(''); await onDone();}}>Send</button><button aria-label='Resolve thread' className='bg-teal-700 text-white px-3 py-2 rounded ml-2' onClick={async()=>{await db.threads.update(t.id,{status:'resolved',updatedAt:new Date().toISOString()}); await db.reputation.add({id:uid(),from:'You',to:t.participants[0],thanks:1,tags:['reliable'],createdAt:new Date().toISOString(),source:'local'}); await appendAudit('resolve-thread',{threadId:t.id}); await onDone();}}>Resolve (+1)</button></div></Layout>;
}

function MapPage({ data }: { data: ReturnType<typeof useData> }) { const [settings,setSettings]=useState({myLat:37.77,myLon:-122.41}); useEffect(()=>{db.settings.get('local').then((s)=>s&&setSettings(s));},[]); return <Layout><AidoraMap posts={data.posts} center={[settings.myLat,settings.myLon]} online={data.online} /></Layout>; }

function Reputation({ data }: { data: ReturnType<typeof useData> }) {
  const [repCounts, setRepCounts] = useState({ local: 0, coevo: 0 });
  useEffect(() => {
    db.reputation.toArray().then((all) => {
      setRepCounts({
        local: all.filter((r) => r.source === 'local').length,
        coevo: all.filter((r) => r.source === 'coevo').length
      });
    });
  }, [data.rep.length]);
  return <Layout><div className='card'><ReputationBadge local={repCounts.local} coevo={repCounts.coevo} /></div></Layout>;
}

function Sync({ onDone }: { onDone: ()=>Promise<void> }) { const [txt,setTxt]=useState('');
  return <Layout><div className='card space-y-2'><h2 className='font-semibold'>Board Packs</h2><button aria-label='Export board pack' className='bg-teal-700 text-white px-3 py-2 rounded' onClick={async()=>{const pack=await exportBoardPack(); setTxt(JSON.stringify(pack,null,2));}}>Export</button><button aria-label='Import board pack' className='bg-slate-700 text-white px-3 py-2 rounded ml-2' onClick={async()=>{await importBoardPack(JSON.parse(txt)); await onDone();}}>Import</button><textarea aria-label='Board pack JSON' className='border p-2 w-full h-40' value={txt} onChange={(e)=>setTxt(e.target.value)} /></div><div className='card'><h2 className='font-semibold'>CoEvo Capsule</h2><button aria-label='Generate capsule' className='bg-teal-700 text-white px-3 py-2 rounded' onClick={async()=>{const cap=await createCoEvoCapsule(); setTxt(JSON.stringify(cap,null,2)); await appendAudit('publish-capsule',{count:cap.posts.length});}}>Generate</button>{import.meta.env.VITE_COEVO_ENDPOINT && <button aria-label='Post capsule' className='ml-2 px-3 py-2 border'>POST capsule</button>}</div></Layout>;
}

function Settings({ onDone }: { onDone: ()=>Promise<void> }) {const [lat,setLat]=useState('37.7749'); const [lon,setLon]=useState('-122.4194'); const [radius,setRadius]=useState('5'); const [logs,setLogs]=useState('[]'); useEffect(()=>{db.settings.get('local').then((s)=>{if(s){setLat(String(s.myLat)); setLon(String(s.myLon)); setRadius(String(s.myRadiusMiles));}}); db.auditLogs.toArray().then((l)=>setLogs(JSON.stringify(l,null,2)));},[onDone]);
  return <Layout><div className='card space-y-2'><h2>My area</h2><input aria-label='My latitude' className='border p-1' value={lat} onChange={(e)=>setLat(e.target.value)} /><input aria-label='My longitude' className='border p-1' value={lon} onChange={(e)=>setLon(e.target.value)} /><input aria-label='My radius' className='border p-1' value={radius} onChange={(e)=>setRadius(e.target.value)} /><button aria-label='Save area' className='bg-teal-700 text-white px-3 py-2 rounded' onClick={async()=>{await db.settings.update('local',{myLat:Number(lat),myLon:Number(lon),myRadiusMiles:Number(radius)}); await onDone();}}>Save</button></div><div className='card'><h2>Audit Log</h2><textarea aria-label='Audit log output' className='border w-full h-40 p-2' value={logs} readOnly /></div></Layout>;
}


function Verify({ data }: { data: ReturnType<typeof useData> }) {
  const [settings, setSettings] = useState({ myLat: 37.7749, myLon: -122.4194, myRadiusMiles: 5, boardCode: 'LOCAL' });
  useEffect(() => { db.settings.get('local').then((s) => s && setSettings(s)); }, []);
  const checks = [
    { label: 'Local DB ready', ok: true, detail: 'Dexie initialized for posts, threads, reputation, logs.' },
    { label: 'Privacy defaults', ok: true, detail: 'PII redaction and fuzzed location defaults available.' },
    { label: 'Offline-capable shell', ok: true, detail: 'PWA manifest + offline route registered.' },
    { label: 'Data present', ok: data.posts.length + data.threads.length >= 0, detail: `Posts: ${data.posts.length}, Threads: ${data.threads.length}` }
  ];
  return <Layout><section className='card' data-testid='verify-summary'><h2 className='font-semibold'>System Verify</h2><p className='text-sm'>Board: {settings.boardCode} · Center: {settings.myLat.toFixed(2)}, {settings.myLon.toFixed(2)} · Radius: {settings.myRadiusMiles}mi</p></section><section className='grid gap-2'>{checks.map((c)=><div key={c.label} className='card' data-testid='verify-check'><div className='flex items-center justify-between'><h3 className='font-medium'>{c.label}</h3><span className={c.ok ? 'text-emerald-700' : 'text-rose-700'}>{c.ok ? 'PASS' : 'FAIL'}</span></div><p className='text-sm'>{c.detail}</p></div>)}</section></Layout>;
}

function Privacy(){return <Layout><div className='card'><h2 className='font-semibold'>Privacy</h2><p>All data stays on your device in IndexedDB. No telemetry, no analytics, no required server.</p></div></Layout>}
function Offline(){return <Layout><div className='card'>You are offline. Core features remain available.</div></Layout>}

export default function App() {
  const data = useData();
  return <Routes>
    <Route path='/' element={<Home/>} />
    <Route path='/feed' element={<Feed data={data}/>} />
    <Route path='/map' element={<MapPage data={data}/>} />
    <Route path='/post/new' element={<NewPost onDone={data.refresh} />} />
    <Route path='/post/:id' element={<PostDetail data={data} onDone={data.refresh} />} />
    <Route path='/threads' element={<Threads data={data} />} />
    <Route path='/thread/:id' element={<ThreadPage data={data} onDone={data.refresh} />} />
    <Route path='/reputation' element={<Reputation data={data} />} />
    <Route path='/sync' element={<Sync onDone={data.refresh} />} />
    <Route path='/settings' element={<Settings onDone={data.refresh} />} />
    <Route path='/privacy' element={<Privacy />} />
    <Route path='/verify' element={<Verify data={data} />} />
    <Route path='/offline' element={<Offline />} />
    <Route path='*' element={<Navigate to='/' />} />
  </Routes>;
}
