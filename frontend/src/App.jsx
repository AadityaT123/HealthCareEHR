import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Staff Pages
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import PatientDetail from './pages/PatientDetail';
import Documentation from './pages/Documentation';
import Orders from './pages/Orders';
import Medications from './pages/Medications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Staff Application */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<PatientsList />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="orders" element={<Orders />} />
          <Route path="medications" element={<Medications />} />
          <Route path="settings" element={
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm text-muted-foreground">
              Settings coming soon.
            </div>
          } />
          {/* Catch all within layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        
        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
