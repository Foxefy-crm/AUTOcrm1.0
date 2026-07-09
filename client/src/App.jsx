import { Authenticated, Refine } from '@refinedev/core';
import { ThemedLayout, useNotificationProvider } from '@refinedev/antd';
import routerProvider, { CatchAllNavigate } from '@refinedev/react-router';
import { App as AntdApp, ConfigProvider } from 'antd';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import '@refinedev/antd/dist/reset.css';

import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import { Dashboard } from './pages/Dashboard';
import { LeadCreate } from './pages/LeadCreate';
import { LeadList } from './pages/LeadList';
import { LeadShow } from './pages/LeadShow';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            authProvider={authProvider}
            dataProvider={dataProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              { name: 'dashboard', list: '/dashboard', meta: { label: 'Dashboard' } },
              { name: 'leads', list: '/leads', create: '/leads/create', show: '/leads/:id', meta: { label: 'Leads' } },
            ]}
            options={{ disableTelemetry: true }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayout>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<LeadList />} />
                <Route path="/leads/create" element={<LeadCreate />} />
                <Route path="/leads/:id" element={<LeadShow />} />
              </Route>

              <Route
                element={
                  <Authenticated key="auth-pages" fallback={<Outlet />}>
                    <Navigate to="/dashboard" replace />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}
