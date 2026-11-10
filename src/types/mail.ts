export type AppView = 'mail' | 'calendar' | 'contacts' | 'tasks' | 'settings';

export type ThemeAccent = 'blue' | 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose';

export type EmailProviderType = 'google' | 'outlook' | 'icloud' | 'yahoo' | 'imap';

export interface AccountConnectionConfig {
  providerType: EmailProviderType;
  incomingHost: string;
  incomingPort: number;
  incomingSecurity: 'SSL' | 'STARTTLS' | 'None';
  outgoingHost: string;
  outgoingPort: number;
  outgoingSecurity: 'SSL' | 'STARTTLS' | 'None';
  username: string;
  passwordOrToken?: string;
  syncIntervalMinutes?: number;
  isVerified?: boolean;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // Tailored color badge for unified inbox
  unreadCount: number;
  provider: EmailProviderType;
  isDefault?: boolean;
  connectionConfig?: AccountConnectionConfig;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'archive' | 'sheet' | 'doc' | 'code' | 'other';
  url?: string;
}

export interface EmailParticipant {
  name: string;
  email: string;
  avatar?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  accountId: string;
  from: EmailParticipant;
  to: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];
  date: string;
  timestamp: number;
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml?: string;
  isRead: boolean;
  isStarred: boolean;
  isPinned: boolean;
  isSnoozed: boolean;
  snoozedUntil?: string;
  folderId: string;
  tags: string[];
  attachments: EmailAttachment[];
}

export interface EmailThread {
  id: string;
  accountId: string;
  subject: string;
  snippet: string;
  participants: EmailParticipant[];
  lastMessageDate: string;
  lastMessageTimestamp: number;
  messageCount: number;
  isRead: boolean;
  isStarred: boolean;
  isPinned: boolean;
  isSnoozed: boolean;
  snoozedUntil?: string;
  folderId: string; // 'inbox', 'sent', 'drafts', 'archive', 'trash', 'spam', etc.
  tags: string[];
  hasAttachments: boolean;
  messages: EmailMessage[];
}

export interface Folder {
  id: string;
  name: string;
  iconName: string;
  unreadCount?: number;
  totalCount?: number;
  isSystem?: boolean;
  accountId?: string; // If null, applies to active or unified
}

export interface EmailTag {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  avatar?: string;
  favorite?: boolean;
  lastContacted?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  date: string; // YYYY-MM-DD
  location?: string;
  color: string;
  category: 'work' | 'personal' | 'meeting';
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  tag?: string;
}

export interface ComposeDraft {
  id?: string;
  fromAccountId: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: EmailAttachment[];
  scheduledTime?: string;
}

/* ============================================================
 * Thunderbird-Style Message Filters & Automated Rules Types
 * ============================================================ */

export type FilterConditionField = 'from' | 'to' | 'subject' | 'body' | 'hasAttachments';

export type FilterOperator = 'contains' | 'doesNotContain' | 'equals' | 'beginsWith' | 'endsWith';

export type FilterActionType = 
  | 'moveToFolder' 
  | 'applyTag' 
  | 'markAsRead' 
  | 'markAsStarred' 
  | 'markAsPinned' 
  | 'delete';

export interface FilterCondition {
  id: string;
  field: FilterConditionField;
  operator: FilterOperator;
  value: string;
}

export interface FilterAction {
  id: string;
  type: FilterActionType;
  targetFolderId?: string;
  targetTagId?: string;
}

export interface MessageFilter {
  id: string;
  name: string;
  enabled: boolean;
  matchMode: 'all' | 'any'; // 'all' = AND, 'any' = OR
  conditions: FilterCondition[];
  actions: FilterAction[];
  accountId?: string | null; // null means applies to all accounts / Unified Inbox
  lastRunTimestamp?: number;
}

