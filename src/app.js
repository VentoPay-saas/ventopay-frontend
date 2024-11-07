import Loading from 'components/loading';
import PageLoading from 'components/pageLoading';
import i18n from 'configs/i18next';
import { PathLogout } from 'context/path-logout';
import { ProtectedRoute } from 'context/protected-route';
import AppLayout from 'layout/app-layout';
import { WelcomeLayout } from 'layout/welcome-layout';
import Providers from 'providers';
import { Suspense, useEffect, useState } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AllRoutes } from 'routes';
import informationService from 'services/rest/information';
import GlobalSettings from 'views/global-settings/global-settings';
import Login from 'views/login';
import NotFound from 'views/not-found';
import Welcome from 'views/welcome/welcome';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchSettings, fetchRestSettings } from 'redux/slices/globalSettings';

const App = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth, shallowEqual);

  const [loading, setLoading] = useState(false);

  const fetchUserSettings = (role) => {
    switch (role) {
      case 'admin':
        dispatch(fetchSettings({}));
        break;
      case 'seller':
        dispatch(fetchRestSettings({ seller: true }));
        break;
      default:
        dispatch(fetchRestSettings({}));
    }
  };

  // const fetchTranslations = async () => {
  //   const params = { lang: i18n.language };
  //   setLoading(true);
  //   informationService
  //     .translations(params)
  //     .then(({ data }) =>
  //       i18n.addResourceBundle(i18n.language, 'translation', data),
  //     )
  //     .finally(() => setLoading(false));
  // };

  // useEffect(() => {
  //   fetchTranslations();
  // }, []);

  useEffect(() => {
    fetchUserSettings(user?.role || '');
    return () => {};
    // eslint-disable-next-line
  }, [user?.role]);

  return (
    <Providers>
      <Router>
        <Routes>
          <Route
            index
            path='/login'
            element={
              <PathLogout>
                <Login />
              </PathLogout>
            }
          />
          <Route
            path='/welcome'
            element={
              <WelcomeLayout>
                <Welcome />
              </WelcomeLayout>
            }
          />
          <Route
            path='/installation'
            element={
              <WelcomeLayout>
                <GlobalSettings />
              </WelcomeLayout>
            }
          />
          <Route
            path=''
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path='/' element={<Navigate to='dashboard' />} />
            {AllRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
          <Route
            path='*'
            element={
              <Suspense fallback={<Loading />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
        <ToastContainer
          className='antd-toast'
          position='top-right'
          autoClose={2500}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
        />
        {loading && <PageLoading />}
      </Router>
    </Providers>
  );
};
export default App;
