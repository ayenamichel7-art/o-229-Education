import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
import { SettingsPage } from './pages/Settings';
import { Timetable } from './pages/Timetable';
import { Pedagogy } from './pages/Pedagogy';
import { AttendancePage } from './pages/Attendance';
import { StaffMonitoring } from './pages/StaffMonitoring';
import { Exams } from './pages/Exams';
import { Communication } from './pages/Communication';
import { DisciplinePage } from './pages/Discipline';
import { AncillaryServices } from './pages/Services';
import { InventoryPage } from './pages/Inventory';
import { Alumni } from './pages/Alumni';
import { ParentCRM } from './pages/ParentCRM';

function App() {
  return (
    <HelmetProvider>
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
            <Route path="communication" element={<Communication />} />
            <Route path="discipline" element={<DisciplinePage />} />
            <Route path="services" element={<AncillaryServices />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="finance" element={<Finance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit" element={<AuditTrail />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="pedagogy" element={<Pedagogy />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="staff-monitoring" element={<StaffMonitoring />} />
            <Route path="exams" element={<Exams />} />
            {/* Builders (Elementor & Fluent style) */}
            <Route path="vitrine-builder" element={<PageBuilder />} />
            <Route path="form-builder" element={<FormBuilder />} />
            <Route path="mobile-app" element={<MobileAppPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Nouveau Module : Insertion Professionnelle */}
            <Route path="alumni" element={<Alumni />} />
            {/* Nouveau Module : CRM Parents */}
            <Route path="crm-parents" element={<ParentCRM />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TenantProvider>
  </HelmetProvider>
  );
}

export default App;
