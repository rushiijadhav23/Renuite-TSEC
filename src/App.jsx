import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Map from './components/Map';

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
                      icon="🔍"
                    />
                    <FeatureCard
                      title="Real-Time Reports"
                      description="Report sightings instantly with photo uploads and location tracking."
                      icon="📱"
                    />
                    <FeatureCard
                      title="Biometric Verification"
                      description="Secure identification using advanced biometric technology."
                      icon="👆"
                    />
                  </div>
                </div>
              </>
            } />
            <Route path="/map" element={<Map />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default App;