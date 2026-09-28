const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const os = require("os");
const QRCode = require("qrcode");

const perguntas = [
  { id:1, texto:"Qual parte da hortelã é mais utilizada em preparações caseiras?", opcoes:{A:"Raiz",B:"Folhas",C:"Sementes"}, correta:"B" },
  { id:2, texto:"Além do uso tradicional, a sálvia também é bastante utilizada como:", opcoes:{A:"Tempero culinário",B:"Corante artificial",C:"Adoçante"}, correta:"A" },
  { id:3, texto:"O que significa dizer que a salsa foi desidratada?", opcoes:{A:"Foi congelada.",B:"Grande parte de sua água foi retirada.",C:"Foi misturada com sal."}, correta:"B" },
  { id:4, texto:"A manjerona pertence ao grupo das:", opcoes:{A:"Plantas aromáticas",B:"Algas",C:"Samambaias"}, correta:"A" },
  { id:5, texto:"Uma utilização bastante conhecida do alecrim é:", opcoes:{A:"Como tempero culinário",B:"Como substituto do açúcar",C:"Para produzir farinha"}, correta:"A" },
  { id:6, texto:"O poejo é tradicionalmente utilizado principalmente na forma de:", opcoes:{A:"Infusão das partes aéreas",B:"Farinha da raiz",C:"Óleo para fritura"}, correta:"A" },
  { id:7, texto:"Qual parte do guaco é tradicionalmente utilizada?", opcoes:{A:"Folhas",B:"Raízes apenas",C:"Flores apenas"}, correta:"A" }
];

function ips(){ const a=[]; Object.values(os.networkInterfaces()).forEach(l=>(l||[]).forEach(n=>{if(n.family==='IPv4'&&!n.internal&&!n.address.startsWith('169.254.'))a.push(n.address)})); return [...new Set(a)]; }
function createServer(){
  const app=express(); app.set('trust proxy',1); const server=http.createServer(app); const io=new Server(server);
  const dataDir=process.env.FEIRA_DATA_DIR||path.join(__dirname,"data"); fs.mkdirSync(dataDir,{recursive:true}); const DATA_FILE=path.join(dataDir,"resultados.json");
  function dadosVazios(){return {projeto:"Farmácia Viva no Espaço Escolar",totalParticipantes:0,perguntas:perguntas.map(p=>({id:p.id,texto:p.texto,opcoes:p.opcoes,correta:p.correta,A:0,B:0,C:0}))};}
  function carregarDados(){try{if(fs.existsSync(DATA_FILE)){const d=JSON.parse(fs.readFileSync(DATA_FILE,"utf8"));if(d?.projeto==="Farmácia Viva no Espaço Escolar"&&Array.isArray(d.perguntas))return d;}}catch(e){console.error("Erro ao ler dados:",e.message)}return dadosVazios();}
  let resultados=carregarDados(); const salvar=()=>fs.writeFileSync(DATA_FILE,JSON.stringify(resultados,null,2),"utf8"); let actualPort=null;
  app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));
  app.get("/api/perguntas",(req,res)=>res.json(perguntas.map(({correta,...p})=>p)));
  app.get("/api/resultados",(req,res)=>res.json(resultados));
  app.get("/api/info",(req,res)=>{const redes=ips();const ip=redes.find(x=>/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(x))||redes[0]||"127.0.0.1";const publicUrl=process.env.RENDER_EXTERNAL_URL||null;const base=publicUrl||`http://${ip}:${actualPort}`;res.json({port:actualPort,ip,ips:redes,publicUrl,pesquisa:`${base}/pesquisa.html`,dashboard:`${base}/dashboard.html`,relatorio:`${base}/relatorio.html`});});
  app.get("/api/qrcode",async(req,res)=>{try{const redes=ips();const ip=redes.find(x=>/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(x))||redes[0]||"127.0.0.1";const base=process.env.RENDER_EXTERNAL_URL||`http://${ip}:${actualPort}`;const tipo=req.query.tipo==='dashboard'?'dashboard.html':'pesquisa.html';const svg=await QRCode.toString(`${base}/${tipo}`,{type:'svg',margin:1,width:280});res.type('image/svg+xml').send(svg);}catch(e){res.status(500).send('QR indisponível')}});
  app.post("/api/responder",(req,res)=>{const respostas=req.body?.respostas;if(!Array.isArray(respostas)||respostas.length!==perguntas.length||respostas.some(r=>!["A","B","C"].includes(r)))return res.status(400).json({erro:"Respostas inválidas."});let acertos=0;respostas.forEach((r,i)=>{resultados.perguntas[i][r]++;if(r===perguntas[i].correta)acertos++;});resultados.totalParticipantes++;salvar();io.emit("resultadosAtualizados",resultados);res.json({ok:true,acertos,total:perguntas.length});});
  app.post("/api/resetar",(req,res)=>{if(req.body?.senha!=="medici8")return res.status(403).json({erro:"Senha incorreta."});resultados=dadosVazios();salvar();io.emit("resultadosAtualizados",resultados);res.json({ok:true});});
  io.on("connection",s=>s.emit("resultadosAtualizados",resultados));
  function start(preferred=3000){return new Promise((resolve,reject)=>{let p=preferred;const tryListen=()=>{const onError=e=>{server.removeListener('listening',onListening);if(e.code==='EADDRINUSE'&&p<3010&&!process.env.PORT){p++;setTimeout(tryListen,80);}else reject(e)};const onListening=()=>{server.removeListener('error',onError);actualPort=p;resolve({port:p,ips:ips()});};server.once('error',onError);server.once('listening',onListening);server.listen(p,"0.0.0.0");};tryListen();});}
  return {app,server,start};
}
if(require.main===module){const s=createServer();s.start(Number(process.env.PORT)||3000).then(({port,ips})=>{console.log(`Farmácia Viva no Espaço Escolar - servidor ativo na porta ${port}`);ips.forEach(ip=>console.log(`http://${ip}:${port}`));}).catch(e=>{console.error(e);process.exit(1)});}
module.exports={createServer};
