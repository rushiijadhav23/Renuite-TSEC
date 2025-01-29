import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Search,House, ClipboardMinus, MapPinned, LogIn, NotebookPen, UserSearch, LogOut } from 'lucide-react';
import VilokanaLogo from "../../public/icons/vilokana_logo.svg"; 

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
            <Link to="/" className="text-3xl font-bold font-serif">
            <img src={VilokanaLogo} alt="Vilokana Logo" width={150} />
            Vilokana
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 ">
              <Link to="/" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center">
              <House />
                Home
              </Link>
              <Link to="/search" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center ">
              <Search />
                Search Portal
              </Link>
              <Link to="/report" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center ">
              <ClipboardMinus />
                Missing Report
              </Link>
              <Link to="/missing" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center ">
                <UserSearch />
                Missing Persons
              </Link>
              <Link to="/map" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center ">
              <MapPinned />
                Map View
              </Link>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center "
                >
                  <LogOut />
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center ">
                  <LogIn />
                    Login
                  </Link>
                  <Link to="/register" className="px-3 py-2 rounded-md hover:bg-indigo-700 flex flex-col items-center ">
                  <NotebookPen />
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