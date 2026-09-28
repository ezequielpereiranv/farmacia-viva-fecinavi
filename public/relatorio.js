const pct=(v,t)=>t?Math.round(v/t*100):0;
async function gerar(){
  const d=await (await fetch('/api/resultados')).json();
  document.getElementById('total').textContent=d.totalParticipantes;
  document.getElementById('data').textContent=new Date().toLocaleString('pt-BR');
  document.getElementById('perguntas').innerHTML=d.perguntas.map(p=>{
    const t=p.A+p.B+p.C;
    return `<article class="q"><h3>${p.id}. ${p.texto}</h3><div class="bars abc-report">${['A','B','C'].map(k=>`<div><b>${k} — ${p.opcoes[k]}</b><span><i style="width:${pct(p[k],t)}%"></i></span><strong>${p[k]} (${pct(p[k],t)}%)</strong></div>`).join('')}</div></article>`;
  }).join('');
  const totalRespostas=d.totalParticipantes*7;
  document.getElementById('sintese').innerHTML=d.totalParticipantes
    ? `<p>Foram registrados <b>${d.totalParticipantes} participante(s)</b>, totalizando <b>${totalRespostas} respostas</b> às sete questões. As tabelas acima apresentam a distribuição acumulada das alternativas A, B e C para uso posterior em análise e estudo.</p>`
    : `<p>Ainda não há participantes registrados. Gere novamente o relatório após a coleta de dados.</p>`;
}
gerar();
