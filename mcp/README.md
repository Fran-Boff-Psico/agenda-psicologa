# MCP da Agenda Psicóloga — Franciele Boff

Repositório único: `Fran-Boff-Psico/agenda-psicologa`. Este MCP não usa contas, dados ou repositórios da TechDall.

## Situação
Implementação experimental em branch separada. Não está publicada nem ligada à interface de produção.
Servidor MCP local, transporte stdio, somente leitura de arquivos de código permitidos. Sem conexão com banco de dados, pacientes ou financeiro.

## Uso em computador com cliente MCP compatível
1. Instale Node.js 20+ e clone o repositório, selecionando esta branch.
2. Execute `cd mcp && npm install && npm run check`.
3. Configure seu cliente MCP com o caminho absoluto do arquivo `mcp/server.mjs`:
```json
{
  "mcpServers": {
    "agenda-psicologa-diagnostico": {
      "command": "node",
      "args": ["C:/caminho/agenda-psicologa/mcp/server.mjs"]
    }
  }
}
```
4. Reinicie o cliente e acione `agenda_status_codigo` ou `agenda_verificar_interface`.

O suporte e formato de configuração variam conforme o cliente MCP. O conector GitHub no ChatGPT é independente deste servidor.

**Segurança:** jamais configurar `service_role`, inserir tokens, prontuários ou dados pessoais no repositório. Ferramentas de dados exigirão autenticação/autorização próprias e avaliação LGPD. Não aplicar em produção sem testes e revisão.
