import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './components/ui/home';
import Login from './components/ui/login';
import NotFound from './components/ui/not-found';
import SeedDetails from './components/ui/seed-details';
import SettingsPage from './components/ui/settings';
import VariantDashboard from './components/ui/variant-dashboard';
import VariantDetails from './components/ui/variant-details';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<Home />} />
        <Route
          path="/graphs/:graphId/variants"
          element={<VariantDashboard />}
        />
        <Route
          path="/graphs/:graphId/variants/:variantName"
          element={<VariantDetails />}
        />
        <Route path="seeds/:seedId" element={<SeedDetails />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
