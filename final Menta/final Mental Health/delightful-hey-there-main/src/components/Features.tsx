
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MentalHealthTipsCarousel from "./MentalHealthTipsCarousel";

const Features = () => {
  const features = [
    {
      title: "Mental Health Assessment",
      description: "Comprehensive assessments covering stress, depression, eating behaviors, and more.",
      icon: "🧠",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Personalized Resources",
      description: "Age-appropriate resources and activities tailored to your specific needs.",
      icon: "📚",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "School Support",
      description: "Connect with school counselors and administrators for additional support.",
      icon: "🏫",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Progress Tracking",
      description: "Monitor your mental health journey with regular check-ins and assessments.",
      icon: "📈",
      color: "bg-orange-50 border-orange-200"
    }
  ];

  return (
    <div className="bg-white">
      {/* Enhanced Mental Health Awareness Section */}
      <div className="w-full flex flex-col items-center justify-center py-12 px-2 bg-gradient-to-r from-teal-50/80 via-blue-50/90 to-purple-50/80 border-b border-blue-100 mb-12 shadow-lg rounded-b-3xl">
        {/* SVG Illustration */}
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="40" rx="55" ry="30" fill="#E0F7FA" />
          <circle cx="60" cy="40" r="22" fill="#80DEEA" />
          <path d="M60 25 Q65 35 60 55 Q55 35 60 25" stroke="#00838F" strokeWidth="2" fill="none" />
          <circle cx="54" cy="38" r="2" fill="#00838F" />
          <circle cx="66" cy="38" r="2" fill="#00838F" />
          <path d="M56 48 Q60 52 64 48" stroke="#00838F" strokeWidth="2" fill="none" />
        </svg>
        <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-teal-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg text-center">
          Your Mind Matters
        </h2>
        {/* Tip Carousel (simple auto-rotating tips) */}
        <MentalHealthTipsCarousel />
      </div>
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`${feature.color} border-2 border-accent/30 rounded-xl shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 p-6`}> 
                <CardHeader className="text-center">
                  <div className="text-5xl mb-4 drop-shadow-md">{feature.icon}</div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
