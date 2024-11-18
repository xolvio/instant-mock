import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SuperTokens, {SuperTokensWrapper} from 'supertokens-auth-react';
import {SessionAuth} from 'supertokens-auth-react/recipe/session';
import CallbackHandler from './CallbackHandler';
import Home from './components/ui/home';
import Login from './components/ui/login';
import NotFound from './components/ui/not-found';
import SettingsPage from './components/ui/settings';
import {SuperTokensConfig} from './config';

SuperTokens.init(SuperTokensConfig);

function App() {
  return (
    <SuperTokensWrapper>
      <Router>
        <Routes>
          {/*{getSuperTokensRoutesForReactRouterDom(*/}
          {/*  require('react-router-dom'),*/}
          {/*  PreBuiltUIList*/}
          {/*)}*/}
          <Route path={'/auth/callback/github'} element={<CallbackHandler />} />
          <Route path={'/auth'} element={<Login />} />s
          <Route
            path="/"
            element={
              <SessionAuth>
                <Home />
              </SessionAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <SessionAuth>
                <SettingsPage />
              </SessionAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </SuperTokensWrapper>
  );
}

export default App;
