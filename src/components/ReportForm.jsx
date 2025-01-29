import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import MapComponent from './MapComponent';

function ReportForm() {
  const [formData, setFormData] = useState({
    missing_aadhaar: '',
    missingdate: '',
    missingplace: '',
    missingphoto: null,
    characteristics: '',
    contactno: '',
    email: '',
    latitude: '', // New field for latitude
    longitude: '' // New field for longitude
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
    setFormData(prev => ({
      ...prev,
      missingphoto: e.target.files[0]
    }));
  };

  const handleLocationSelect = (lat, lon) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      missingplace: `Lat: ${lat}, Lon: ${lon}` // Optionally update the place field
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

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/report_missing`, {
        method: 'POST',
        headers: {
          'x-access-token': token
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      navigate('/success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-[#A294F9] mb-6">Report Missing Person</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Missing Person's Aadhaar Number</label>
              <input
                type="text"
                name="missing_aadhaar"
                value={formData.missing_aadhaar}
                onChange={handleChange}
                pattern="[0-9]{12}"
                className="mt-1 block w-full rounded-md border border-[#A294F9] shadow-sm shadow-[0px_4px_10px_rgba(162,148,249,0.5)] focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Missing Date</label>
              <input
                type="date"
                name="missingdate"
                value={formData.missingdate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-[#A294F9]  shadow-sm shadow-[0px_4px_10px_rgba(162,148,249,0.5)] focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div className=''>
              <label className="block text-sm font-medium text-gray-700">Missing Place</label>
              <MapComponent onLocationSelect={handleLocationSelect} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Physical Characteristics</label>
              <textarea
                name="characteristics"
                value={formData.characteristics}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-[#A294F9]  shadow-sm shadow-[0px_4px_10px_rgba(162,148,249,0.5)] focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Height, weight, identifying marks, clothing worn when last seen, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                name="contactno"
                value={formData.contactno}
                onChange={handleChange}
                pattern="[0-9]{10}"
                className="mt-1 block w-full rounded-md border border-[#A294F9]  shadow-sm shadow-[0px_4px_10px_rgba(162,148,249,0.5)] focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-[#A294F9]  shadow-sm shadow-[0px_4px_10px_rgba(162,148,249,0.5)] focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <input
                type="file"
                name="missingphoto"
                onChange={handleFileChange}
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#A294F9] file:text-white
                  hover:file:bg-[#E5D9F2]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#A294F9] text-white px-6 py-2 shadow-sm shadow-[0px_4px_10px_rgba(162,148,249,0.5)] rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportForm;