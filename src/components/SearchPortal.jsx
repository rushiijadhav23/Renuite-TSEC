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
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const webcamRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setError(null);
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setIsCameraOpen(false);
      setSearchResults(null);
    }
  };

  const handleUploadToAPI = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/search_missing`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type header - let the browser set it with boundary
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        setError(null);
      } else {
        setError(data.message || 'Search failed. Please try again.');
        setSearchResults(null);
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
    setSelectedImage(null);
    setSelectedFile(null);
    setError(null);
    setSearchResults(null);
  };

  const handleCaptureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setSelectedImage(imageSrc);
      setIsCameraOpen(false);
      
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
        })
        .catch(err => {
          setError('Failed to process captured image');
          console.error(err);
        });
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#CDC1FF] to-white min-h-screen p-10">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-6">
          Search for Missing Persons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Search by Image */}
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
            {error && (
              <div className="text-red-500 mt-2 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            {searchResults && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <h3 className="text-green-700 font-semibold">Search Results</h3>
                {/* Display your search results here */}
              </div>
            )}
          </div>

          {/* Search by Aadhaar section */}
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
              onChange={(e) => setAadharNumber(e.target.value)}
            />
            <button className="mt-4 bg-[#A294F9] text-white px-6 py-3 rounded-md hover:bg-indigo-700">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPortal;
