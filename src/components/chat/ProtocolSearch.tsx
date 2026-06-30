import { useState } from 'react';
import { Protocol } from '../../types/chat';
import { Modal } from '../ui/Modal';

interface ProtocolSearchProps {
  protocols: Protocol[];
  getProtocol: (code: string) => Protocol | undefined;
}

const statusLabels = {
  iniciado: { label: 'Iniciado', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  andamento: { label: 'Em andamento', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  encerrado: { label: 'Encerrado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const paymentLabels = {
  pago: { label: 'Pago', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pendente: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

export function ProtocolSearch({ protocols, getProtocol }: ProtocolSearchProps) {
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<Protocol | null | 'not_found'>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = () => {
    if (!searchCode.trim()) return;
    
    const protocol = getProtocol(searchCode.trim());
    setSearchResult(protocol || 'not_found');
    setShowModal(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Buscar Protocolo
      </h3>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite o código..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={!searchCode.trim()}
          className="bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Recent Protocols */}
      {protocols.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-500 text-xs font-medium mb-2">PROTOCOLOS RECENTES</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {protocols.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSearchResult(p);
                  setShowModal(true);
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono font-medium">#{p.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusLabels[p.status].color}`}>
                    {statusLabels[p.status].label}
                  </span>
                </div>
                <p className="text-white text-sm mt-1">{p.clientName}</p>
                <p className="text-gray-500 text-xs truncate">{p.product}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSearchResult(null);
          setSearchCode('');
        }}
        title={searchResult === 'not_found' ? 'Protocolo não encontrado' : `Protocolo #${searchResult && typeof searchResult !== 'string' ? searchResult.code : ''}`}
      >
        {searchResult === 'not_found' ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-400">Nenhum protocolo encontrado com o código informado.</p>
          </div>
        ) : searchResult ? (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Código</span>
                <span className="text-amber-400 font-mono font-bold text-xl">#{searchResult.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Cliente</span>
                <span className="text-white">{searchResult.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">CPF</span>
                <span className="text-white">{searchResult.clientCpf}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${statusLabels[searchResult.status].color}`}>
                  {statusLabels[searchResult.status].label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Pagamento</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${paymentLabels[searchResult.paymentStatus].color}`}>
                  {paymentLabels[searchResult.paymentStatus].label}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Produto</p>
              <p className="text-white bg-gray-800 rounded-lg p-3">{searchResult.product}</p>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Criado: {new Date(searchResult.createdAt).toLocaleString('pt-BR')}</span>
              <span>Atualizado: {new Date(searchResult.updatedAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
