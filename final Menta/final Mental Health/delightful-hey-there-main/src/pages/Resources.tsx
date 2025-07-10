import { Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import ResourceGrid from "@/components/ResourceGrid";
import ResourceDetails from "./ResourceDetails";

const Resources = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { category } = useParams();
  const isDetailsPage = !!category;

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route
              index
              element={
                <>
                  <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      Mental Health Resources
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      Explore our collection of age-appropriate resources designed to help students understand and 
                      improve their mental wellbeing.
                    </p>
                  </div>
                  <ResourceGrid />
                </>
              }
            />
            <Route path=":category" element={<ResourceDetails />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Resources;
