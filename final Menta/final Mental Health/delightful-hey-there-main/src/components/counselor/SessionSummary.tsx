
import { useState } from 'react';
import { CheckCircle, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SessionSummaryProps = {
  summary: {
    focusArea: string;
    keyPoints: string[];
    actionPlan: string[];
  };
  className?: string;
  onComplete?: () => void;
  onScheduleFollowUp?: () => void;
};

export function SessionSummary({
  summary,
  className,
  onComplete,
  onScheduleFollowUp,
}: SessionSummaryProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete?.();
  };

  return (
    <div className={cn("space-y-6 bg-white p-6 rounded-lg shadow-sm border", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Session Summary</h3>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Focus Area</h4>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <p>{summary.focusArea}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Points</h4>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Action Plan</h4>
          <ul className="space-y-2">
            {summary.actionPlan.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleComplete}
          variant={isCompleted ? "outline" : "default"}
          className="flex-1"
          disabled={isCompleted}
        >
          {isCompleted ? 'Completed' : 'Mark as Complete'}
        </Button>
        
        <Button
          onClick={onScheduleFollowUp}
          variant="outline"
          className="flex-1 gap-2"
        >
          <Calendar className="w-4 h-4" />
          Schedule Follow-up
        </Button>
      </div>
    </div>
  );
}
