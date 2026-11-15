import {publicState} from './engine.mjs';
const schoolJSON=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const schoolHash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const schoolRandom=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
const schoolCookie='__Host-arena_teacher';
const schoolEncoder=new TextEncoder();
const schoolSchemaCache=new WeakMap();
export async function classroomSchema(db){
 const cached=schoolSchemaCache.get(db);if(cached&&cached.until>Date.now())return cached.ready;
 const required=['activities','room_meta','room_history','submissions','teacher_attempts'];
 const rows=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('activities','room_meta','room_history','submissions','teacher_attempts')").all();
 const names=new Set((rows.results||[]).map(x=>x.name));const ready=required.every(x=>names.has(x));schoolSchemaCache.set(db,{ready,until:Date.now()+5000});return ready;
}
export async function classroomReady(env){return typeof env.TEACHER_PASSWORD==='string'&&env.TEACHER_PASSWORD.length>=16&&await classroomSchema(env.DB)}
async function schoolSigningKey(secret){return crypto.subtle.importKey('raw',schoolEncoder.encode('arena-teacher-session:'+secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function schoolSign(text,secret){const sig=await crypto.subtle.sign('HMAC',await schoolSigningKey(secret),schoolEncoder.encode(text));return Array.from(new Uint8Array(sig),x=>x.toString(16).padStart(2,'0')).join('')}
async function schoolAuth(request,env){
 if(typeof env.TEACHER_PASSWORD!=='string'||env.TEACHER_PASSWORD.length<16)return false;
 const cookie=request.headers.get('cookie')||'',session=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(schoolCookie+'='))?.slice(schoolCookie.length+1)||'';
 const [expires,nonce,sig]=session.split('.');if(!/^\d{13}$/.test(expires||'')||Number(expires)<=Date.now()||!/^\d{13}$/.test(expires)||Number(expires)>Date.now()+28800000||!/^[a-f0-9-]{36}$/.test(nonce||'')||!/^[a-f0-9]{64}$/.test(sig||''))return false;
 return crypto.subtle.verify('HMAC',await schoolSigningKey(env.TEACHER_PASSWORD),new Uint8Array(sig.match(/../g).map(x=>parseInt(x,16))),schoolEncoder.encode(expires+'.'+nonce));
}
export function schoolName(value){const name=String(value||'').trim().replace(/\s+/g,' ');if(name.length<2||name.length>40||/[\x00-\x1f\x7f]/.test(name))throw Error('Use um apelido ou primeiro nome com 2 a 40 caracteres.');return name}
export async function roomSchoolMeta(db,code){return db.prepare('SELECT m.*,a.title AS activity_title FROM room_meta m LEFT JOIN activities a ON a.code=m.activity_code WHERE m.code=?').bind(code).first()}
export function publicSchoolMeta(meta){return meta?{names:[meta.nickname1,meta.nickname2||'Jogador 2'],activity:meta.activity_code?{code:meta.activity_code,title:meta.activity_title}:null}:null}
export async function schoolActivity(db,code){return db.prepare('SELECT code,title,open,created_at FROM activities WHERE code=?').bind(String(code||'').trim().toUpperCase()).first()}
export async function classroomAPI(request,env,parts,input,db){
 if(parts[1]==='classroom'&&parts[2]==='status')return schoolJSON({ready:await classroomReady(env)});
 if(parts[1]==='activities'&&request.method==='GET'){
  if(!await classroomReady(env))return schoolJSON({error:'Atividades do professor ainda não estão habilitadas.'},503);
  const a=await schoolActivity(db,parts[2]);return a?schoolJSON({activity:a}):schoolJSON({error:'Código de atividade não encontrado.'},404);
 }
 if(parts[1]!=='teacher')return schoolJSON({error:'Rota não encontrada.'},404);
 const ready=await classroomReady(env);
 if(parts[2]==='session')return schoolJSON({ready,authenticated:ready&&await schoolAuth(request,env)});
 if(!ready)return schoolJSON({error:'Painel ainda não ativado. Configure o segredo TEACHER_PASSWORD e execute o SQL de atualização. Veja PAINEL_PROFESSOR.md.'},503);
 if(parts[2]==='login'&&request.method==='POST'){
  const password=String(input.password||'');if(password.length>256)return schoolJSON({error:'Senha inválida.'},400);
  const now=Date.now(),key=await schoolHash((request.headers.get('CF-Connecting-IP')||'unknown')+':'+env.TEACHER_PASSWORD),attempt=await db.prepare('SELECT failures,expires FROM teacher_attempts WHERE key=?').bind(key).first();
  if(attempt&&attempt.expires>now&&attempt.failures>=8)return schoolJSON({error:'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.'},429);
  // Incremento atômico antes da verificação: tentativas simultâneas também contam.
  await db.prepare('INSERT INTO teacher_attempts (key,failures,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET failures=CASE WHEN expires<=? THEN 1 ELSE failures+1 END,expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END').bind(key,now+900000,now,now).run();
  const guess=await schoolSign('password:'+password,env.TEACHER_PASSWORD),expected=await schoolSign('password:'+env.TEACHER_PASSWORD,env.TEACHER_PASSWORD);
  let difference=0;for(let i=0;i<expected.length;i++)difference|=guess.charCodeAt(i)^expected.charCodeAt(i);
  if(difference)return schoolJSON({error:'Senha incorreta.'},401);
  await db.prepare('DELETE FROM teacher_attempts WHERE key=?').bind(key).run();
  const body=(now+28800000)+'.'+crypto.randomUUID(),session=body+'.'+await schoolSign(body,env.TEACHER_PASSWORD);
  return schoolJSON({authenticated:true},200,{'Set-Cookie':schoolCookie+'='+session+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800'});
 }
 if(!await schoolAuth(request,env))return schoolJSON({error:'Entre no painel do professor para continuar.'},401);
 if(parts[2]==='logout'&&request.method==='POST')return schoolJSON({authenticated:false},200,{'Set-Cookie':schoolCookie+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
 if(parts[2]==='activities'){
  if(request.method==='POST'){
   const title=String(input.title||'').trim();if(title.length<3||title.length>80)throw Error('O título deve ter de 3 a 80 caracteres.');
   const code=schoolRandom();await db.prepare('INSERT INTO activities (code,title,open,created_at) VALUES (?,?,1,?)').bind(code,title,Date.now()).run();return schoolJSON({activity:{code,title,open:1}});
  }
  const rows=await db.prepare('SELECT a.*,(SELECT COUNT(*) FROM room_meta m WHERE m.activity_code=a.code) AS room_count,(SELECT COUNT(*) FROM submissions s JOIN room_meta m ON m.code=s.room_code WHERE m.activity_code=a.code) AS submission_count FROM activities a ORDER BY created_at DESC LIMIT 100').all();return schoolJSON({activities:rows.results||[]});
 }
 if(parts[2]==='rooms'&&parts[3]){
  const code=String(parts[3]).toUpperCase(),row=await db.prepare('SELECT r.*,m.activity_code,m.nickname1,m.nickname2,a.title AS activity_title FROM rooms r JOIN room_meta m ON m.code=r.code JOIN activities a ON a.code=m.activity_code WHERE r.code=?').bind(code).first();if(!row)return schoolJSON({error:'Partida de atividade não encontrada.'},404);
  const before=Number(new URL(request.url).searchParams.get('before')||2147483647);if(!Number.isSafeInteger(before)||before<0)throw Error('Página de histórico inválida.');
  const history=await db.prepare('SELECT version,state,player,created_at FROM room_history WHERE room_code=? AND version<? ORDER BY version DESC LIMIT 50').bind(code,before).all();
  const hs=(history.results||[]).map(h=>({...h,state:publicState(JSON.parse(h.state),-1)}));
  const submissions=await db.prepare('SELECT player,nickname,reason,strategy,submitted_at FROM submissions WHERE room_code=? ORDER BY player').bind(code).all();
  return schoolJSON({room:{code,activity:row.activity_title,activityCode:row.activity_code,names:[row.nickname1,row.nickname2||'Aguardando'],state:publicState(JSON.parse(row.state),-1),version:row.version,expires:row.expires,joined:!!row.player2},history:hs,nextBefore:hs.length===50?hs[hs.length-1].version:null,submissions:submissions.results||[]});
 }
 if(parts[2]==='rooms'&&request.method==='GET'){
  const activity=new URL(request.url).searchParams.get('activity');if(!/^[A-Z2-9]{8}$/.test(activity||''))throw Error('Selecione uma atividade.');
  const rows=await db.prepare('SELECT r.code,r.state,r.version,r.expires,r.player2,m.nickname1,m.nickname2,m.created_at,(SELECT COUNT(*) FROM submissions s WHERE s.room_code=r.code) AS delivered FROM rooms r JOIN room_meta m ON m.code=r.code WHERE m.activity_code=? ORDER BY m.created_at DESC LIMIT 200').bind(activity).all();
  return schoolJSON({rooms:(rows.results||[]).map(r=>({code:r.code,names:[r.nickname1,r.nickname2||'Aguardando'],state:publicState(JSON.parse(r.state),-1),version:r.version,expires:r.expires,joined:!!r.player2,created:r.created_at,delivered:r.delivered}))});
 }
 return schoolJSON({error:'Rota do professor não encontrada.'},404);
}
