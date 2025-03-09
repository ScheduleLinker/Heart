// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RootLayout from './components/layouts/RootLayout';
import ActionButtons from './components/features/FileUpload/ActionButtons';
import Workspace from "./components/features/Workspace/Workspace";
export default function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<RootLayout><ActionButtons /></RootLayout>} /> {/*default route*/ }
        <Route path="/upload" element={<RootLayout><ActionButtons /></RootLayout>} />
        <Route path="/workspace" element={<Workspace />} />

        
      </Routes>
      
    </Router>
    
  );
}
