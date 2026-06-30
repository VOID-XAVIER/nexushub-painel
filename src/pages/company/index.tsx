import { Routes, Route } from 'react-router-dom';
import { CompanyLayout } from '../../components/layouts/CompanyLayout';
import CompanyDashboard from './CompanyDashboard';
import CompanyTeam from './CompanyTeam';
import CompanyFinancial from './CompanyFinancial';

export default function CompanyPanel() {
  return (
    <CompanyLayout>
      <Routes>
        <Route index element={<CompanyDashboard />} />
        <Route path="team" element={<CompanyTeam />} />
        <Route path="financial" element={<CompanyFinancial />} />
      </Routes>
    </CompanyLayout>
  );
}