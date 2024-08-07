import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ProposalDashboard from './components/ui/proposal-dashboard';
import ProposalDetails from './components/ui/proposal-details';
import SeedDetails from './components/ui/seed-details';

function App() {
  return (
    <Router>
      {/*<header className="w-full bg-white shadow p-4">*/}
      {/*    <div className="container mx-auto">*/}
      {/*        <div className="text-2xl font-bold" style={{color: 'rgb(86, 191, 152)'}}>*/}
      {/*            InstantMock by Xolvio*/}
      {/*        </div>*/}
      {/*    </div>*/}
      {/*</header>*/}
      <Routes>
        <Route path="/" element={<ProposalDashboard />} />
        <Route path="/proposals/:proposalId" element={<ProposalDetails />} />
        <Route
          path="/proposals/:proposalId/seeds/:seedId"
          element={<SeedDetails />}
        />
      </Routes>
    </Router>
  );
}

export default App;
