import {games} from './catalog.mjs';
export {games};
export function createGame(id,variant=0){
 const game=games.find(g=>g.id===id);if(!game||!Number.isInteger(variant)||!game.variants[variant])throw Error('Desafio inválido.');
 const v=game.variants[variant];let board={};
 if(id===0)board={n:v,a:0,b:v-1};
 if(id===1)board={a:v[0],b:v[1]};
 if([2,3,9].includes(id))board={n:v};
 if([4,6].includes(id))board={n:v,c:Array(v*v).fill(0)};
 if(id===5)board={p:[v]};
 if(id===7)board={mod:v,secrets:[null,null],ready:[false,false],round:1,score:[0,0],result:null};
 return {id,variant,turn:0,board,done:false,winner:null,log:[],message:'',rounds:[]};
}
function integer(n,min,max){if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`Informe um inteiro entre ${min} e ${max}.`);return n}
export function primePower(n){if(n===1)return true;for(let p=2;p*p<=n;p++)if(n%p===0){while(n%p===0)n/=p;return n===1}return n>1}
function end(s,w,message){s.done=true;s.winner=w;s.message=message||`Jogador ${w+1} venceu!`}
function advance(s,player,text,terminal){s.log.push(`J${player+1}: ${text}`);s.log=s.log.slice(-60);if(terminal)end(s,player);else s.turn=1-player}
export function play(state,move,player){
 if(!move||typeof move!=='object')throw Error('Jogada inválida.');
 if(state.done)throw Error('Esta partida já terminou.');
 if(player!==0&&player!==1)throw Error('Jogador inválido.');
 const s=structuredClone(state),b=s.board,id=s.id;
 if(id!==7&&s.turn!==player)throw Error('Aguarde a sua vez.');
 if(id===0){let q=integer(move.q,1,2);if(!['a','b'].includes(move.p)||b.b-b.a-1<q)throw Error('As peças não podem se cruzar.');b[move.p]+=move.p==='a'?q:-q;advance(s,player,`moveu ${q} casa(s)`,b.b-b.a===1)}
 else if(id===1){let q=integer(move.q,1,100),p=move.p;if(!['a','b','both'].includes(p)||(p!=='b'&&q>b.a)||(p!=='a'&&q>b.b))throw Error('Retirada inválida.');if(p!=='b')b.a-=q;if(p!=='a')b.b-=q;advance(s,player,`retirou ${q} ${p==='both'?'de ambas as pilhas':'da pilha '+p.toUpperCase()}`,b.a+b.b===0)}
 else if([2,3,9].includes(id)){let q=integer(move.q,1,b.n);if(id===2&&!primePower(q))throw Error('Retire 1 ou uma potência de um único primo.');if(id===3&&q>Math.floor(b.n/2))throw Error('Retire no máximo metade da pilha.');if(id===9&&q>3)throw Error('Retire de 1 a 3 pontos.');b.n-=q;if(id===9&&b.n===0){s.log.push(`J${player+1} retirou o último ponto.`);end(s,1-player)}else advance(s,player,`retirou ${q}`,id===3?b.n===1:b.n===0)}
 else if(id===4){let i=integer(move.i,0,b.c.length-1);if(b.c[i])throw Error('Esta casa já está ocupada.');b.c[i]=player+1;advance(s,player,`marcou linha ${Math.floor(i/b.n)+1}, coluna ${i%b.n+1}`,false);if(b.c.every(Boolean)){let scores=[0,0];for(let k=0;k<b.n;k++)for(let axis=0;axis<2;axis++){let count=0;for(let j=0;j<b.n;j++)if(b.c[axis?j*b.n+k:k*b.n+j]===1)count++;scores[count>b.n/2?0:1]++}s.scores=scores;end(s,scores[0]>scores[1]?0:1,`Placar X ${scores[0]} × O ${scores[1]}. Jogador ${scores[0]>scores[1]?1:2} venceu!`)}}
 else if(id===5){if(!Array.isArray(move.splits)||!move.splits.length||move.splits.length>b.p.length)throw Error('Selecione ao menos uma pilha para dividir.');let splits=new Map();for(let m of move.splits){let i=integer(m.i,0,b.p.length-1);if(splits.has(i))throw Error('Cada pilha só pode ser dividida uma vez por turno.');let a=integer(m.a,1,b.p[i]-1);splits.set(i,[a,b.p[i]-a])}b.p=b.p.flatMap((n,i)=>splits.get(i)||[n]);advance(s,player,`dividiu ${splits.size} pilha(s)`,b.p.every(n=>n===1))}
 else if(id===6){let a=integer(move.a,0,b.c.length-1),z=integer(move.b,0,b.c.length-1),r1=Math.min(a/b.n|0,z/b.n|0),r2=Math.max(a/b.n|0,z/b.n|0),c1=Math.min(a%b.n,z%b.n),c2=Math.max(a%b.n,z%b.n);for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(b.c[r*b.n+c])throw Error('O retângulo contém casas pintadas ou bloqueadas.');for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)b.c[r*b.n+c]=player+1;for(let r=Math.max(0,r1-1);r<=Math.min(b.n-1,r2+1);r++)for(let c=Math.max(0,c1-1);c<=Math.min(b.n-1,c2+1);c++)if(!b.c[r*b.n+c])b.c[r*b.n+c]=3;advance(s,player,`pintou retângulo ${r2-r1+1} × ${c2-c1+1}`,b.c.every(Boolean))}
 else if(id===7){
  if(move.type==='ready'){if(!b.result)throw Error('Conclua a rodada primeiro.');b.ready[player]=true;if(b.ready.every(Boolean)){b.secrets=[null,null];b.ready=[false,false];b.result=null;b.round++}return s}
  if(b.result)throw Error('Confirme que está pronto para a próxima rodada.');if(b.secrets[player]!==null)throw Error('Você já confirmou seu número.');let n=integer(move.n,1,1000000);if(b.mod===3&&n%3===0)throw Error('Escolha um número não divisível por 3.');b.secrets[player]=n;
  if(b.secrets.every(x=>x!==null)){let product=b.secrets[0]*b.secrets[1],remainder=product%b.mod,winner=b.mod===2?(remainder===0?0:1):(remainder===1?0:1);b.score[winner]++;b.result={numbers:[...b.secrets],product,remainder,winner};s.log.push(`Rodada ${b.round}: ${b.secrets.join(' × ')} = ${product}; resto ${remainder}; ponto J${winner+1}.`);s.rounds.push(b.result);if(b.score[winner]===3)end(s,winner,`Jogador ${winner+1} venceu por ${b.score[0]} × ${b.score[1]}!`)}
 }
 return s;
}
// Nunca divulga os números secretos antes da confirmação dos dois jogadores.
export function publicState(state,player){let s=structuredClone(state);if(s.id===7){let b=s.board;b.submitted=b.secrets.map(x=>x!==null);if(!b.result)b.secrets=b.secrets.map(()=>null);b.mySubmitted=b.submitted[player]}return s}
