import { useState, useRef } from "react";
import { Upload, Camera } from "lucide-react";
import Lottie from "lottie-react";
import animationData from "./../../public/images/Animation - 1738133166117.json";
import animationData1 from "./../../public/images/Animation - 1738150811302.json";

function SearchPortal() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [aadharNumber, setAadharNumber] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setSelectedImage(canvas.toDataURL("image/png"));
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraOpen(false);
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
            {isCameraOpen ? (
              <div className="flex flex-col items-center gap-4">
                <video ref={videoRef} autoPlay className="rounded-lg shadow-lg max-w-xs mx-auto" />
                <button
                  onClick={handleCaptureImage}
                  className="bg-[#A294F9] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-indigo-700"
                >
                  Capture Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <label className="cursor-pointer bg-[#A294F9] text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-indigo-700">
                  <Upload size={20} /> Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <button
                  onClick={handleOpenCamera}
                  className="bg-[#A294F9] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-indigo-700"
                >
                  <Camera size={20} /> Open Camera
                </button>
              </div>
            )}
            {selectedImage && !isCameraOpen && (
              <div className="mt-4">
                <img
                  src={selectedImage}
                  alt="Captured or Uploaded"
                  className="rounded-lg shadow-lg max-w-xs mx-auto"
                />
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Search by Aadhaar */}
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
