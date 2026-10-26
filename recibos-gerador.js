(function(){
 const $=id=>document.getElementById(id);
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dataExtenso=s=>new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(s+'T12:00:00'));
 function inteiroExtenso(n){
  if(n===0)return 'zero';
  const u=['','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
  const d=['','dez','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const e=['dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const c=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
  function ate999(v){
   if(v===100)return 'cem';
   let bits=[];if(v>=100){bits.push(c[Math.floor(v/100)]);v%=100;}
   if(v>=20){bits.push(d[Math.floor(v/10)]);v%=10;}
   if(v>=10){bits.push(e[v-10]);v=0;}
   if(v>0)bits.push(u[v]);
   return bits.join(' e ');
  }
  if(n<1000)return ate999(n);
  if(n<1000000){const mil=Math.floor(n/1000),rest=n%1000;return (mil===1?'mil':ate999(mil)+' mil')+(rest?(rest<100||rest%100===0?' e ':', ')+ate999(rest):'');}
  const mi=Math.floor(n/1000000),rest=n%1000000;
  return (mi===1?'um milhão':inteiroExtenso(mi)+' milhões')+(rest?(rest<100?' e ':', ')+inteiroExtenso(rest):'');
 }
 function valorExtenso(cents){
  const reais=Math.floor(cents/100),centavos=cents%100;
  let result=reais?inteiroExtenso(reais)+(reais===1?' real':' reais'):'';
  if(centavos)result+=(result?' e ':'')+inteiroExtenso(centavos)+(centavos===1?' centavo':' centavos');
  return result||'zero real';
 }
 function dados(){
  const nome=$('reciboNome').value.trim(),raw=$('reciboValor').value.replace(',','.'),num=Number(raw),data=$('reciboData').value;
  const cents=Math.round(num*100),referencia=$('reciboReferencia').value.trim();
  if(!nome||!data||!Number.isFinite(num)||cents<=0||cents>99999999999){$('reciboAviso').textContent='Preencha nome, valor positivo e data de emissão.';return null;}
  return {nome,cents,valor:(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),extenso:valorExtenso(cents),data,referencia};
 }
 function textoRecibo(v){
  return 'Eu, Franciele Boff de Lima, psicóloga, registro profissional 07/42161, inscrita no RG 8103354919 SSP/RS, recebi de '+v.nome+', a importância de '+v.valor+' ('+v.extenso+')'+(v.referencia?', referente a '+v.referencia.replace(/[.\s]+$/,''):'')+'.';
 }
 function desenharPrevia(v){
  const a=$('reciboPrevia');a.style.display='block';
  a.innerHTML='<article style="box-sizing:border-box;background:#fff;color:#111;width:210mm;min-height:297mm;margin:0 auto;padding:10mm 25mm 18mm;font:12pt/1.65 Arial,sans-serif;position:relative">'
   +'<div style="height:40mm;text-align:center"><img style="max-width:100%;height:33mm;object-fit:contain" src="assets/logo-documentos-recortado.svg" alt="Franciele Boff"></div>'
   +'<h3 style="text-align:center;margin:4mm 0 25mm;font-size:12pt">RECIBO</h3>'
   +'<p style="text-align:justify">'+escape(textoRecibo(v))+'</p>'
   +'<p style="margin-top:20mm">Caxias do Sul, '+escape(dataExtenso(v.data))+'.</p>'
   +'<div style="text-align:center;margin-top:19mm"><img src="assets/assinatura-franciele.svg" style="width:52mm" alt="Assinatura e carimbo"></div>'
   +'<div style="position:absolute;bottom:7mm;left:0;right:0;border-top:1px solid #197268;text-align:center;font-size:8pt;line-height:1.5;padding:7px 10mm 0">Rua: Guerino Sanvitto 704, sala 518 - Bairro Sanvitto – Caxias do Sul/RS<br>Fone: (54) 9 9911-0558 (whatsapp) – psicofranboffdelima@gmail.com</div></article>';
 }
 function carregarImagem(src){return new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Imagem do recibo indisponível.'));i.src=src;});}
 function imagemPng(i){const c=document.createElement('canvas');c.width=i.naturalWidth*2;c.height=i.naturalHeight*2;c.getContext('2d').drawImage(i,0,0,c.width,c.height);return c.toDataURL('image/png');}
 async function pdfRecibo(v){
  const JsPDF=window.jspdf?.jsPDF;if(!JsPDF)throw Error('Biblioteca de PDF não carregada.');
  const pdf=new JsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  const [logo,sign]=await Promise.all([carregarImagem('assets/logo-documentos-recortado.svg'),carregarImagem('assets/assinatura-franciele.svg')]);
  const marca=imagemPng(logo),assinatura=imagemPng(sign);
  function decoracao(){
   pdf.addImage(marca,'PNG',31,9,148,40);
   pdf.setDrawColor(22,111,103);pdf.setLineWidth(.45);pdf.line(0,278,210,278);
   pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(15,15,15);
   pdf.text('Rua: Guerino Sanvitto 704, sala 518 - Bairro Sanvitto - Caxias do Sul/RS',105,285,{align:'center'});
   pdf.text('Fone: (54) 9 9911-0558 (whatsapp) - psicofranboffdelima@gmail.com',105,289,{align:'center'});
  }
  let y=0,numero=0;
  function pagina(){if(numero)pdf.addPage();numero++;decoracao();y=69;pdf.setFont('helvetica','bold');pdf.setFontSize(12);pdf.text('RECIBO',105,y,{align:'center'});y=96;}
  pagina();pdf.setFont('helvetica','normal');pdf.setFontSize(11);
  const linhas=pdf.splitTextToSize(textoRecibo(v),153);
  for(const linha of linhas){if(y>236){pagina();pdf.setFont('helvetica','normal');pdf.setFontSize(11);}pdf.text(linha,29,y);y+=7;}
  y+=24;
  if(y>243){pagina();}
  pdf.text('Caxias do Sul, '+dataExtenso(v.data)+'.',29,y);
  let assinaturaY=Math.max(y+16,181);
  if(assinaturaY>231){pagina();assinaturaY=170;}
  pdf.addImage(assinatura,'PNG',77,assinaturaY,56,39);
  return pdf.output('blob');
 }
 window.abrirGeradorRecibo=async()=>{
  mostrarTela('documentos');
  $('docTermoContainer').style.display='none';$('geradorDocumentosClinicos').style.display='none';$('geradorRecibo').style.display='block';
  const agora=new Date();$('reciboData').value=[agora.getFullYear(),String(agora.getMonth()+1).padStart(2,'0'),String(agora.getDate()).padStart(2,'0')].join('-');
  $('reciboAviso').textContent='';$('reciboPrevia').style.display='none';
  try{const {data,error}=await bancoDados.from('pacientes').select('nome').order('nome');if(error)throw error;$('docPacientesSugestoes').innerHTML=(data||[]).map(p=>'<option value="'+escape(p.nome)+'"></option>').join('');}catch(e){console.warn('Sugestões indisponíveis',e);}
 };
 window.visualizarRecibo=()=>{const v=dados();if(!v)return;desenharPrevia(v);$('reciboAviso').textContent='Confira o recibo antes de gerar o arquivo.';};
 window.gerarRecibo=async(compartilhar)=>{
  const v=dados();if(!v)return;
  $('reciboAviso').textContent='Gerando recibo...';
  try{
   const blob=await pdfRecibo(v);
   const nome='Recibo-'+v.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9 -]/g,'').trim().replace(/\s+/g,'-')+'-'+v.data+'.pdf';
   const arquivo=new File([blob],nome,{type:'application/pdf'});
   if(compartilhar&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[arquivo]}))){
    try{await navigator.share({files:[arquivo],title:'Recibo'});$('reciboAviso').textContent='Compartilhamento iniciado.';return;}catch(e){if(e.name==='AbortError'){$('reciboAviso').textContent='Compartilhamento cancelado.';return;}}
   }
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
   $('reciboAviso').textContent=compartilhar?'PDF baixado. Você pode anexá-lo ao WhatsApp.':'Recibo gerado em PDF.';
  }catch(e){console.error(e);$('reciboAviso').textContent='Erro ao gerar recibo: '+e.message;}
 };
})();