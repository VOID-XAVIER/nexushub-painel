import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useChat } from '../../contexts/ChatContext';
import { ClientQueue } from '../../components/chat/ClientQueue';
import { ChatConversation } from '../../components/chat/ChatConversation';
import { ClientPanel } from '../../components/chat/ClientPanel';
import { ProtocolSearch } from '../../components/chat/ProtocolSearch';

export default function MasterChats() {
  const { companies } = useData();
  const {
    clients,
    getClient,
    conversations,
    getMessagesByConversation,
    protocols,
    getProtocol,
    quickMessages,
  } = useChat();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [showProtocolSearch, setShowProtocolSearch] = useState(false);

  // Filter conversations by company
  const filteredConversations = useMemo(() => {
    if (selectedCompanyFilter === 'all') return conversations;
    return conversations.filter(c => c.companyId === selectedCompanyFilter);
  }, [conversations, selectedCompanyFilter]);

  // Filter protocols by company
  const filteredProtocols = useMemo(() => {
    if (selectedCompanyFilter === 'all') return protocols;
    return protocols.filter(p => p.companyId === selectedCompanyFilter);
  }, [protocols, selectedCompanyFilter]);

  // Get selected conversation
  const selectedConversation = selectedConversationId
    ? conversations.find(c => c.id === selectedConversationId)
    : null;

  // Get client for selected conversation
  const selectedClient = selectedConversation
    ? getClient(selectedConversation.clientId)
    : undefined;

  // Get messages for selected conversation
  const conversationMessages = selectedConversationId
    ? getMessagesByConversation(selectedConversationId)
    : [];

  // Get protocol for selected conversation
  const conversationProtocol = selectedConversation
    ? protocols.find(p => p.conversationId === selectedConversation.id)
    : undefined;

  // Get company name for display
  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Empresa';
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Conversas Globais</h1>
          <p className="text-gray-500 text-sm">Visualize atendimentos de todas as empresas</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Company Filter */}
          <select
            value={selectedCompanyFilter}
            onChange={(e) => {
              setSelectedCompanyFilter(e.target.value);
              setSelectedConversationId(null);
            }}
            className="bg-gray-800 border border-gray-700 rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowProtocolSearch(!showProtocolSearch)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              showProtocolSearch
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Protocolos
          </button>
        </div>
      </div>

      {/* Protocol Search Panel */}
      {showProtocolSearch && (
        <div className="mb-4">
          <ProtocolSearch
            protocols={filteredProtocols}
            getProtocol={getProtocol}
          />
        </div>
      )}

      {/* Stats Banner */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-gray-500 text-xs">Total Conversas</p>
          <p className="text-white text-xl font-bold">{filteredConversations.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-gray-500 text-xs">Aguardando</p>
          <p className="text-amber-400 text-xl font-bold">
            {filteredConversations.filter(c => c.status === 'waiting').length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-gray-500 text-xs">Em Atendimento</p>
          <p className="text-emerald-400 text-xl font-bold">
            {filteredConversations.filter(c => c.status === 'in_service').length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-gray-500 text-xs">Protocolos</p>
          <p className="text-purple-400 text-xl font-bold">{filteredProtocols.length}</p>
        </div>
      </div>

      {/* Main Chat Area - 3 Columns */}
      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-0 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 min-h-0">
        {/* Column 1: Client Queue */}
        <div className="flex flex-col">
          <ClientQueue
            conversations={filteredConversations}
            clients={clients}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            getClient={getClient}
          />
        </div>

        {/* Column 2: Conversation (Read-only) */}
        {selectedConversation ? (
          <div className="flex flex-col">
            {/* Company Badge */}
            <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20">
              <p className="text-purple-400 text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {getCompanyName(selectedConversation.companyId)}
              </p>
            </div>
            <div className="flex-1">
              <ChatConversation
                conversation={selectedConversation}
                client={selectedClient}
                messages={conversationMessages}
                quickMessages={quickMessages}
                currentUserId=""
                onSendMessage={() => {}}
                onAssignToMe={() => ({ success: false })}
                readOnly={true}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-950">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">Selecione uma conversa</p>
              <p className="text-gray-600 text-sm mt-1">para visualizar o atendimento</p>
            </div>
          </div>
        )}

        {/* Column 3: Client Panel (Read-only) */}
        {selectedConversation ? (
          <ClientPanel
            client={selectedClient}
            conversation={selectedConversation}
            protocol={conversationProtocol}
            onCreateProtocol={() => { throw new Error('Read only'); }}
            onUpdateProtocolStatus={() => {}}
            onUpdatePaymentStatus={() => {}}
            readOnly={true}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900 border-l border-gray-800">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Nenhum cliente<br/>selecionado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
