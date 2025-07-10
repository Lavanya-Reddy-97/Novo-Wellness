
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AggregateItem {
  category: string;
  percentage: number;
  trend: 'up' | 'down';
  change: number;
  studentCount: number;
}

interface AggregateTrendsProps {
  aggregateData: AggregateItem[];
  getRiskColor: (percentage: number) => string;
}

export const AggregateTrends = ({ aggregateData, getRiskColor }: AggregateTrendsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>School-wide Trends</CardTitle>
          <CardDescription>Average risk levels across all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>Current risk levels by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aggregateData.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getRiskColor(item.percentage)}`}>
                    {item.percentage}%
                  </span>
                  <span className="text-xs text-gray-500">({item.studentCount} students)</span>
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
