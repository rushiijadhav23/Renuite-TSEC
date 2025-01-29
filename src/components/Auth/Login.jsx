import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { useStore } from '../../store';
import Lottie from "lottie-react";
import animationData from "../../../public/images/Animation - 1738169687563.json";

function Login() {
  const [aadhaarId, setAadhaarId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadhaarId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      console.log(data.token);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#CDC1FF] to-white min-h-screen p-10 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
              <div className="flex justify-center">
                <Lottie animationData={animationData} className="w-34 h-34" />
              </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#A294F9]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-[#A294F9] hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="aadhaarId" className="sr-only">Aadhaar ID</label>
              <input
                id="aadhaarId"
                name="aadhaarId"
                type="text"
                required
                value={aadhaarId}
                onChange={(e) => setAadhaarId(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#A294F9] placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#A294F9] focus:border-[#A294F9] sm:text-sm"
                placeholder="Aadhaar ID"
                maxLength="12"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#A294F9] placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#A294F9] focus:border-[#A294F9] sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#A294F9] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A294F9]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
