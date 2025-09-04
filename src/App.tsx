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

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas sin layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas con MainLayoutContainer */}
        <Route
          path="*"
          element={
            <MainLayoutContainer>
              <Routes>
                {/* <Route path="/login" element={<LoginPage />} /> */}
                {/* Puedes agregar aquí rutas adicionales dentro del layout principal */}
                <Route path="/users" element={<UserPage />} />
                <Route path="/visits-manage" element={<VisitsManagePage />} />
                <Route path="/songs-manage" element={<SongsManagePage />} />
                <Route path="/company" element={<CompanyPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
              </Routes>
            </MainLayoutContainer>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
