(function () {
  const pdfImage = src => new Promise((resolve,reject) => {
    const im = new Image();
    im.onload=()=>resolve(im);
    im.onerror=()=>reject(new Error('Não foi possível carregar a imagem do documento.'));
    im.src=src;
  });
  const canvasImage = (im,sx,sy,sw,sh,w=800) => {
    const canvas=document.createElement('canvas');
    canvas.width=w;canvas.height=Math.round(w*sh/sw);
    canvas.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/png');
  };
  const dataExtenso = date => {
    const d=new Date(date+'T12:00:00');
    return new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(d);
  };
  window.criarPdfClinicoPreciso=async (tipo,v) => {
    const JsPDF=window.jspdf?.jsPDF;
    if(!JsPDF)throw new Error('Biblioteca de PDF não carregada.');
    const pdf=new JsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
    const [marca,assinatura]=await Promise.all([
      pdfImage('assets/logo Prontuário.png'),
      pdfImage('assets/assinatura-franciele.svg')
    ]);
    const simbolo=canvasImage(marca,124,124,100,79,600);
    const carimbo=canvasImage(assinatura,0,0,assinatura.naturalWidth,assinatura.naturalHeight,700);
    const limiteX=182, margemX=29, largura=153;
    function cabecalho(){
      pdf.addImage(simbolo,'PNG',30,10,35,28);
      pdf.setTextColor(55,106,101);pdf.setFont('helvetica','normal');pdf.setFontSize(29);
      pdf.text('Franciele Boff',72,27);
      pdf.setFontSize(9);pdf.text('Psicóloga | CRP 07/42161',100,34);
      pdf.setTextColor(18,18,18);
    }
    function rodape(){
      pdf.setDrawColor(25,112,105);pdf.setLineWidth(.5);pdf.line(0,279,210,279);
      pdf.setFont('helvetica','normal');pdf.setFontSize(8);
      pdf.text('Rua: General Arcy da Rocha Nóbrega 401, sala 501 - Bairro Madureira - Caxias do Sul/RS',105,285,{align:'center'});
      pdf.text('Fone: (54) 9 9911-0558 (whatsapp) - psicofranboffdelima@gmail.com',105,289,{align:'center'});
    }
    let y=0;
    function novaPagina(){
      if(pdf.getNumberOfPages()>1||y>0)pdf.addPage();
      cabecalho();rodape();y=63;
    }
    function paragrafo(texto,deslocamento=8){
      pdf.setFont('helvetica','normal');pdf.setFontSize(11);
      const linhas=pdf.splitTextToSize(texto,largura);
      for(const linha of linhas){
        if(y>246){novaPagina();}
        pdf.text(linha,margemX,y);y+=7;
      }
      y+=deslocamento;
    }
    function titulo(t){
      pdf.setFont('helvetica','bold');pdf.setFontSize(12);
      const linhas=pdf.splitTextToSize(t,145);
      linhas.forEach(linha=>{pdf.text(linha,105,y,{align:'center'});y+=6;});
      y+=13;
    }
    novaPagina();
    if(tipo==='atestado'){
      titulo('Atestado Psicológico');
      paragrafo('Eu, Franciele Boff de Lima, psicóloga, inscrita no CRP 07/42161, atesto, para os devidos fins, que '+v.nome+' esteve em atendimento psicológico nesta data, '+dataExtenso(v.atendimento)+', sendo necessária sua ausência de suas atividades no período das '+v.inicio.replace(':','h')+' até '+v.fim.replace(':','h')+'.',17);
      paragrafo('Caxias do Sul, '+dataExtenso(v.data)+'.');
      pdf.addImage(carimbo,'PNG',80,195,50,35);
    }else{
      titulo('Encaminhamento Psicológico para Avaliação Psiquiátrica');
      paragrafo('Eu, Franciele Boff de Lima, psicóloga, inscrita no CRP 07/42161, elaboro o presente encaminhamento psicológico com a finalidade de encaminhar a paciente '+v.nome+' para avaliação psiquiátrica, considerando os sinais e sintomas observados no decorrer do acompanhamento psicológico.');
      v.relato.split(/\n\s*\n/).filter(Boolean).forEach(p=>paragrafo(p.trim()));
      paragrafo('Ressalta-se que o presente documento baseia-se nas observações clínicas realizadas durante o processo psicoterapêutico e nos relatos apresentados pela paciente, não possuindo caráter pericial nem tendo por finalidade estabelecer diagnóstico psiquiátrico.');
      paragrafo('Coloco-me à disposição para eventuais esclarecimentos técnicos que se fizerem necessários.',12);
      paragrafo('Caxias do Sul, '+dataExtenso(v.data)+'.');
      if(y>233)novaPagina();
      pdf.addImage(carimbo,'PNG',80,Math.max(215,y+5),50,35);
    }
    return pdf.output('blob');
  };
})();