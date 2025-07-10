
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";

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

interface ProgressSidebarProps {
  assessmentData: AssessmentData[];
  getRiskColor: (percentage: number) => string;
  onExportData: () => void;
}

export const ProgressSidebar = ({ 
  assessmentData, 
  getRiskColor, 
  onExportData 
}: ProgressSidebarProps) => {
  const latestAssessment = assessmentData.length > 0 ? assessmentData[assessmentData.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Personal Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Assessments</span>
            <Badge variant="outline">{assessmentData.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">This Month</span>
            <Badge variant="outline">
              {assessmentData.filter(a => 
                new Date(a.completed_at).getMonth() === new Date().getMonth()
              ).length}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last Assessment</span>
            <Badge variant="outline">
              {assessmentData.length > 0 
                ? new Date(assessmentData[assessmentData.length - 1].completed_at).toLocaleDateString()
                : 'None'
              }
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Latest Results */}
      {latestAssessment && latestAssessment.results && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(latestAssessment.results as AssessmentResult).map(([category, percentage]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className={`text-sm font-bold ${getRiskColor(percentage as number)}`}>
                    {percentage}%
                  </span>
                </div>
                <Progress value={percentage as number} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            className="w-full bg-teal-500 hover:bg-teal-600"
            onClick={() => window.location.href = '/assessment'}
          >
            Take New Assessment
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/resources'}
          >
            View Resources
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onExportData}
          >
            Export My Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
