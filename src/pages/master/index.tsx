import { Routes, Route } from 'react-router-dom';
import { MasterLayout } from '../../components/layouts/MasterLayout';
import MasterDashboard from './MasterDashboard';
import MasterCompanies from './MasterCompanies';
import MasterChats from './MasterChats';
import MasterFinancial from './MasterFinancial';
import MasterTeam from './MasterTeam';

export default function MasterPanel() {
  return (
    <MasterLayout>
      <Routes>
        <Route index element={<MasterDashboard />} />
        <Route path="companies" element={<MasterCompanies />} />
        <Route path="chats" element={<MasterChats />} />
        <Route path="financial" element={<MasterFinancial />} />
        <Route path="team" element={<MasterTeam />} />
      </Routes>
    </MasterLayout>
  );
}
