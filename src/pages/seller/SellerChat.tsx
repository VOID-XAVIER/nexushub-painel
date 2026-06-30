import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useChat } from '../../contexts/ChatContext';
import { ClientQueue } from '../../components/chat/ClientQueue';
import { ChatConversation } from '../../components/chat/ChatConversation';
import { ClientPanel } from '../../components/chat/ClientPanel';
import { ProtocolSearch } from '../../components/chat/ProtocolSearch';

export default function SellerChat() {
  const { user } = useAuth();
  const { users } = useData();
  const {
    clients,
    getClient,
    conversations,
    getConversationsByCompany,
    assignConversation,
    closeConversation,
    getMessagesByConversation,
    sendMessage,
    protocols,
    getProtocol,
    getProtocolsByCompany,
    createProtocol,
    updateProtocolStatus,
    updatePaymentStatus,
    quickMessages,
  } = useChat();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showProtocolSearch, setShowProtocolSearch] = useState(false);

  const currentUserData =
    users.find(u => u.id === user?.id) ||
    users.find(u => u.email === user?.email);

  const companyId = currentUserData?.companyId;

  const companyConversations = useMemo(() => {
    if (!companyId) return [];
    return getConversationsByCompany(companyId);
  }, [companyId, getConversationsByCompany, conversations]);

  const companyProtocols = useMemo(() => {
    if (!companyId) return [];
    return getProtocolsByCompany(companyId);
  }, [companyId, getProtocolsByCompany, protocols]);

  const selectedConversation = selectedConversationId
    ? conversations.find(c => c.id === selectedConversationId)
    : null;

  const selectedClient = selectedConversation
    ? getClient(selectedConversation.clientId)
    : undefined;

  const conversationMessages = selectedConversationId
    ? getMessagesByConversation(selectedConversationId)
    : [];

  const conversationProtocol = selectedConversation
    ? protocols.find(p => p.conversationId === selectedConversation.id)
    : undefined;

  // Sincronização e logs de depuração para verificar integridade do ChatContext
  useEffect(() => {
    if (selectedConversation) {
      console.log('🔍 [DEBUG ATUALIZADO] SellerChat:', {
        currentUserId: currentUserData?.id,
        conversationId: selectedConversation.id,
        status: selectedConversation.status,
        sellerIdDaConversa: selectedConversation.sellerId,
        totalMensagensCarregadas: conversationMessages.length,
        listaMensagens: conversationMessages
      });
    }
  }, [selectedConversation, currentUserData, conversationMessages]);

  const handleSendMessage = (content: string) => {
    if (selectedConversationId && currentUserData) {
      sendMessage(selectedConversationId, currentUserData.id, 'seller', content);
    }
  };

  const handleAssignToMe = () => {
    if (selectedConversationId && currentUserData) {
      return assignConversation(selectedConversationId, currentUserData.id);
    }
    return { success: false, error: 'Sessão inválida para atribuição.' };
  };

  const handleCloseConversation = (reason: 'venda' | 'sem_retorno' | 'encerrado') => {
    if (!selectedConversationId) return;
    closeConversation(selectedConversationId);
    setSelectedConversationId(null);
    if (conversationProtocol) {
      updateProtocolStatus(conversationProtocol.code, 'encerrado');
    }
    console.log(`Atendimento encerrado localmente via painel. Motivo: ${reason}`);
  };

  const handleCreateProtocol = () => {
    if (!selectedConversation || !selectedClient || !currentUserData || !companyId) {
      throw new Error('Missing required data');
    }
    const product = selectedConversation.desiredProduct
      ? `${selectedConversation.desiredProduct.model} ${selectedConversation.desiredProduct.color} - ${selectedConversation.desiredProduct.size}`
      : 'Não especificado';

    return createProtocol({
      conversationId: selectedConversation.id,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientCpf: selectedClient.cpf,
      product,
      sellerId: currentUserData.id,
      companyId,
    });
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Chat de Atendimento</h1>
          <p className="text-gray-500 text-sm">Gerencie seus atendimentos em tempo real</p>
        </div>
        <button
          onClick={() => setShowProtocolSearch(!showProtocolSearch)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            showProtocolSearch
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Protocolos
        </button>
      </div>

      {showProtocolSearch && (
        <div className="mb-4">
          <ProtocolSearch protocols={companyProtocols} getProtocol={getProtocol} />
        </div>
      )}

      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-0 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 min-h-0">
        <ClientQueue
          conversations={companyConversations}
          clients={clients}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          getClient={getClient}
        />

        {selectedConversation ? (
          <ChatConversation
            conversation={selectedConversation}
            client={selectedClient}
            messages={conversationMessages}
            quickMessages={quickMessages}
            currentUserId={currentUserData?.id || ''}
            onSendMessage={handleSendMessage}
            onAssignToMe={handleAssignToMe}
            onCloseConversation={handleCloseConversation}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-950">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">Selecione uma conversa</p>
              <p className="text-gray-600 text-sm mt-1">para iniciar o atendimento</p>
            </div>
          </div>
        )}

        {selectedConversation ? (
          <ClientPanel
            client={selectedClient}
            conversation={selectedConversation}
            protocol={conversationProtocol}
            onCreateProtocol={handleCreateProtocol}
            onUpdateProtocolStatus={(status) => conversationProtocol && updateProtocolStatus(conversationProtocol.code, status)}
            onUpdatePaymentStatus={(status) => conversationProtocol && updatePaymentStatus(conversationProtocol.code, status)}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900 border-l border-gray-800">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Nenhum cliente<br />selecionado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}