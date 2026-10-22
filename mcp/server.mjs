import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const allowed = ['index.html', 'style.css', 'script.js', 'app.js', 'config.js'];
const server = new McpServer({ name: 'agenda-psicologa-diagnostico', version: '0.1.0' });
const response = data => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });

server.tool('agenda_status_codigo', 'Verifica arquivos locais permitidos, sem banco de dados nem dados de pacientes.', {}, async () =>
  response({ repositorio: 'Fran-Boff-Psico/agenda-psicologa', modo: 'somente leitura',
    arquivos: allowed.map(nome => { const caminho = resolve(root, nome); return {
      nome, existe: existsSync(caminho), bytes: existsSync(caminho) ? statSync(caminho).size : null
    }; }) })
);
server.tool('agenda_verificar_interface', 'Verificação estática do HTML da interface, sem acesso a pacientes.', {}, async () => {
  const caminho = resolve(root, 'index.html');
  if (!existsSync(caminho)) return response({ erro: 'index.html não encontrado' });
  const html = readFileSync(caminho, 'utf8');
  return response({
    supabaseJs: /supabase-js/i.test(html),
    financeiro: /contasReceber|contasPagar/.test(html),
    documentos: /abrirGeradorDocumentoClinico/.test(html),
    aviso: 'Apenas leitura de código, não verifica funcionamento real.'
  });
});
await server.connect(new StdioServerTransport());
