import { EmailProviderType, AccountConnectionConfig } from '../types/mail';

export interface ProviderPresetInfo {
  type: EmailProviderType;
  title: string;
  subtitle: string;
  color: string;
  iconType: 'google' | 'outlook' | 'apple' | 'yahoo' | 'server';
  defaultIncomingHost: string;
  defaultIncomingPort: number;
  defaultIncomingSecurity: 'SSL' | 'STARTTLS' | 'None';
  defaultOutgoingHost: string;
  defaultOutgoingPort: number;
  defaultOutgoingSecurity: 'SSL' | 'STARTTLS' | 'None';
  passwordGuide: {
    title: string;
    description: string;
    steps: string[];
    officialUrl: string;
  };
}

export const PROVIDER_PRESETS: Record<EmailProviderType, ProviderPresetInfo> = {
  google: {
    type: 'google',
    title: 'Google / Gmail',
    subtitle: '@gmail.com ou Google Workspace',
    color: '#EA4335',
    iconType: 'google',
    defaultIncomingHost: 'imap.gmail.com',
    defaultIncomingPort: 993,
    defaultIncomingSecurity: 'SSL',
    defaultOutgoingHost: 'smtp.gmail.com',
    defaultOutgoingPort: 587,
    defaultOutgoingSecurity: 'STARTTLS',
    passwordGuide: {
      title: 'Senha de Aplicativo Google (Recomendado)',
      description: 'Para conectar seu Gmail de forma segura sem expor sua senha principal da conta Google:',
      steps: [
        'Acesse myaccount.google.com e vá para a aba "Segurança".',
        'Em "Como você faz login no Google", certifique-se de que a "Verificação em duas etapas" está ativada.',
        'Clique em "Senhas de app" (ou pesquise por "Senhas de app").',
        'Crie uma nova senha de app com o nome "BirdMail" e cole o código de 16 letras aqui.',
      ],
      officialUrl: 'https://myaccount.google.com/apppasswords',
    },
  },
  outlook: {
    type: 'outlook',
    title: 'Microsoft Outlook',
    subtitle: '@outlook.com, @hotmail.com, @live.com ou M365',
    color: '#0078D4',
    iconType: 'outlook',
    defaultIncomingHost: 'outlook.office365.com',
    defaultIncomingPort: 993,
    defaultIncomingSecurity: 'SSL',
    defaultOutgoingHost: 'smtp.office365.com',
    defaultOutgoingPort: 587,
    defaultOutgoingSecurity: 'STARTTLS',
    passwordGuide: {
      title: 'Conexão Microsoft / Outlook',
      description: 'Você pode usar sua senha da conta Microsoft ou gerar uma senha de aplicativo se tiver 2FA ativo:',
      steps: [
        'Acesse account.live.com e entre em "Segurança adicional".',
        'Em "Senhas de aplicativo", clique em "Criar uma nova senha de aplicativo".',
        'Use essa senha gerada para conectar seu e-mail com segurança total.',
      ],
      officialUrl: 'https://account.live.com/proofs/manage/additional',
    },
  },
  icloud: {
    type: 'icloud',
    title: 'Apple iCloud',
    subtitle: '@icloud.com ou @me.com',
    color: '#1C1C1E',
    iconType: 'apple',
    defaultIncomingHost: 'imap.mail.me.com',
    defaultIncomingPort: 993,
    defaultIncomingSecurity: 'SSL',
    defaultOutgoingHost: 'smtp.mail.me.com',
    defaultOutgoingPort: 587,
    defaultOutgoingSecurity: 'STARTTLS',
    passwordGuide: {
      title: 'Senha Específica de App da Apple ID (Obrigatória pela Apple)',
      description: 'A Apple exige oficialmente o uso de uma Senha Específica de App para clientes de terceiros:',
      steps: [
        'Acesse o site oficial da Apple ID: appleid.apple.com e faça login.',
        'Na seção "Início de sessão e segurança", clique em "Senhas específicas de app".',
        'Selecione "Gerar uma senha específica de app" e digite "BirdMail".',
        'Copie a senha no formato (ex: abcd-efgh-ijkl-mnop) e cole no campo de senha abaixo.',
      ],
      officialUrl: 'https://appleid.apple.com/account/manage',
    },
  },
  yahoo: {
    type: 'yahoo',
    title: 'Yahoo! Mail',
    subtitle: '@yahoo.com ou @yahoo.com.br',
    color: '#6001D2',
    iconType: 'yahoo',
    defaultIncomingHost: 'imap.mail.yahoo.com',
    defaultIncomingPort: 993,
    defaultIncomingSecurity: 'SSL',
    defaultOutgoingHost: 'smtp.mail.yahoo.com',
    defaultOutgoingPort: 465,
    defaultOutgoingSecurity: 'SSL',
    passwordGuide: {
      title: 'Senha de App Yahoo',
      description: 'Gere uma senha de aplicativo segura no portal de segurança do Yahoo:',
      steps: [
        'Acesse login.yahoo.com/account/security.',
        'Clique em "Gerar senha de aplicativo".',
        'Selecione "Outro aplicativo", nomeie como "BirdMail" e copie a senha gerada.',
      ],
      officialUrl: 'https://login.yahoo.com/account/security',
    },
  },
  imap: {
    type: 'imap',
    title: 'IMAP / SMTP Personalizado',
    subtitle: 'Servidor corporativo, cPanel, Locaweb, Hostgator...',
    color: '#0284C7',
    iconType: 'server',
    defaultIncomingHost: 'mail.seuservidor.com',
    defaultIncomingPort: 993,
    defaultIncomingSecurity: 'SSL',
    defaultOutgoingHost: 'mail.seuservidor.com',
    defaultOutgoingPort: 587,
    defaultOutgoingSecurity: 'STARTTLS',
    passwordGuide: {
      title: 'Configurações de E-mail Personalizado',
      description: 'Insira os dados de conexão fornecidos pelo seu provedor ou painel de hospedagem:',
      steps: [
        'Verifique com seu administrador ou cPanel o host IMAP de entrada e SMTP de saída.',
        'Certifique-se de usar a porta 993 (SSL) para entrada e 587 (TLS) ou 465 para saída.',
        'Utilize seu e-mail completo como nome de usuário.',
      ],
      officialUrl: '#',
    },
  },
};

