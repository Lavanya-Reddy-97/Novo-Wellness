
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface AssessmentCategorySelectionProps {
  onCategorySelect: (categories: string[]) => void;
}

const AssessmentCategorySelection = ({ onCategorySelect }: AssessmentCategorySelectionProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    {
      id: "depression",
      name: "Depression",
      description: "Assess feelings of sadness, hopelessness, and emotional well-being"
    },
    {
      id: "stress",
      name: "Stress",
      description: "Evaluate stress levels related to studies, exams, and daily life"
    },
    {
      id: "adhd",
      name: "ADHD",
      description: "Screen for attention, focus, and hyperactivity symptoms"
    },
    {
      id: "anxiety",
      name: "Anxiety",
      description: "Assess anxiety levels and social interaction concerns"
    },
    {
      id: "wellbeing",
      name: "Overall Well-being",
      description: "Comprehensive assessment of life satisfaction and social connections"
    },
    {
      id: "overall",
      name: "Overall Test",
      description: "Complete assessment covering all areas"
    }
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      onCategorySelect(selectedCategories);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select Assessment Categories</CardTitle>
          <CardDescription>
            Choose the areas you'd like to be assessed on. You can select multiple categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {categories.map((category) => (
              <Card key={category.id} className="border-2 hover:border-teal-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor={category.id} className="cursor-pointer">
                        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={selectedCategories.length === 0}
              className="bg-teal-500 hover:bg-teal-600 px-8"
            >
              Start Assessment ({selectedCategories.length} selected)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentCategorySelection;
