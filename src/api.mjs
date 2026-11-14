import {createGame,play,publicState} from './engine.mjs';
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const token=()=>crypto.randomUUID()+crypto.randomUUID();
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const roomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(10)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
export async function api(request,env){
 try{
  if(!env.DB)return json({error:'O serviço de salas ainda não está disponível.'},503);
  const url=new URL(request.url),parts=url.pathname.split('/').filter(Boolean),db=env.DB.withSession?env.DB.withSession('first-primary'):env.DB;
  if(request.method==='POST'&&request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Origem inválida.'},403);
  if(request.method==='POST'&&Number(request.headers.get('content-length')||0)>30000)return json({error:'Pedido muito grande.'},413);
  let input={};if(request.method==='POST'){const raw=await request.text();if(raw.length>30000)return json({error:'Pedido muito grande.'},413);try{input=JSON.parse(raw)}catch{return json({error:'Pedido inválido.'},400)}}
  if(parts.length===2&&parts[1]==='rooms'&&request.method==='POST'){
   const state=createGame(input.game,input.variant),code=roomCode(),key=token(),now=Date.now();
   await db.prepare('INSERT INTO rooms (code,player1,state,version,expires) VALUES (?,?,?,0,?)').bind(code,await hash(key),JSON.stringify(state),now+86400000).run();
   return json({code,token:key,player:0,state:publicState(state,0),version:0,joined:false,expires:now+86400000});
  }
  const code=String(parts[2]||'').toUpperCase();if(!/^[A-Z2-9]{10}$/.test(code))return json({error:'Código de sala inválido.'},400);
  let row=await db.prepare('SELECT * FROM rooms WHERE code=? AND expires>?').bind(code,Date.now()).first();if(!row)return json({error:'Sala não encontrada ou expirada.'},404);
  if(parts[3]==='join'&&request.method==='POST'){
   if(row.player2)return json({error:'Esta sala já tem dois jogadores. Use o dispositivo em que você entrou ou crie outra sala.'},409);
   const key=token(),hashed=await hash(key);let result=await db.prepare('UPDATE rooms SET player2=?,version=version+1 WHERE code=? AND player2 IS NULL').bind(hashed,code).run();
   if(!result.meta.changes)return json({error:'Outra pessoa acabou de entrar nesta sala.'},409);
   return json({code,token:key,player:1,state:publicState(JSON.parse(row.state),1),version:row.version+1,joined:true,expires:row.expires});
  }
  const key=request.headers.get('authorization')?.replace(/^Bearer /,'')||'',hashed=await hash(key),player=hashed===row.player1?0:hashed===row.player2?1:-1;
  if(player<0)return json({error:'Entre na sala para jogar.'},401);
  if(parts.length===3&&request.method==='GET')return json({code,player,state:publicState(JSON.parse(row.state),player),version:row.version,joined:!!row.player2,expires:row.expires});
  if(parts[3]==='move'&&request.method==='POST'){
   if(!row.player2)return json({error:'Aguarde o segundo jogador.'},409);
   if(input.version!==row.version)return json({error:'A partida foi atualizada. Sua tela será sincronizada.'},409);
   const state=play(JSON.parse(row.state),input.move,player);
   let result=await db.prepare('UPDATE rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(JSON.stringify(state),code,row.version).run();
   if(!result.meta.changes)return json({error:'Uma jogada chegou primeiro. Tente novamente após sincronizar.'},409);
   return json({code,player,state:publicState(state,player),version:row.version+1,joined:true,expires:row.expires});
  }
  return json({error:'Rota não encontrada.'},404);
 }catch(e){if(e instanceof TypeError||/SQLITE|D1_|no such table|database/i.test(e.message)){console.error('Room service failure');return json({error:'Não foi possível acessar a sala. Tente novamente.'},503)}return json({error:e.message||'Não foi possível processar a jogada.'},400)}
}