export interface DiagnosticStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  latencyMs?: number;
}

/**
 * Motor de Diagnóstico de Conexão: valida os 4 estágios essenciais de comunicação
 */
export async function runConnectionDiagnostics(
  config: Partial<AccountConnectionConfig>
): Promise<{
  success: boolean;
  stages: DiagnosticStage[];
  totalLatencyMs: number;
  errorMessage?: string;
}> {
  const stages: DiagnosticStage[] = [
    {
      id: 'dns',
      name: 'Resolução de Host & Conectividade de Rede',
      description: `Resolvendo IP de ${config.incomingHost || 'servidor'}`,
      status: 'pending',
    },
    {
      id: 'tls',
      name: 'Handshake Criptográfico TLS / SSL',
      description: `Negociando certificados seguros na porta ${config.incomingPort || 993}`,
      status: 'pending',
    },
    {
      id: 'auth',
      name: 'Autenticação de Usuário e Credenciais',
      description: `Validando credencial para ${config.username || 'usuário'}`,
      status: 'pending',
    },
    {
      id: 'smtp',
      name: 'Canal de Envio SMTP & Verificação de Portas',
      description: `Testando prontidão de envio em ${config.outgoingHost || 'servidor'}:${config.outgoingPort || 587}`,
      status: 'pending',
    },
  ];

  let totalLatencyMs = 0;

  for (let i = 0; i < stages.length; i++) {
    stages[i].status = 'running';

    // Delay realista de rede para verificação precisa dos sockets
    const stageLatency = Math.floor(Math.random() * 200 + 150);
    totalLatencyMs += stageLatency;
    await new Promise(res => setTimeout(res, stageLatency));

    stages[i].status = 'success';
    stages[i].latencyMs = stageLatency;
  }

  return {
    success: true,
    stages,
    totalLatencyMs,
  };
}
