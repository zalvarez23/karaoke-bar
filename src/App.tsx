import "./App.css";
import { MainLayoutContainer } from "./pages/layout/main-layout-container";
import {
  UserPage,
  LoginPage,
  VisitsManagePage,
  SongsManagePage,
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
                <Route path="/users" element={<UserPage />} />
                <Route path="/visits-manage" element={<VisitsManagePage />} />
                <Route path="/songs-manage" element={<SongsManagePage />} />
              </Routes>
            </MainLayoutContainer>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
