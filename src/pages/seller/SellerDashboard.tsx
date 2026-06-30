import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useChat } from '../../contexts/ChatContext';

export default function SellerDashboard() {
  const { user } = useAuth();
  const { users, companies, toggleUserOnline } = useData();
  const { getConversationsByCompany, getProtocolsByCompany } = useChat();

  // Find current user data with company
  const currentUserData = users.find(u => u.email === user?.email);
  const companyId = currentUserData?.companyId;
  const company = companies.find(c => c.id === companyId);

  // Get company stats
  const companyConversations = companyId ? getConversationsByCompany(companyId) : [];
  const companyProtocols = companyId ? getProtocolsByCompany(companyId) : [];
  const waitingCount = companyConversations.filter(c => c.status === 'waiting').length;
  const inServiceCount = companyConversations.filter(c => c.status === 'in_service').length;

  const handleToggleOnline = () => {
    if (currentUserData) {
      toggleUserOnline(currentUserData.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-400">
              Bem-vindo ao painel de atendimento. Você está vinculado à <strong className="text-amber-400">{company?.name}</strong>.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleToggleOnline}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                currentUserData?.isOnline
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                currentUserData?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
              }`} />
              {currentUserData?.isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Aguardando</p>
              <p className="text-2xl font-bold text-amber-400">{waitingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Em Atendimento</p>
              <p className="text-2xl font-bold text-emerald-400">{inServiceCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Protocolos</p>
              <p className="text-2xl font-bold text-purple-400">{companyProtocols.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Go to Chat CTA */}
      <Link
        to="/seller/chat"
        className="block bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Ir para o Chat</h2>
              <p className="text-white/80 text-sm">
                {waitingCount > 0 
                  ? `${waitingCount} cliente(s) aguardando atendimento` 
                  : 'Acompanhe seus atendimentos em tempo real'}
              </p>
            </div>
          </div>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </Link>

      {/* Debug Info */}
      <div className="mt-6 bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
        <p className="text-xs text-gray-500 font-medium mb-2">DEBUG INFO</p>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <span>User ID: <code className="text-amber-500">{currentUserData?.id}</code></span>
          <span>Company ID: <code className="text-amber-500">{companyId}</code></span>
          <span>Role: <code className="text-amber-500">{user?.role}</code></span>
        </div>
      </div>
    </div>
  );
}
