import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import GraphDashboard from './components/ui/graph-dashboard';
import Header from './components/ui/header';
import Home from './components/ui/home';
import NotFound from './components/ui/not-found';
import SeedDetails from './components/ui/seed-details';
import SettingsPage from './components/ui/settings';
import VariantDashboard from './components/ui/variant-dashboard';
import VariantDetails from './components/ui/variant-details';

function App() {
  return (
    <Router>
      <Header></Header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/graphs" element={<GraphDashboard />} />
        <Route
          path="/graphs/:graphId/variants"
          element={<VariantDashboard />}
        />
        <Route
          path="/graphs/:graphId/variants/:variantName"
          element={<VariantDetails />}
        />
        <Route
          path="/proposals/:proposalId/seeds/:seedId"
          element={<SeedDetails />}
        />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
