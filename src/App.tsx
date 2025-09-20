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
              <AppProviders>
                <KaraokeLoginPage />
              </AppProviders>
            }
          />
          <Route
            path="/karaoke/register"
            element={
              <AppProviders>
                <KaraokeUserRegisterPage />
              </AppProviders>
            }
          />

          {/* Rutas de Karaoke - Protegidas por su propio sistema */}
          <Route
            path="/karaoke"
            element={
              <AppProviders>
                <ProtectedKaraokeRoute>
                  <KaraokeHomePage />
                </ProtectedKaraokeRoute>
              </AppProviders>
            }
          />
          <Route
            path="/karaoke/home"
            element={
              <AppProviders>
                <ProtectedKaraokeRoute>
                  <KaraokeHomePage />
                </ProtectedKaraokeRoute>
              </AppProviders>
            }
          />
          <Route
            path="/karaoke/mesas"
            element={
              <AppProviders>
                <ProtectedKaraokeRoute>
                  <KaraokeVisitManagePage />
                </ProtectedKaraokeRoute>
              </AppProviders>
            }
          />
          <Route
            path="/karaoke/mesas-online"
            element={
              <AppProviders>
                <ProtectedKaraokeRoute>
                  <KaraokeVisitManageOnlinePage />
                </ProtectedKaraokeRoute>
              </AppProviders>
            }
          />
          <Route
            path="/karaoke/live"
            element={
              <AppProviders>
                <ProtectedKaraokeRoute>
                  <KaraokeLivePage />
                </ProtectedKaraokeRoute>
              </AppProviders>
            }
          />
          <Route
            path="/karaoke/profile"
            element={
              <AppProviders>
                <ProtectedKaraokeRoute>
                  <KaraokeProfilePage />
                </ProtectedKaraokeRoute>
              </AppProviders>
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
