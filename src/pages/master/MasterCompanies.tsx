import { useState, type FormEvent } from 'react';
import { useData } from '../../contexts/DataContext';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function MasterCompanies() {
  const { companies, createCompany, toggleCompanyStatus, getCompanyUsers } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    class: '',
    whatsappNumber: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome da empresa é obrigatório';
    if (!formData.adminName.trim()) newErrors.adminName = 'Nome do administrador é obrigatório';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Email é obrigatório';
    if (!formData.adminPassword.trim()) newErrors.adminPassword = 'Senha é obrigatória';
    if (formData.adminPassword.length < 6) newErrors.adminPassword = 'Senha deve ter pelo menos 6 caracteres';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    createCompany({
      name: formData.name,
      adminName: formData.adminName,
      adminEmail: formData.adminEmail,
      adminPassword: formData.adminPassword,
      class: formData.class,
      whatsappNumber: formData.whatsappNumber,
    });
    setFormData({ name: '', adminName: '', adminEmail: '', adminPassword: '', class: '', whatsappNumber: '' });
    setErrors({});
    setIsModalOpen(false);
  };

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);
  const selectedCompanyUsers = selectedCompany ? getCompanyUsers(selectedCompany) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Empresas</h1>
          <p className="text-gray-400 mt-1">Gerencie as empresas cadastradas na plataforma</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Criar Empresa
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuários</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Criada em</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma empresa cadastrada
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const users = getCompanyUsers(company.id);
                  return (
                    <tr key={company.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">{company.name}</p>
                            {company.class && <p className="text-gray-500 text-xs">{company.class}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={company.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{users.length}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{company.createdAt}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCompany(company.id)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleCompanyStatus(company.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              company.isActive
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                            }`}
                          >
                            {company.isActive ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Criar Nova Empresa">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Empresa</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nome da empresa"
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Classe da Empresa</label>
            <select
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Selecione uma classe</option>
              <option value="roupa">Loja de Roupa</option>
              <option value="sapato">Loja de Sapato</option>
              <option value="barbearia">Barbearia</option>
              <option value="estetica">Estética</option>
              <option value="restaurante">Restaurante</option>
              <option value="geral">Geral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Número WhatsApp</label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="5511999999999"
            />
            <p className="text-gray-500 text-xs mt-1">Formato: código do país + DDD + número (sem espaços)</p>
          </div>
          
          <div className="border-t border-gray-800 pt-5">
            <p className="text-sm font-medium text-gray-400 mb-4">Administrador da Empresa</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Administrador</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
                {errors.adminName && <p className="mt-1 text-sm text-red-400">{errors.adminName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="admin@empresa.com"
                />
                {errors.adminEmail && <p className="mt-1 text-sm text-red-400">{errors.adminEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {errors.adminPassword && <p className="mt-1 text-sm text-red-400">{errors.adminPassword}</p>}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Criar Empresa
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title={selectedCompanyData?.name || 'Detalhes da Empresa'}
      >
        {selectedCompanyData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedCompanyData.isActive ? 'active' : 'inactive'} />
              <span className="text-gray-500 text-sm">Criada em {selectedCompanyData.createdAt}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Usuários ({selectedCompanyUsers.length})</h3>
              <div className="space-y-2">
                {selectedCompanyUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'company_admin' 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {user.role === 'company_admin' ? 'Admin' : 'Vendedor'}
                      </span>
                      <StatusBadge status={user.isOnline ? 'online' : 'offline'} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}