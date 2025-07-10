
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressData {
  date: string;
  depression: number;
  stress: number;
  anxiety: number;
  wellbeing: number;
}

interface IndividualStudentProgressProps {
  selectedStudent: string;
  progressData: ProgressData[];
}

export const IndividualStudentProgress = ({ 
  selectedStudent, 
  progressData 
}: IndividualStudentProgressProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Student Progress - {selectedStudent}</CardTitle>
        <CardDescription>
          Risk history over time with comparison to school averages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="depression" stroke="#ef4444" strokeWidth={2} name="Depression" />
              <Line type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={2} name="Stress" />
              <Line type="monotone" dataKey="anxiety" stroke="#eab308" strokeWidth={2} name="Anxiety" />
              <Line type="monotone" dataKey="wellbeing" stroke="#22c55e" strokeWidth={2} name="Wellbeing" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-medium text-sm text-gray-600 mb-2">Student Average</h4>
            <div className="text-2xl font-bold text-blue-600">65%</div>
            <p className="text-xs text-gray-500">Risk Score</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium text-sm text-gray-600 mb-2">School Average</h4>
            <div className="text-2xl font-bold text-gray-600">58%</div>
            <p className="text-xs text-gray-500">Risk Score</p>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
