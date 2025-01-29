import Lottie from "lottie-react";

const FeatureCard = ({ title, description, animationData }) => {
  return (
    <div className="w-80 p-4 bg-gradient-to-b from-[#CDC1FF] shadow-lg rounded-lg border border-gray-200 text-center">
      {/* Lottie Animation */}
      <div className="flex justify-center">
        <Lottie animationData={animationData} className="w-24 h-24" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mt-4">{title}</h2>

      {/* Description */}
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
};

export default FeatureCard;
