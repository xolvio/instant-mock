import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ProposalDashboard from './components/ui/proposal-dashboard';
import ProposalDetails from './components/ui/proposal-details';
import SeedDetails from './components/ui/seed-details';
import Header from "./components/ui/header";

function App() {
    return (
        <Router>
            <Header></Header>
            <Routes>
                <Route path="/" element={<ProposalDashboard/>}/>
                <Route path="/proposals/:proposalId" element={<ProposalDetails/>}/>
                <Route
                    path="/proposals/:proposalId/seeds/:seedId"
                    element={<SeedDetails/>}
                />
            </Routes>
        </Router>
    );
}

export default App;
