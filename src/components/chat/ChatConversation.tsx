import { useState, useRef, useEffect } from 'react';
import { Message, Client, Conversation, QuickMessage } from '../../types/chat';

interface ChatConversationProps {
  conversation: Conversation;
  client: Client | undefined;
  messages: Message[];
  quickMessages: QuickMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onAssignToMe: () => { success: boolean; error?: string };
  onCloseConversation?: (reason: 'venda' | 'sem_retorno' | 'encerrado') => void;
  readOnly?: boolean;
}

export function ChatConversation({
  conversation,
  client,
  messages = [], // Fallback para não quebrar o .map se vier nulo
  quickMessages = [],
  currentUserId,
  onSendMessage,
  onAssignToMe,
  onCloseConversation,
  readOnly = false,
}: ChatConversationProps) {
  const [inputValue, setInputValue] = useState('');
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [showCloseMenu, setShowCloseMenu] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !readOnly) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickMessage = (text: string) => {
    if (!readOnly) {
      onSendMessage(text);
      setShowQuickMessages(false);
    }
  };

  const isWaitingOrBot = conversation?.status === 'waiting' || conversation?.status === 'bot';
  const isInService = conversation?.status === 'in_service';
  const canSendMessages = isInService && conversation?.sellerId === currentUserId && !readOnly;
  const canClose = isInService && conversation?.sellerId === currentUserId && !readOnly;

  // Formatação segura da hora da mensagem para evitar o crash do RangeError
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 relative">

      {/* Toast de erro */}
      {assignError && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {assignError}
        </div>
      )}

      {/* Header com validações anti-crash */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium">
            {client?.name ? client.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-white font-medium">{client?.name || 'Cliente Anonimizado'}</p>
            <p className="text-gray-500 text-sm">{client?.phone || 'Sem número'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Assumir Atendimento */}
          {isWaitingOrBot && !readOnly && (
            <button
              onClick={() => {
                const result = onAssignToMe();
                if (!result.success && result.error) {
                  setAssignError(result.error);
                  setTimeout(() => setAssignError(null), 3000);
                }
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Assumir Atendimento
            </button>
          )}

          {/* Botão Finalizar com dropdown */}
          {canClose && onCloseConversation && (
            <div className="relative">
              <button
                onClick={() => setShowCloseMenu(!showCloseMenu)}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/30 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Finalizar
              </button>

              {showCloseMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <p className="text-gray-400 text-xs font-semibold uppercase px-4 pt-3 pb-1">
                    Motivo do encerramento
                  </p>
                  <button
                    onClick={() => { onCloseConversation('venda'); setShowCloseMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Venda Concluída
                  </button>
                  <button
                    onClick={() => { onCloseConversation('sem_retorno'); setShowCloseMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-amber-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sem Retorno
                  </button>
                  <button
                    onClick={() => { onCloseConversation('encerrado'); setShowCloseMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:bg-gray-700 flex items-center gap-2 transition-colors border-t border-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Encerrar sem motivo
                  </button>
                </div>
              )}
            </div>
          )}

          {readOnly && (
            <span className="text-gray-500 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Somente visualização
            </span>
          )}
        </div>
      </div>

      {/* Área de mensagens tratada com segurança */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-sm">Nenhuma mensagem histórica sincronizada</p>
          </div>
        )}
        {messages.map((msg) => {
          if (!msg) return null;
          const isClient = msg.senderType === 'client';
          const isBot = msg.senderType === 'bot';

          return (
            <div key={msg.id || Math.random().toString()} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  isClient
                    ? 'bg-gray-800 text-white rounded-bl-md'
                    : isBot
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-emerald-600 text-white rounded-br-md'
                }`}
              >
                {isBot && (
                  <p className="text-blue-200 text-xs font-medium mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Bot
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.content || ''}</p>
                <p className={`text-xs mt-1 text-right ${isClient ? 'text-gray-500' : isBot ? 'text-blue-200' : 'text-emerald-200'}`}>
                  {formatMessageTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Mensagens rápidas */}
      {showQuickMessages && canSendMessages && (
        <div className="px-6 pb-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-400 text-xs font-medium mb-2">MENSAGENS RÁPIDAS</p>
            <div className="flex flex-wrap gap-2">
              {quickMessages.map((qm) => (
                <button
                  key={qm.id}
                  onClick={() => handleQuickMessage(qm.text)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {qm.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input de envio com validação dinâmica do status */}
      <div className="px-6 py-4 bg-gray-900 border-t border-gray-800">
        {canSendMessages ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuickMessages(!showQuickMessages)}
              className={`p-2.5 rounded-xl transition-colors ${
                showQuickMessages
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Mensagens rápidas"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>

            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            {readOnly ? (
              <p className="text-gray-500 text-sm">Visualização somente leitura</p>
            ) : isWaitingOrBot ? (
              <p className="text-amber-400 text-sm font-medium">
                Vinculado ao Bot. Clique em <span className="underline font-bold">"Assumir Atendimento"</span> acima para carregar/responder.
              </p>
            ) : (
              <p className="text-gray-500 text-sm">Conversa encerrada ou sem atendente atribuído.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}