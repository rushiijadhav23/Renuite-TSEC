import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-indigo-600 text-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Missing Persons Tracker
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Home
              </Link>
              <Link to="/search" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Search Portal
              </Link>
              <Link to="/report" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Report Sighting
              </Link>
              <Link to="/verify" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Verify Aadhar
              </Link>
              <Link to="/map" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Map View
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;