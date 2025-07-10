
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssessmentResult {
  depression?: number;
  stress?: number;
  anxiety?: number;
  adhd?: number;
  wellbeing?: number;
  overall?: number;
}

interface AssessmentData {
  id: string;
  user_id: string;
  categories: string[];
  responses: any;
  results?: AssessmentResult;
  completed_at: string;
}

interface AssessmentHistoryProps {
  assessmentData: AssessmentData[];
  getRiskLevel: (percentage: number) => string;
  getRiskBadgeColor: (level: string) => string;
}

export const AssessmentHistory = ({ 
  assessmentData, 
  getRiskLevel, 
  getRiskBadgeColor 
}: AssessmentHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment History</CardTitle>
        <CardDescription>Your completed assessments and results</CardDescription>
      </CardHeader>
      <CardContent>
        {assessmentData.length > 0 ? (
          <div className="space-y-4">
            {assessmentData.slice(-5).reverse().map((assessment, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {assessment.categories.map((cat: string) => 
                        cat.charAt(0).toUpperCase() + cat.slice(1)
                      ).join(', ')} Assessment
                    </p>
                    <p className="text-sm text-gray-500">
                      Completed on {new Date(assessment.completed_at).toLocaleDateString()}
                    </p>
                    {assessment.results && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(assessment.results).map(([category, score]) => (
                          <Badge 
                            key={category}
                            className={getRiskBadgeColor(getRiskLevel(score as number).split(' ')[0])}
                          >
                            {category}: {score}%
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">
                    {assessment.categories.length} {assessment.categories.length === 1 ? 'Category' : 'Categories'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No assessments completed yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
