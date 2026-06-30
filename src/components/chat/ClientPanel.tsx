import { useState } from 'react';
import { Client, Conversation, Protocol } from '../../types/chat';
import { Modal } from '../ui/Modal';

interface ClientPanelProps {
  client: Client | undefined;
  conversation: Conversation;
  protocol: Protocol | undefined;
  onCreateProtocol: () => Protocol;
  onUpdateProtocolStatus: (status: Protocol['status']) => void;
  onUpdatePaymentStatus: (status: Protocol['paymentStatus']) => void;
  readOnly?: boolean;
}

export function ClientPanel({
  client,
  conversation,
  protocol,
  onCreateProtocol,
  onUpdateProtocolStatus,
  onUpdatePaymentStatus,
  readOnly = false,
}: ClientPanelProps) {
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [createdProtocol, setCreatedProtocol] = useState<Protocol | null>(null);

  const handleCreateProtocol = () => {
    const newProtocol = onCreateProtocol();
    setCreatedProtocol(newProtocol);
    setShowProtocolModal(true);
  };

  const product = conversation.desiredProduct;

  return (
    <div className="h-full flex flex-col bg-gray-900 border-l border-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Dados do Cliente
        </h2>
      </div>

      {/* Client Info */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          👤 Informações Pessoais
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-gray-500 text-xs">Nome</p>
            <p className="text-white font-medium">{client?.name || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Telefone</p>
            <p className="text-white">{client?.phone || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">CPF</p>
            <p className="text-white">{client?.cpf || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Endereço</p>
            <p className="text-white text-sm">{client?.address || '-'}</p>
          </div>
        </div>
      </div>

      {/* Desired Product */}
      {product && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            🛍️ Produto Desejado
          </h3>
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Tipo</span>
              <span className="text-white text-sm">{product.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Modelo</span>
              <span className="text-white text-sm">{product.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Cor</span>
              <span className="text-white text-sm">{product.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Tamanho</span>
              <span className="text-white text-sm">{product.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Quantidade</span>
              <span className="text-white text-sm">{product.quantity}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bot Summary */}
      {conversation.botSummary && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            🧠 Resumo do Bot
          </h3>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-300 text-sm leading-relaxed">{conversation.botSummary}</p>
          </div>
        </div>
      )}

      {/* Protocol Section */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          📦 Protocolo
        </h3>
        
        {protocol ? (
          <div className="bg-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Código</span>
              <span className="text-amber-400 font-mono font-bold text-lg">#{protocol.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Status</span>
              <select
                value={protocol.status}
                onChange={(e) => onUpdateProtocolStatus(e.target.value as Protocol['status'])}
                disabled={readOnly}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <option value="iniciado">Iniciado</option>
                <option value="andamento">Em andamento</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Pagamento</span>
              <select
                value={protocol.paymentStatus}
                onChange={(e) => onUpdatePaymentStatus(e.target.value as Protocol['paymentStatus'])}
                disabled={readOnly}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-500 text-xs">Produto</p>
              <p className="text-white text-sm">{protocol.product}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">Nenhum protocolo criado</p>
            {!readOnly && conversation.status === 'in_service' && (
              <button
                onClick={handleCreateProtocol}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                Criar Protocolo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Protocol Created Modal */}
      <Modal
        isOpen={showProtocolModal}
        onClose={() => setShowProtocolModal(false)}
        title="Protocolo Criado"
      >
        {createdProtocol && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-lg font-semibold mb-2">Protocolo gerado com sucesso!</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm">Código do protocolo</p>
              <p className="text-amber-400 font-mono font-bold text-3xl">#{createdProtocol.code}</p>
            </div>
            <p className="text-gray-400 text-sm">
              Informe este código ao cliente para consultas futuras.
            </p>
            <button
              onClick={() => setShowProtocolModal(false)}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
