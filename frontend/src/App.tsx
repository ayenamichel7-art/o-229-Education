import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TenantProvider } from './providers/TenantProvider';
import { RequireAuth } from './components/RequireAuth';
import { PublicLayout } from './layouts/PublicLayout';
import { PublicDisplay } from './pages/PublicDisplay';
import { AdmissionForm } from './pages/AdmissionForm';
import { Login } from './pages/Login';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { AuditTrail } from './pages/AuditTrail';
import PageBuilder from './pages/builder/PageBuilder';
import FormBuilder from './pages/builder/FormBuilder';
import { MobileAppPage } from './pages/MobileApp';

function App() {
  return (
    <TenantProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Vitrine Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<PublicDisplay />} />
            <Route path="admission" element={<AdmissionForm />} />
          </Route>

          {/* Secured ERP Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="finance" element={<Finance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit" element={<AuditTrail />} />
            
            {/* Builders (Elementor & Fluent style) */}
            <Route path="vitrine-builder" element={<PageBuilder />} />
            <Route path="form-builder" element={<FormBuilder />} />
            <Route path="mobile-app" element={<MobileAppPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TenantProvider>
  );
}

export default App;
