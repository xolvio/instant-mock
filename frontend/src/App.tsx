import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import GraphDashboard from './components/ui/graph-dashboard';
import Header from './components/ui/header';
import SeedDetails from './components/ui/seed-details';
import VariantDashboard from './components/ui/variant-dashboard';
import VariantDetails from './components/ui/variant-details';

function App() {
  return (
    <Router>
      <Header></Header>
      <Routes>
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
      </Routes>
    </Router>
  );
}

export default App;
