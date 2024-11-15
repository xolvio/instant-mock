import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SuperTokens, {SuperTokensWrapper} from 'supertokens-auth-react';
import {getSuperTokensRoutesForReactRouterDom} from 'supertokens-auth-react/ui';
import {SessionAuth} from 'supertokens-auth-react/recipe/session';
import Home from './components/ui/home';
import Login from './components/ui/login';
import NotFound from './components/ui/not-found';
import SettingsPage from './components/ui/settings';
import {PreBuiltUIList, SuperTokensConfig} from './config';

SuperTokens.init(SuperTokensConfig);

function App() {
  return (
    <SuperTokensWrapper>
      <Router>
        <Routes>
          {getSuperTokensRoutesForReactRouterDom(
            require('react-router-dom'),
            PreBuiltUIList
          )}
          <Route
            path="/"
            element={
              <SessionAuth>
                <Home />
              </SessionAuth>
            }
          />
          <Route path="/login" element={<Login />}></Route>
          <Route
            path="settings"
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
