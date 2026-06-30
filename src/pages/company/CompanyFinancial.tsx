import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const PIX_KEY = 'seupix@gmail.com'; // troca pela sua chave PIX
const PLAN_VALUE = 99.90; // troca pelo valor do seu MVP

export default function CompanyFinancial() {
  const { user } = useAuth();
  const { users, financialRecords } = useData();

  const currentUser = users.find(u => u.email === user?.email);
  const records = financialRecords.filter(f => f.companyId === currentUser?.companyId);

  return (
    <div className="min-h-screen">
        
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Financeiro</h1>
        <p className="text-gray-400 mt-1">Gerencie seus pagamentos</p>
      </div>

      {/* Plano atual */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Plano MVP</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Valor mensal</p>
            <p className="text-3xl font-bold text-white mt-1">
              R$ {PLAN_VALUE.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium">
            Plano Ativo
          </span>
        </div>
      </div>

      {/* Chave PIX */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Pagar via PIX</h2>
        <p className="text-gray-400 text-sm mb-3">Use a chave abaixo para realizar o pagamento:</p>
        <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
          <span className="text-white flex-1 font-mono">{PIX_KEY}</span>
          <button
            onClick={() => navigator.clipboard.writeText(PIX_KEY)}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            Copiar
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2">Após o pagamento, envie o comprovante para nosso suporte.</p>
      </div>

      {/* Histórico */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Histórico de Pagamentos</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {records.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Nenhum registro encontrado
            </div>
          ) : (
            records.map(record => (
              <div key={record.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Mensalidade MVP</p>
                  <p className="text-gray-500 text-sm">Vencimento: {record.dueDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-white font-semibold">R$ {record.amount.toFixed(2).replace('.', ',')}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    record.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : record.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {record.status === 'paid' ? 'Pago' : record.status === 'pending' ? 'Pendente' : 'Vencido'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}