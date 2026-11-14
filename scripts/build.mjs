import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const catalog=read('src/catalog.mjs').replace('export const games','const games');
const engine=read('src/engine.mjs').replace(/^import .*;\n/gm,'').replace(/^export \{games\};\n/gm,'').replaceAll('export function ','function ');
const api=read('src/api.mjs').replace(/^import .*;\n/gm,'').replace('export async function api','async function api');
const client=catalog+'\n'+engine+'\n'+read('src/client.mjs');
const assets={'/':{type:'text/html;charset=utf-8',body:read('src/index.html')},'/style.css':{type:'text/css;charset=utf-8',body:read('src/style.css')},'/app.js':{type:'text/javascript;charset=utf-8',body:client}};
const worker=catalog+'\n'+engine+'\n'+api+'\nconst assets='+JSON.stringify(assets)+';\n'+`export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path.startsWith('/api/'))return api(request,env);const a=assets[path];if(!a)return new Response('Página não encontrada',{status:404});return new Response(a.body,{headers:{'Content-Type':a.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'self'; frame-ancestors 'none'"}})}};`;
fs.mkdirSync('worker',{recursive:true});fs.writeFileSync('worker/index.js',worker);fs.mkdirSync('dist/server',{recursive:true});fs.writeFileSync('dist/server/index.js',worker);console.log('Arena built with embedded assets and authoritative multiplayer API.');
