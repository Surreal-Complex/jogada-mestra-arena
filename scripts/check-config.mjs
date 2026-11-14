import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('wrangler.json','utf8'));
const db=config.d1_databases?.find(x=>x.binding==='DB');
if(!db||!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(db.database_id)||/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(db.database_id)){
 console.error('Configure o database_id do seu banco D1 em wrangler.json. Veja PUBLICAR_CLOUDFLARE.md. O ID de zeros é apenas um exemplo.');process.exit(1);
}
console.log('Banco D1 configurado.');
