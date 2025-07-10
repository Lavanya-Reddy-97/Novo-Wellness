
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProgressData {
  date: string;
  depression: number;
  stress: number;
  anxiety: number;
  wellbeing: number;
}

interface PersonalProgressChartProps {
  progressData: ProgressData[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const PersonalProgressChart = ({ 
  progressData, 
  selectedCategory = 'all',
  onCategoryChange = () => {}
}: PersonalProgressChartProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            My Progress Over Time
          </CardTitle>
          <CardDescription>
            Your risk score trends across different assessment categories
          </CardDescription>
        </div>
        <div className="w-48">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="depression">Depression</SelectItem>
              <SelectItem value="stress">Stress</SelectItem>
              <SelectItem value="anxiety">Anxiety</SelectItem>
              <SelectItem value="wellbeing">Wellbeing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {progressData.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                {selectedCategory === 'all' || selectedCategory === 'depression' ? (
                  <Line type="monotone" dataKey="depression" stroke="#ef4444" strokeWidth={2} name="Depression" />
                ) : null}
                {selectedCategory === 'all' || selectedCategory === 'stress' ? (
                  <Line type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={2} name="Stress" />
                ) : null}
                {selectedCategory === 'all' || selectedCategory === 'anxiety' ? (
                  <Line type="monotone" dataKey="anxiety" stroke="#eab308" strokeWidth={2} name="Anxiety" />
                ) : null}
                {selectedCategory === 'all' || selectedCategory === 'wellbeing' ? (
                  <Line type="monotone" dataKey="wellbeing" stroke="#22c55e" strokeWidth={2} name="Wellbeing" />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-4">No assessment data available yet.</p>
              <Button 
                className="bg-teal-500 hover:bg-teal-600"
                onClick={() => window.location.href = '/assessment'}
              >
                Take Your First Assessment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
