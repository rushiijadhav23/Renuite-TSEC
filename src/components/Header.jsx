import { Link } from 'react-router-dom';
import { useStore } from '../store';

function Header() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <header className="bg-[#A294F9] text-white">
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
                Report Missing
              </Link>
              <Link to="/verify" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Verify Aadhar
              </Link>
              <Link to="/map" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Map View
              </Link>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md hover:bg-indigo-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                    Login
                  </Link>
                  <Link to="/register" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;