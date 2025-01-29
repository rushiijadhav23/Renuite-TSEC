import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

function AadhaarForm() {
  const [formData, setFormData] = useState({
    aadhaarno: '',
    aadhaardob: '',
    aadhaarname: '',
    aadhaaraddress: '',
    aadhaarphone: '',
    aadhaaremail: '',
    aadhaargender: '', // Add gender field
    aadhaarphoto: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/aadhaardata`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      navigate('/success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Aadhaar Information Entry
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="aadhaarno"
                type="text"
                required
                value={formData.aadhaarno}
                onChange={handleChange}
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Aadhaar Number"
                maxLength="12"
              />
            </div>
            
            <div>
              <input
                name="aadhaardob"
                type="date"
                required
                value={formData.aadhaardob}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>

            <div>
              <input
                name="aadhaarname"
                type="text"
                required
                value={formData.aadhaarname}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <div className="flex space-x-4">
                <label className="inline-flex items-center">
                <input
                    type="radio"
                    name="aadhaargender"
                    value="male"
                    checked={formData.aadhaargender === 'male'}
                    onChange={handleChange}
                    required
                    className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Male</span>
                </label>
                <label className="inline-flex items-center">
                <input
                    type="radio"
                    name="aadhaargender"
                    value="female"
                    checked={formData.aadhaargender === 'female'}
                    onChange={handleChange}
                    required
                    className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Female</span>
                </label>
                <label className="inline-flex items-center">
                <input
                    type="radio"
                    name="aadhaargender"
                    value="other"
                    checked={formData.aadhaargender === 'other'}
                    onChange={handleChange}
                    required
                    className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">Other</span>
                </label>
            </div>
            </div>

            <div>
              <textarea
                name="aadhaaraddress"
                required
                value={formData.aadhaaraddress}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Address"
                rows="3"
              />
            </div>

            <div>
              <input
                name="aadhaarphone"
                type="tel"
                value={formData.aadhaarphone}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
                maxLength="10"
              />
            </div>

            <div>
              <input
                name="aadhaaremail"
                type="email"
                value={formData.aadhaaremail}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email Address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <input
                name="aadhaarphoto"
                type="file"
                required
                onChange={handleFileChange}
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                accept="image/*"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Submitting...' : 'Submit Aadhaar Information'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AadhaarForm;
