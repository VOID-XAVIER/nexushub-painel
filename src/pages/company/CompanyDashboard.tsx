import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useChat } from '../../contexts/ChatContext';
import { StatCard } from '../../components/ui/StatCard';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { users, companies, getCompanyStats } = useData();
  const { getActiveClientsCount, getSalesByCompany, getSalesBySeller } = useChat();

  // Find current user data with company
  const currentUserData = users.find(u => u.email === user?.email);
  const companyId = currentUserData?.companyId;
  const company = companies.find(c => c.id === companyId);
  
  // Get company-specific stats
  const stats = companyId ? getCompanyStats(companyId) : { totalSellers: 0, onlineSellers: 0, offlineSellers: 0 };
  
  // Get sellers for this company only
  const companySellers = users.filter(u => u.companyId === companyId && u.role === 'seller');

  // Get active clients count
  const activeClients = companyId ? getActiveClientsCount(companyId) : 0;

  // Get sales data
  const companySales = companyId ? getSalesByCompany(companyId) : [];
  const totalRevenue = companySales.reduce((sum, sale) => sum + sale.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calculate seller stats with goals
  const sellerStats = companySellers.map(seller => {
    const sellerSales = getSalesBySeller(seller.id);
    const totalSold = sellerSales.reduce((sum, sale) => sum + sale.amount, 0);
    const goal = seller.monthlyGoal || 5000;
    const progress = Math.min((totalSold / goal) * 100, 100);
    
    return {
      ...seller,
      totalSold,
      goal,
      progress,
      salesCount: sellerSales.length,
    };
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral da empresa {company?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Faturamento Mensal"
          value={formatCurrency(totalRevenue)}
          color="emerald"
          subtitle={`${companySales.length} vendas`}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Clientes Ativos"
          value={activeClients}
          color="purple"
          subtitle="Em atendimento"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
        />
        <StatCard
          title="Vendedores Online"
          value={stats.onlineSellers}
          color="blue"
          subtitle={`de ${stats.totalSellers} total`}
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          title="Vendedores Offline"
          value={stats.offlineSellers}
          color="amber"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          }
        />
      </div>

      {/* Seller Goals Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Metas dos Vendedores</h2>
          <span className="text-sm text-gray-500">Mês atual</span>
        </div>
        <div className="divide-y divide-gray-800">
          {sellerStats.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Nenhum vendedor cadastrado
            </div>
          ) : (
            sellerStats.map((seller) => (
              <div key={seller.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        seller.isOnline ? 'bg-emerald-400' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{seller.name}</p>
                      <p className="text-gray-500 text-sm">{seller.salesCount} vendas realizadas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(seller.totalSold)}</p>
                    <p className="text-gray-500 text-sm">de {formatCurrency(seller.goal)}</p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        seller.progress >= 100 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : seller.progress >= 70 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                          : seller.progress >= 40
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-red-500 to-orange-400'
                      }`}
                      style={{ width: `${seller.progress}%` }}
                    />
                  </div>
                  <span className={`absolute right-0 -top-6 text-xs font-medium ${
                    seller.progress >= 100 ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {Math.round(seller.progress)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Two columns: Sellers and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sellers List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Vendedores</h2>
            <span className="text-sm text-gray-500">{stats.totalSellers} total</span>
          </div>
          <div className="divide-y divide-gray-800">
            {companySellers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhum vendedor cadastrado
              </div>
            ) : (
              companySellers.slice(0, 5).map((seller) => (
                <div key={seller.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        seller.isOnline ? 'bg-emerald-400' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{seller.name}</p>
                      <p className="text-gray-500 text-sm">{seller.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    seller.isOnline 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {seller.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity (Mock) */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {[
              { action: 'Nova venda realizada', time: 'há 5 min', icon: '💰' },
              { action: 'Cliente cadastrado', time: 'há 15 min', icon: '👤' },
              { action: 'Vendedor entrou online', time: 'há 30 min', icon: '🟢' },
              { action: 'Atendimento finalizado', time: 'há 1 hora', icon: '✅' },
              { action: 'Novo pedido recebido', time: 'há 2 horas', icon: '📦' },
            ].map((activity, index) => (
              <div key={index} className="px-6 py-4 flex items-center gap-4">
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-white">{activity.action}</p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
