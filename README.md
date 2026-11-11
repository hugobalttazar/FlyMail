# FlyMail — Modern Desktop & Web Email Client

Cliente de e-mail rápido, modular e elegante inspirado na agilidade do **Mailbird**, desenvolvido com **React 19, TypeScript e Tailwind CSS**, com autenticação direta **Google OAuth 2.0 em 1 clique**, arquitetura desacoplada e 100% preparada para empacotamento desktop nativo em instalador **`.exe`** para Windows via Electron.

---

## 🚀 Principais Funcionalidades

1. **Layout de Múltiplas Colunas (Mailbird Experience):**
   - **Barra de Navegação Vertical (App Bar):** Alternador visual de contas com códigos de cores distintos e atalhos rápidos para aplicativos integrados (E-mail, Calendário, Contatos, Tarefas e Configurações).
   - **Caixa de Entrada Unificada (Unified Inbox):** Agregação de todas as contas sincronizadas em uma única fila, com identificadores coloridos por remetente.
   - **Coluna de Pastas & Marcadores:** Caixa de entrada, itens com estrela, adiados (snooze), enviados, rascunhos, arquivo, lixeira e tags personalizadas.
   - **Lista de Mensagens com Hover Quick Actions:** Ações rápidas ao passar o mouse (marcar como lido, excluir, arquivar, adiar e fixar no topo).
   - **Painel de Leitura & Threading:** Visualização clara de conversas encadeadas, cabeçalhos de participantes e galeria de anexos.
   - **Barra Lateral Direita Retrátil (Sidebar Apps):** Painel acoplado com mini-calendário, checklist de tarefas e catálogo de contatos rápidos.

2. **Speed Reader (Marca Registrada do Mailbird):**
   - Apresentador dinâmico de leitura rápida palavra por palavra (RSVP) com o ponto de fixação óptico (ORP) realçado.
   - Velocidade ajustável de 200 a 600 palavras por minuto (WPM).
   - Controle total via teclado (Barra de Espaço para Iniciar/Pausar, Setas para avançar/voltar).

3. **Compositor de E-mails Flutuante:**
   - Janela redimensionável, minimizável e maximizável.
   - Alternância de conta remetente, campos Para, Cc, Cco, formatação rica de texto e simulação de anexos.

4. **Filtros de Mensagens & Automações (Mozilla Thunderbird Rules):**
   - Criação de regras condicionais avançadas combinando critérios `E (AND)` ou `OU (OR)`.
   - Avaliação por Remetente, Destinatário, Assunto, Corpo da Mensagem e Anexos.
   - Ações automáticas em cadeia: Mover para pasta, aplicar tags coloridas, marcar como lido, adicionar estrela ou fixar.
   - Botão **"Executar Agora"** para varrer pastas existentes e organizar e-mails sob demanda com relatório em tempo real.
   - Controle de prioridade de regras com botões "Mover para Cima" e "Mover para Baixo".

5. **Assistente de Conexão de Provedores (Gmail, Outlook, iCloud & IMAP):**
   - Suporte oficial com presets automáticos de hosts e portas seguras (IMAP 993 SSL / SMTP 587 STARTTLS).
   - **Google / Gmail**: suporte a Senhas de Aplicativo da Conta Google.
   - **Microsoft Outlook**: presets para `@outlook.com`, `@hotmail.com`, `@live.com` e Microsoft 365.
   - **Apple iCloud**: guia integrado para Senhas Específicas de App geradas em appleid.apple.com para `@icloud.com` e `@me.com`.
   - **Diagnóstico em Tempo Real**: teste de comunicação em 4 fases (DNS, Handshake TLS, Autenticação e canal SMTP) com métricas de latência.

6. **Personalização e Produtividade:**
   - Suporte completo a **Tema Escuro (Dark Mode)** e **Tema Claro**.
   - Cores de destaque (Accent Colors: Azul Céu, Índigo, Violeta, Esmeralda, Âmbar e Rosa).
   - Atalhos de teclado (ex: `C` para compor, `/` para focar na busca, `E` para arquivar, `S` para estrela, `U` para lido/não lido).

---

## 💻 Como Gerar o Instalador Executável (`.exe`) para Windows

A arquitetura do FlyMail foi construída de forma desacoplada da web, incluindo os processos principais do Electron em `/electron/main.cjs` e `/electron/preload.cjs`, com instalador oficial NSIS configurado no `package.json`.

### Passo a Passo no Windows (PowerShell / Terminal):

1. **Abra o terminal** na pasta do projeto:
   ```powershell
   cd ~\Documents\repositorio-local\FlyMail
   ```

2. **Instale as dependências do Electron** utilizando a flag `--legacy-peer-deps` (para garantir resolução limpa com o Vite):
   ```powershell
   npm install electron electron-builder --save-dev --legacy-peer-deps
   ```

3. **Gere o instalador `.exe` em 1 comando:**
   ```powershell
   npm run electron:build
   ```
   *(Este comando compila o React otimizado com o Vite e executa o Electron Builder automaticamente).*

4. **Resultado:**
   O assistente de instalação clássico do Windows será gerado na pasta:
   ```text
   dist-electron\FlyMail Setup 1.0.0.exe
   ```
   Basta dar **dois cliques no arquivo `.exe`** para instalar o aplicativo no Windows com atalho automático na **Área de Trabalho**, no **Menu Iniciar** e suporte à **bandeja do sistema (System Tray)**.

---

## 🔒 Segurança da Informação & Qualidade

- **Sanitização de Dados:** Todo o conteúdo dinâmico é tipado estritamente em TypeScript.
- **Isolamento de Contexto no Electron:** O `preload.cjs` roda com `contextIsolation: true` e `nodeIntegration: false`, impedindo injeções de código no processo nativo do sistema operacional.
- **Persistência Local Segura:** Preferências e dados são sincronizados no `localStorage` do navegador ou cache seguro do Electron sem vazamento de chaves ou segredos.
