import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SuperTokens, {SuperTokensWrapper} from 'supertokens-auth-react';
import CallbackHandler from './CallbackHandler';
import Home from './components/ui/home';
import Login from './components/ui/login';
import NotFound from './components/ui/not-found';
import SettingsPage from './components/ui/settings';
import {SuperTokensConfig} from './config/auth';
import {config} from './config/config';

if (config.requireAuth) {
  SuperTokens.init(SuperTokensConfig);
}

function AppRoutes() {
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

function App() {
  if (config.requireAuth) {
    return (
      <SuperTokensWrapper>
        <AppRoutes />
      </SuperTokensWrapper>
    );
  }

  return <AppRoutes />;
}

export default App;
