import { Conversation, Client } from '../../types/chat';

interface ClientQueueProps {
  conversations: Conversation[];
  clients: Client[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  getClient: (id: string) => Client | undefined;
}

const statusConfig = {
  bot: { label: 'Bot', color: 'bg-blue-500', textColor: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  waiting: { label: 'Aguardando', color: 'bg-amber-500', textColor: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  in_service: { label: 'Em atendimento', color: 'bg-emerald-500', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  closed: { label: 'Encerrado', color: 'bg-gray-500', textColor: 'text-gray-400', bgColor: 'bg-gray-500/10' },
};

export function ClientQueue({
  conversations,
  selectedConversationId,
  onSelectConversation,
  getClient,
}: ClientQueueProps) {
  const activeConversations = conversations.filter(c => c.status !== 'closed');
  
  const sortedConversations = [...activeConversations].sort((a, b) => {
    // Priority: waiting > in_service > bot
    const priority = { waiting: 0, in_service: 1, bot: 2, closed: 3 };
    return priority[a.status] - priority[b.status];
  });

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Fila de Clientes
        </h2>
        <p className="text-gray-500 text-sm mt-1">{activeConversations.length} atendimento(s)</p>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhum cliente na fila
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {sortedConversations.map((conv) => {
              const client = getClient(conv.clientId);
              const status = statusConfig[conv.status];
              const isSelected = conv.id === selectedConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full p-4 text-left transition-colors hover:bg-gray-800 ${
                    isSelected ? 'bg-gray-800 border-l-2 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium">
                        {client?.name.charAt(0) || '?'}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${status.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-medium truncate">
                          {client?.name || 'Cliente'}
                        </p>
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm truncate mt-1">
                        {conv.lastMessage}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {new Date(conv.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
