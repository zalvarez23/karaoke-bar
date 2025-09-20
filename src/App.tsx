import "./App.css";
import { MainLayoutContainer } from "./pages/layout/main-layout-container";
import {
  UserPage,
  LoginPage,
  VisitsManagePage,
  SongsManagePage,
  CompanyPage,
  MaintenancePage,
} from "@/pages";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta de login sin protección */}
          <Route path="/login" element={<LoginPage />} />

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
