import React, { useState } from 'react';
import { Users, Search, Mail, Phone, Building, Plus, Star } from 'lucide-react';
import { Contact } from '../types/mail';

interface ContactsViewProps {
  contacts: Contact[];
  onComposeTo: (contact: Contact) => void;
  onAddContact: (contact: Partial<Contact>) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onComposeTo,
  onAddContact,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = contacts.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) ||
         c.email.toLowerCase().includes(search.toLowerCase()) ||
         (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onAddContact({ name: name.trim(), email: email.trim(), role, company, phone });
    setName('');
    setEmail('');
    setRole('');
    setCompany('');
    setPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-sky-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Catálogo de Contatos
          </h2>
          <span className="text-xs text-slate-400 font-medium">({contacts.length} contatos)</span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contato</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-6 pb-2 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, e-mail ou empresa..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                  {contact.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {contact.name}
                  </h3>
                  {contact.role && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {contact.role}
                    </p>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate mt-0.5">
                      <Building className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-xs border-t border-slate-100 dark:border-slate-800 pt-2 font-mono text-slate-600 dark:text-slate-400">
                <div className="truncate text-[11px]">{contact.email}</div>
                {contact.phone && <div className="text-[11px] text-slate-400">{contact.phone}</div>}
              </div>

              <button
                onClick={() => onComposeTo(contact)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar E-mail</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Adicionar Contato</h4>
            <form onSubmit={handleCreate} className="space-y-2.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Cargo / Função..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Empresa..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefone..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
