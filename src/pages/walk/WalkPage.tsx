import { useParams } from "react-router-dom";

/**
 * Walk Page - Main walk activity page
 * This is a placeholder for the walk feature implementation
 */
const WalkPage = () => {
  const { petId } = useParams();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Walk Activity</h1>
        <p className="text-slate-600">Walk feature coming soon for pet ID: {petId}</p>
      </div>
    </div>
  );
};

export default WalkPage;

