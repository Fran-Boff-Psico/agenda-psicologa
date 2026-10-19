(function inicializarGeradoresClinicos(){
  let tipoAtual='atestado';
  const $=id=>document.getElementById(id);
  const texto=(v)=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dataPorExtenso=(iso)=>{const d=new Date(iso+'T12:00:00');return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(d);};
  const hora=(s)=>String(s||'').replace(':','h');
  function mensagem(s){$('docAviso').textContent=s;}
  window.abrirTermoCompromissoOriginal=window.abrirTermoCompromisso;
  window.abrirTermoCompromisso=function(){window.abrirTermoCompromissoOriginal();$('docTermoContainer').style.display='block';$('geradorDocumentosClinicos').style.display='none';};
  window.abrirGeradorDocumentoClinico=async function(tipo){
    tipoAtual=tipo;
    mostrarTela('documentos');
    $('docTermoContainer').style.display='none';
    $('geradorDocumentosClinicos').style.display='block';
    $('tituloGeradorClinico').textContent=tipo==='atestado'?'Atestado Psicológico':'Encaminhamento Psicológico para Avaliação Psiquiátrica';
    $('docCamposAtestado').style.display=tipo==='atestado'?'block':'none';
    $('docCamposEncaminhamento').style.display=tipo==='encaminhamento'?'block':'none';
    const hoje=new Date();const iso=[hoje.getFullYear(),String(hoje.getMonth()+1).padStart(2,'0'),String(hoje.getDate()).padStart(2,'0')].join('-');
    $('docData').value=iso;$('docDataAtendimento').value=iso;
    $('docVisualizacao').style.display='none'; mensagem('');
    try {
      const {data,error}=await bancoDados.from('pacientes').select('nome').order('nome');
      if(error) throw error;
      $('docPacientesSugestoes').innerHTML=(data||[]).map(p=>'<option value="'+texto(p.nome)+'"></option>').join('');
    }catch(e){console.warn('Sugestões de pacientes indisponíveis.',e);}
  };
  function verificar(){
    const nome=$('docPacienteNome').value.trim(), data=$('docData').value;
    if(!nome||!data){mensagem('Preencha o nome do paciente e a data do documento.');return null;}
    if(tipoAtual==='atestado'&&(!$('docDataAtendimento').value||!$('docHoraInicio').value||!$('docHoraFim').value)){mensagem('Preencha a data do atendimento e o período de ausência.');return null;}
    if(tipoAtual==='encaminhamento'&&!$('docRelatoClinico').value.trim()){mensagem('Preencha o relato clínico antes de gerar o encaminhamento.');return null;}
    if(tipoAtual==='atestado'&&$('docHoraFim').value<=$('docHoraInicio').value){mensagem('O horário final deve ser posterior ao inicial.');return null;}
    return {nome,data,atendimento:$('docDataAtendimento').value,inicio:$('docHoraInicio').value,fim:$('docHoraFim').value,relato:$('docRelatoClinico').value.trim()};
  }
  function montar(v){
    const titulo=tipoAtual==='atestado'?'Atestado Psicológico':'Encaminhamento Psicológico para Avaliação Psiquiátrica';
    const nome=texto(v.nome),extenso=dataPorExtenso(v.data);
    const corpo=tipoAtual==='atestado'
      ?'<p>Eu, <b>Franciele Boff de Lima</b>, psicóloga, inscrita no <b>CRP 07/42161</b>, atesto, para os devidos fins, que <b>'+nome+'</b> esteve em atendimento psicológico nesta data, <b>'+dataPorExtenso(v.atendimento)+'</b>, sendo necessária sua ausência de suas atividades no <b>período das '+hora(v.inicio)+' até '+hora(v.fim)+'</b>.</p>'
      :'<p>Eu, <b>Franciele Boff de Lima</b>, psicóloga, inscrita no <b>CRP 07/42161</b>, elaboro o presente encaminhamento psicológico com a finalidade de encaminhar a paciente <b>'+nome+'</b> para avaliação psiquiátrica, considerando os sinais e sintomas observados no decorrer do acompanhamento psicológico.</p>'
       +v.relato.split(/\n\s*\n/).map(p=>'<p>'+texto(p).replace(/\n/g,'<br>')+'</p>').join('')
       +'<p>Ressalta-se que o presente documento baseia-se nas observações clínicas realizadas durante o processo psicoterapêutico e nos relatos apresentados pela paciente, não possuindo caráter pericial nem tendo por finalidade estabelecer diagnóstico psiquiátrico.</p><p style="margin-top:28px">Coloco-me à disposição para eventuais esclarecimentos técnicos que se fizerem necessários.</p>';
    const header='<div style="display:flex;align-items:center;justify-content:center;gap:14px;height:105px"><img src="assets/logo Prontuário.png" style="width:110px;max-height:95px;object-fit:contain" crossorigin="anonymous"><div style="color:#346b68;text-align:left"><div style="font-size:34px;white-space:nowrap">Franciele Boff</div><div style="font-size:11px;text-align:center">Psicóloga | CRP 07/42161</div></div></div>';
    const style='font-family:Arial,sans-serif;color:#111;background:white;width:210mm;min-height:297mm;box-sizing:border-box;padding:10mm 23mm 19mm;position:relative;margin:0 auto;font-size:12pt;line-height:1.75';
    const assinatura='<div style="text-align:center;margin:55px auto 26px;break-inside:avoid"><img src="assets/assinatura-franciele.webp" style="width:174px;height:auto;max-height:120px;object-fit:contain" alt="Assinatura e carimbo de Franciele Boff de Lima"></div>';
    return '<article id="documentoClinicoPagina" style="'+style+'">'+header+'<h3 style="text-align:center;font-size:13pt;text-decoration:underline;line-height:1.2;margin:12px auto 44px;max-width:420px">'+titulo+'</h3><div style="text-align:justify;text-indent:28px">'+corpo+'</div><p style="margin:32px 0 0">Caxias do Sul, '+extenso+'.</p>'+assinatura+'<footer style="position:absolute;bottom:6mm;left:0;right:0;border-top:1.5px solid #176e65;padding:8px 15mm 0;text-align:center;font-size:8pt;line-height:1.5">Rua: General Arcy da Rocha Nóbrega 401, sala 501 - Bairro Madureira – Caxias do Sul/RS<br>Fone: (54) 9 9911-0558 (whatsapp) – psicofranboffdelima@gmail.com</footer></article>';
  }
  window.visualizarDocumentoClinico=function(){const v=verificar();if(!v)return;const box=$('docVisualizacao');box.innerHTML=montar(v);box.style.display='block';mensagem('Prévia atualizada. Confira o texto antes de gerar o PDF.');};
  window.gerarDocumentoClinico=async function(compartilhar){
    const v=verificar();if(!v)return;
    if(!window.html2pdf){mensagem('Não foi possível carregar o gerador de PDF. Verifique sua conexão e tente novamente.');return;}
    const area=$('docVisualizacao');area.innerHTML=montar(v);area.style.display='block';mensagem('Preparando o PDF...');
    const elemento=area.firstElementChild;
    try{
      await Promise.all([...elemento.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;})));
      if([...elemento.images].some(img=>!img.naturalWidth))throw new Error('Logo ou assinatura indisponível: confira os arquivos do modelo.');
      const blob=await window.html2pdf().set({margin:0,filename:'Documento.pdf',image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true,scrollY:0},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy']}}).from(elemento).outputPdf('blob');
      const nomeArquivo=(tipoAtual==='atestado'?'Atestado-':'Encaminhamento-')+v.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9 -]/g,'').trim().replace(/\s+/g,'-')+'-'+v.data+'.pdf';
      const arquivo=new File([blob],nomeArquivo,{type:'application/pdf'});
      if(compartilhar&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[arquivo]}))){
        try{await navigator.share({files:[arquivo],title:tipoAtual==='atestado'?'Atestado Psicológico':'Encaminhamento Psiquiátrico'});mensagem('Compartilhamento iniciado.');return;}
        catch(e){if(e.name==='AbortError'){mensagem('Compartilhamento cancelado.');return;}}
      }
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=nomeArquivo;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      mensagem(compartilhar?'PDF baixado. Anexe o arquivo à conversa no WhatsApp.':'PDF gerado. Abra o arquivo baixado para conferir antes de enviar.');
    }catch(e){console.error(e);mensagem('Não foi possível gerar o documento: '+e.message);}
  };
})();