import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SuperTokens from 'supertokens-auth-react';
import CallbackHandler from './CallbackHandler';
import Home from './components/ui/home';
import Login from './components/ui/login';
import NotFound from './components/ui/not-found';
import SettingsPage from './components/ui/settings';
import {SuperTokensConfig} from './config/auth';

SuperTokens.init(SuperTokensConfig);

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path={'/auth/callback/:providerId'}
          element={<CallbackHandler />}
        />
        <Route path={'/auth'} element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
