import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import SearchPortal from './components/SearchPortal';
import ReportForm from './components/ReportForm';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AadhaarForm from './components/Auth/AadhaarForm';
import MissingPersonMap from './components/MissingPersonMap';
import MissingPerson from './components/MissingPerson';
import FeatureCard from './components/FeatureCard';
import animationData from "../public/images/Animation - 1738133166117.json"; 
import animationData1 from "../public/images/Animation - 1738141980756.json"; 
import animationData2 from "../public/images/Animation - 1738142053285.json"; 
// import NgoDashboard from './components/NgoDashboard'
// import PoliceDashboard from './components/PoliceDashboard'
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                      title="Advanced Search"
                      description="Search our comprehensive database of missing persons with detailed filters."
                      animationData={animationData}
                    />
                    <FeatureCard
                      title="Real-Time Reports"
                      description="Report sightings instantly with photo uploads and location tracking."
                      animationData={animationData1}
                    />
                    <FeatureCard
                      title="Facial Verification"
                      description="Secure identification using advanced facial verification."
                      animationData={animationData2}
                    />
                  </div>
                </div>
              </>
            } />
            <Route path="/map" element={<MissingPersonMap />} />
            <Route path="/report" element={<ReportForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/aadhaar" element={<AadhaarForm />} />
            <Route path="/search" element={<SearchPortal />} />
            <Route path="/missing" element={<MissingPerson />} />
            <Route path="/:type/:id" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}



export default App;