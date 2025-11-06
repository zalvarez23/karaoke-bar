import "./App.css";
import { MainLayoutContainer } from "./pages/layout/main-layout-container";
import {
  UserPage,
  LoginPage,
  VisitsManagePage,
  SongsManagePage,
  CompanyPage,
  MaintenancePage,
  // Karaoke Pages
  KaraokeLoginPage,
  KaraokeHomePage,
  KaraokeVisitManagePage,
  KaraokeVisitManageOnlinePage,
  KaraokeLivePage,
  KaraokeUserRegisterPage,
  KaraokeProfilePage,
  GuestModePage,
  SongsManageAutomaticPage,
} from "@/pages";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/pages/karaoke/shared/context";
import { ProtectedKaraokeRoute } from "@/pages/karaoke/shared/components";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta de login sin protección */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas de Karaoke */}
          <Route
            path="/karaoke/login"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <KaraokeLoginPage />
                </AppProviders>
              </div>
            }
          />
          <Route
            path="/karaoke/register"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <KaraokeUserRegisterPage />
                </AppProviders>
              </div>
            }
          />
          <Route
            path="/karaoke/guest-mode"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <GuestModePage />
                </AppProviders>
              </div>
            }
          />

          {/* Rutas de Karaoke - Protegidas por su propio sistema */}
          <Route
            path="/karaoke"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <ProtectedKaraokeRoute>
                    <KaraokeHomePage />
                  </ProtectedKaraokeRoute>
                </AppProviders>
              </div>
            }
          />
          <Route
            path="/karaoke/home"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <ProtectedKaraokeRoute>
                    <KaraokeHomePage />
                  </ProtectedKaraokeRoute>
                </AppProviders>
              </div>
            }
          />
          <Route
            path="/karaoke/mesas"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <ProtectedKaraokeRoute>
                    <KaraokeVisitManagePage />
                  </ProtectedKaraokeRoute>
                </AppProviders>
              </div>
            }
          />
          <Route
            path="/karaoke/mesas-online"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <ProtectedKaraokeRoute>
                    <KaraokeVisitManageOnlinePage />
                  </ProtectedKaraokeRoute>
                </AppProviders>
              </div>
            }
          />
          <Route
            path="/karaoke/live"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <ProtectedKaraokeRoute>
                    <KaraokeLivePage />
                  </ProtectedKaraokeRoute>
                </AppProviders>
              </div>
            }
          />
          <Route
            path="/karaoke/profile"
            element={
              <div data-route="karaoke">
                <AppProviders>
                  <ProtectedKaraokeRoute>
                    <KaraokeProfilePage />
                  </ProtectedKaraokeRoute>
                </AppProviders>
              </div>
            }
          />

          {/* Ruta de Reproductor Automático sin sidebar ni header */}
          <Route
            path="/songs-manage-automatic"
            element={
              <ProtectedRoute>
                <SongsManageAutomaticPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas protegidas con MainLayoutContainer */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <MainLayoutContainer>
                  <Routes>
                    <Route path="/" element={<UserPage />} />
                    <Route path="/users" element={<UserPage />} />
                    <Route
                      path="/visits-manage"
                      element={<VisitsManagePage />}
                    />
                    <Route path="/songs-manage" element={<SongsManagePage />} />
                    <Route path="/company" element={<CompanyPage />} />
                    <Route path="/maintenance" element={<MaintenancePage />} />
                  </Routes>
                </MainLayoutContainer>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
