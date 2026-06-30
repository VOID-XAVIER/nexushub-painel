import { Routes, Route } from 'react-router-dom';
import { SellerLayout } from '../../components/layouts/SellerLayout';
import SellerDashboard from './SellerDashboard';
import SellerChat from './SellerChat';

export default function SellerPanel() {
  return (
    <SellerLayout>
      <Routes>
        <Route index element={<SellerDashboard />} />
        <Route path="chat" element={<SellerChat />} />
      </Routes>
    </SellerLayout>
  );
}
