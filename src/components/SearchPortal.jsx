import { useState, useRef } from "react";
import { Upload, Camera } from "lucide-react";
import Lottie from "lottie-react";
import Webcam from "react-webcam";
import { API_BASE_URL } from '../config/api';
import animationData from "./../../public/images/Animation - 1738133166117.json";
import animationData1 from "./../../public/images/Animation - 1738150811302.json";

function SearchPortal() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aadharNumber, setAadharNumber] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const webcamRef = useRef(null);
  const [data, setData] = useState(null);
  
  // Separate message states for each section
  const [imageSearchMessage, setImageSearchMessage] = useState(null);
  const [imageMessageType, setImageMessageType] = useState('error');
  const [aadharSearchMessage, setAadharSearchMessage] = useState(null);
  const [aadharMessageType, setAadharMessageType] = useState('error');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageSearchMessage('Please upload an image file');
        setImageMessageType('error');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setImageSearchMessage('Image size should be less than 5MB');
        setImageMessageType('error');
        return;
      }

      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setIsCameraOpen(false);
      setSearchResults(null);
      setImageSearchMessage(null);
    }
  };

  const handleUploadToAPI = async () => {
    if (!selectedFile) {
      setImageSearchMessage('Please select an image first');
      setImageMessageType('error');
      return;
    }

    setIsLoading(true);
    setImageSearchMessage(null);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      formData.append('latitude', position.coords.latitude);
      formData.append('longitude', position.coords.longitude);

      const response = await fetch(`${API_BASE_URL}/search_missing`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data_input = await response.json();
      
      if (data_input.matches_found) {
        console.log('Search successful:', data_input);
        setSearchResults(data_input.results);
        setData(data_input);
        setImageSearchMessage('Found a match!');
        setImageMessageType('success');
      } else {
        console.error('Search failed:', data_input);
        setData(data_input);
        setImageSearchMessage(data_input.message || 'No matches found.');
        setImageMessageType('error');
        setSearchResults(null);
      }

    } catch (error) {
      console.error('Error:', error);
      if (error.code === 1) {
        setImageSearchMessage('Please enable location access to continue');
      } else if (error.code === 2) {
        setImageSearchMessage('Location information is unavailable');
      } else if (error.code === 3) {
        setImageSearchMessage('Location request timed out');
      } else {
        setImageSearchMessage('Failed to upload image. Please try again.');
      }
      setImageMessageType('error');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAadhaarSearch = async () => {
    if (!aadharNumber) {
      setAadharSearchMessage('Please enter an Aadhaar number');
      setAadharMessageType('error');
      return;
    }

    setIsLoading(true);
    setAadharSearchMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/search_by_aadhaar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ aadhaar_number: aadharNumber })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let statusMessage;
      switch(data.status) {
        case 'missing':
          statusMessage = 'Person is reported missing';
          setAadharMessageType('error');
          break;
        case 'sighted':
          statusMessage = 'Person was last sighted';
          setAadharMessageType('warning');
          break;
        case 'found':
          statusMessage = 'Person has been found';
          setAadharMessageType('success');
          break;
        case 'neverlost':
          statusMessage = 'No missing person record found';
          setAadharMessageType('info');
          break;
        default:
          statusMessage = 'Status unknown';
          setAadharMessageType('error');
      }

      setAadharSearchMessage(statusMessage);
      setData(data);

    } catch (error) {
      console.error('Error:', error);
      setAadharSearchMessage('Failed to search. Please try again.');
      setAadharMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
    setSelectedImage(null);
    setSelectedFile(null);
    setImageSearchMessage(null);
    setSearchResults(null);
  };

  const handleCaptureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setSelectedImage(imageSrc);
      setIsCameraOpen(false);
      
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
          setImageSearchMessage('Image captured successfully!');
          setImageMessageType('success');
        })
        .catch(err => {
          setImageSearchMessage('Failed to process captured image');
          setImageMessageType('error');
          console.error(err);
        });
    }
  };

  const handleAadharInputChange = (e) => {
    setAadharNumber(e.target.value);
    setAadharSearchMessage(null);
  };
  return (
    <div className="bg-gradient-to-b from-[#CDC1FF] to-white min-h-screen p-10">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-6">
          Search for Missing Persons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Search Section */}
          <div className="p-6 border border-[#A294F9] rounded-xl text-center">
            {!selectedImage && !isCameraOpen && (
              <div className="flex justify-center">
                <Lottie animationData={animationData} className="w-34 h-34" />
              </div>
            )}
            {isCameraOpen && (
              <div className="box border-4 border-[#A294F9] p-2 rounded-lg">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg shadow-lg w-full"
                />
                <button
                  onClick={handleCaptureImage}
                  className="bg-[#A294F9] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-indigo-700 mt-4 mx-auto"
                >
                  Capture Image
                </button>
              </div>
            )}
            {selectedImage && !isCameraOpen && (
              <div className="mt-4">
                <div className="border-4 border-[#A294F9] p-2 rounded-lg">
                  <img
                    src={selectedImage}
                    alt="Captured or Uploaded"
                    className="rounded-lg shadow-lg max-w-xs mx-auto"
                  />
                </div>
                <button
                  onClick={handleUploadToAPI}
                  disabled={isLoading}
                  className="mt-4 bg-[#A294F9] text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    'Upload to Search'
                  )}
                </button>
              </div>
            )}
            {!isCameraOpen && (
              <div className="flex flex-col items-center gap-4 mt-4">
                <button
                  onClick={handleOpenCamera}
                  className="bg-[#A294F9] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-indigo-700"
                >
                  <Camera size={20} /> Open Camera
                </button>
                <label className="cursor-pointer bg-[#A294F9] text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-indigo-700">
                  <Upload size={20} /> Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}
            {imageSearchMessage && (
              <div className={`mt-2 p-2 rounded ${
                imageMessageType === 'success' ? 'bg-green-50 text-green-600' : 
                imageMessageType === 'error' ? 'bg-red-50 text-red-500' :
                imageMessageType === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {imageSearchMessage}
              </div>
            )}
            {searchResults && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <h3 className="text-green-700 font-semibold">Search Results</h3>
                {/* Add your search results display here */}
              </div>
            )}
          </div>

          {/* Aadhaar Search Section */}
          <div className="p-6 border border-[#A294F9] rounded-xl text-center">
            <div className="flex justify-center">
              <Lottie animationData={animationData1} className="w-34 h-34" />
            </div>
            <h3 className="text-2xl font-semibold text-[#A294F9] mb-4">
              Search by Aadhaar Number
            </h3>
            <input
              type="text"
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A294F9]"
              placeholder="Enter Aadhaar Number"
              value={aadharNumber}
              onChange={handleAadharInputChange}
            />
            <button 
              onClick={handleAadhaarSearch}
              disabled={isLoading}
              className="mt-4 bg-[#A294F9] text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
            {aadharSearchMessage && (
              <div className={`mt-2 p-2 rounded ${
                aadharMessageType === 'success' ? 'bg-green-50 text-green-600' : 
                aadharMessageType === 'error' ? 'bg-red-50 text-red-500' :
                aadharMessageType === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {aadharSearchMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPortal;
