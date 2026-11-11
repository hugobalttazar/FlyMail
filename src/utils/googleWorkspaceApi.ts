/**
 * FlyMail - Google Workspace API Integration
 * Métodos oficiais para comunicação com Gmail, Google Drive, Google Docs,
 * Google Calendar e Google People (Contatos).
 */

import { getGoogleAccessToken } from './googleAuth';
import { CalendarEvent, Contact, DriveFile, EmailThread } from '../types/mail';

/**
 * Utilitário para codificar mensagem MIME em Base64 compatível com o endpoint send do Gmail (RFC 2822)
 */
function createMimeMessage(to: string, from: string, subject: string, bodyText: string): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
  ];
  const message = messageParts.join('\r\n');
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/* =========================================================================
 * 1. GMAIL API: Envio e Leitura Real
 * ========================================================================= */

/**
 * Envia um e-mail de verdade através da API oficial do Gmail
 */
export async function sendGmailMessage(
  to: string,
  fromEmail: string,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = getGoogleAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Token do Google OAuth não encontrado. Conecte sua conta do Google para enviar.',
    };
  }

  try {
    const raw = createMimeMessage(to, fromEmail, subject, body);
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro HTTP ${response.status} ao despachar e-mail`);
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('[Gmail API] Erro no envio:', err);
    return { success: false, error: err.message || 'Falha na comunicação com o Gmail' };
  }
}

/**
 * Busca a lista de mensagens recentes da caixa de entrada do Gmail
 */
export async function fetchGmailInbox(maxResults: number = 10): Promise<any[]> {
  const token = getGoogleAccessToken();
  if (!token) return [];

  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=label:INBOX`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) return [];
    const listData = await listRes.json();
    const messages = listData.messages || [];

    // Detalha cada mensagem
    const detailed = await Promise.all(
      messages.slice(0, 8).map(async (m: { id: string }) => {
        try {
          const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.ok ? await res.json() : null;
        } catch {
          return null;
        }
      })
    );

    return detailed.filter(Boolean);
  } catch (err) {
    console.error('[Gmail API] Erro ao buscar inbox:', err);
    return [];
  }
}

/* =========================================================================
 * 2. GOOGLE CALENDAR API: Eventos Reais
 * ========================================================================= */

export async function fetchGoogleCalendarEvents(): Promise<CalendarEvent[]> {
  const token = getGoogleAccessToken();
  if (!token) return [];

  try {
    const timeMin = new Date().toISOString();
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
      )}&maxResults=15&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any, i: number) => ({
      id: item.id || `gcal_${Date.now()}_${i}`,
      title: item.summary || 'Compromisso sem título',
      time: item.start?.dateTime
        ? new Date(item.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : 'Dia inteiro',
      duration: '60 min',
      date: item.start?.dateTime
        ? item.start.dateTime.split('T')[0]
        : item.start?.date || new Date().toISOString().split('T')[0],
      location: item.location,
      color: '#0284C7',
      category: 'work' as const,
    }));
  } catch (err) {
    console.error('[Calendar API] Erro ao buscar eventos:', err);
    return [];
  }
}

/* =========================================================================
 * 3. GOOGLE PEOPLE API: Contatos Reais
 * ========================================================================= */

export async function fetchGoogleContacts(): Promise<Contact[]> {
  const token = getGoogleAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos,organizations,phoneNumbers&pageSize=30',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const connections = data.connections || [];

    return connections
      .map((c: any) => {
        const name = c.names?.[0]?.displayName;
        const email = c.emailAddresses?.[0]?.value;
        if (!name && !email) return null;
        return {
          id: c.resourceName || `c_${Math.random()}`,
          name: name || email.split('@')[0],
          email: email || '',
          avatar: c.photos?.[0]?.url,
          role: c.organizations?.[0]?.title,
          company: c.organizations?.[0]?.name,
          phone: c.phoneNumbers?.[0]?.value,
        };
      })
      .filter(Boolean) as Contact[];
  } catch (err) {
    console.error('[People API] Erro ao buscar contatos:', err);
    return [];
  }
}

/* =========================================================================
 * 4. GOOGLE DRIVE & GOOGLE DOCS API: Arquivos e Documentos
 * ========================================================================= */

export async function fetchDriveFiles(): Promise<DriveFile[]> {
  const token = getGoogleAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,iconLink,webViewLink,thumbnailLink,modifiedTime,size,owners,shared)&q=trashed = false',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('[Drive API] Erro ao buscar arquivos:', err);
    return [];
  }
}

export async function createGoogleDoc(title: string): Promise<{ id: string; webViewLink?: string } | null> {
  const token = getGoogleAccessToken();
  if (!token) return null;

  try {
    // Cria um arquivo do tipo Google Docs via Drive API
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title || 'Novo Documento FlyMail',
        mimeType: 'application/vnd.google-apps.document',
      }),
    });

    if (!res.ok) return null;
    const file = await res.json();
    return {
      id: file.id,
      webViewLink: `https://docs.google.com/document/d/${file.id}/edit`,
    };
  } catch (err) {
    console.error('[Docs API] Erro ao criar documento:', err);
    return null;
  }
}

export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = getGoogleAccessToken();
  if (!token) return false;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.error('[Drive API] Erro ao excluir arquivo:', err);
    return false;
  }
}
