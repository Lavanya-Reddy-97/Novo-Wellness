import { useState, useEffect, useCallback } from "react";
import { 
  Download, 
  Search, 
  Filter, 
  Plus,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchSchoolAnalytics, 
  fetchStudents, 
  Student,
  type Student as StudentType,
  type SchoolAnalytics
} from "@/services/schoolDataService";
import { AnalyticsOverview } from "@/components/school-dashboard/AnalyticsOverview";
import { RiskDistributionChart } from "@/components/school-dashboard/RiskDistributionChart";
import { GradeDistributionChart } from "@/components/school-dashboard/GradeDistributionChart";
import { StudentsTable } from "@/components/school-dashboard/StudentsTable";
import { StudentDetailDialog } from "@/components/school-dashboard/StudentDetailDialog";
import { format } from 'date-fns';
import Footer from "@/components/Footer";

const SchoolDashboard = () => {
  const { user } = useAuth();
  // SchoolAnalytics type is now imported from schoolDataService

  const [analytics, setAnalytics] = useState<SchoolAnalytics | null>(null);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
  const [showManualCheck, setShowManualCheck] = useState(false);
  const [manualCheckData, setManualCheckData] = useState({
    studentId: '',
    checkType: 'wellness',
    notes: ''
  });
  type SortableField = keyof Pick<StudentType, 'name' | 'grade' | 'risk_level' | 'last_assessment' | 'wellbeing_score'>;

  const [sortConfig, setSortConfig] = useState<{ 
    key: SortableField; 
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc'
  });
  const { toast } = useToast();
  
  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        // Get school info from user demographics
        const schoolInfo = user?.demographics ? {
          school: user.demographics.school,
          branch: user.demographics.branch,
          state: user.demographics.state,
          city: user.demographics.city,
          pincode: user.demographics.pincode,
        } : null;

        const missingFields = !schoolInfo || Object.values(schoolInfo).some(v => !v);
        if (missingFields) {
          setLoading(false);
          setAnalytics(null);
          setStudents([]);
          setFilteredStudents([]);
          return;

        }

        const [analyticsData, studentsData] = await Promise.all([
          fetchSchoolAnalytics(schoolInfo),
          fetchStudents(schoolInfo)
        ]);
        
        if (isMounted) {
          setAnalytics(analyticsData);
          setStudents(studentsData);
          setFilteredStudents(studentsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load data. Please try again later.',
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [toast]);
  
  // Apply filters and sorting when dependencies change
  useEffect(() => {
    let result = [...students];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.name.toLowerCase().includes(term) || 
        student.email.toLowerCase().includes(term)
      );
    }
    
    // Apply grade filter
    if (gradeFilter !== 'all') {
      result = result.filter(student => student.grade === gradeFilter);
    }
    
    // Apply risk filter
    if (riskFilter !== 'all') {
      result = result.filter(student => student.risk_level === riskFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof StudentType];
        const bValue = b[sortConfig.key as keyof StudentType];
        
        if (sortConfig.key === 'name' || sortConfig.key === 'grade' || sortConfig.key === 'risk_level') {
          const aStr = String(aValue);
          const bStr = String(bValue);
          return sortConfig.direction === 'asc' 
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        } else if (sortConfig.key === 'wellbeing_score') {
          const aNum = Number(aValue);
          const bNum = Number(bValue);
          return sortConfig.direction === 'asc' 
            ? aNum - bNum
            : bNum - aNum;
        } else if (sortConfig.key === 'last_assessment') {
          const aDate = new Date(aValue as string).getTime();
          const bDate = new Date(bValue as string).getTime();
          return sortConfig.direction === 'asc'
            ? aDate - bDate
            : bDate - aDate;
        }
        
        return 0;
      });
    }
    
    setFilteredStudents(result);
  }, [searchTerm, gradeFilter, riskFilter, students, sortConfig]);
  
  // Handle sort column click
  const requestSort = (key: SortableField) => {
    setSortConfig(prevConfig => {
      // If clicking the same column, toggle direction
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // If clicking a new column, default to ascending
      return { key, direction: 'asc' };
    });
  };
  
  // Export data to CSV
  const handleViewDetails = (student: StudentType) => {
    setSelectedStudent(student);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
  };

  const handleInterventionComplete = (interventionId: string) => {
    // In a real app, this would update the intervention status in the database
    toast({
      title: "Intervention Updated",
      description: "The intervention has been marked as completed.",
    });
    
    // Update local state to reflect the change
    if (selectedStudent) {
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          const updatedInterventions = student.interventions.map(int => 
            `int-${student.interventions.indexOf(int)}` === interventionId 
              ? { ...int, status: 'completed' as const }
              : int
          );
          return { ...student, interventions: updatedInterventions };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      setSelectedStudent(prev => {
        if (!prev) return null;
        const interventionIndex = prev.interventions.findIndex(
          (_, i) => `int-${i}` === interventionId
        );
        if (interventionIndex === -1) return prev;
        
        const updatedInterventions = [...prev.interventions];
        updatedInterventions[interventionIndex] = {
          ...updatedInterventions[interventionIndex],
          status: 'completed' as const
        };
        
        return { ...prev, interventions: updatedInterventions };
      });
    }
  };

  const handleManualCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, this would save the manual check to the database
      toast({
        title: 'Manual Check Recorded',
        description: `Manual ${manualCheckData.checkType} check recorded for student ID: ${manualCheckData.studentId}`,
      });
      
      // Reset form
      setManualCheckData({
        studentId: '',
        checkType: 'wellness',
        notes: ''
      });
      setShowManualCheck(false);
    } catch (error) {
      console.error('Error recording manual check:', error);
      toast({
        title: 'Error',
        description: 'Failed to record manual check. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const exportToCSV = useCallback(() => {
    if (filteredStudents.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no students to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['ID', 'Name', 'Grade', 'Risk Level', 'Last Assessment'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.id,
        `"${student.name}"`,
        student.grade,
        student.risk_level,
        format(new Date(student.last_assessment), 'MMM d, yyyy'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export successful',
      description: `Exported ${filteredStudents.length} students to CSV`,
    });
  }, [filteredStudents, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading school dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const schoolInfo = user?.demographics ? {
    school: user.demographics.school,
    branch: user.demographics.branch,
    state: user.demographics.state,
    city: user.demographics.city,
    pincode: user.demographics.pincode,
  } : null;
  const missingFields = !schoolInfo || Object.values(schoolInfo).some(v => !v);

  if (missingFields) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                <div className="font-bold mb-1">School Information Missing</div>
                <div>
                  Please update your profile with all required school details (school, branch, state, city, pincode) to view analytics for your school.
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">School Dashboard</h1>
        </div>
        {/* High Risk Notification Banner */}
        {filteredStudents.some(s => s.risk_level === 'high') && (
          <div
            className="flex items-center gap-3 bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg my-4 shadow-md"
            role="alert"
            aria-live="polite"
          >
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">Attention:</span> High-risk students detected! Please review and intervene as soon as possible.
            </div>
          </div>
        )}
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>
                Overview of student risk levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskDistributionChart data={analytics?.riskDistribution || { low: 0, medium: 0, high: 0 }} />
              {!analytics && (
                <div className="text-center text-gray-400 text-sm mt-2">No risk data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>
                Distribution of students by grade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GradeDistributionChart data={analytics?.gradeDistribution || {}} />
              {!analytics && (
                <div className="text-center text-gray-400 text-sm mt-2">No grade data available</div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-9 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4 opacity-50" />
                    <span>Grade: {gradeFilter === 'all' ? 'All' : gradeFilter}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {[6, 7, 8, 9, 10].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4 opacity-50" />
                    <span>
                      Risk: {riskFilter === 'all' ? 'All' : riskFilter.charAt(0).toUpperCase() + riskFilter.slice(1)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  className="gap-2 flex-1 md:flex-initial"
                  onClick={() => setShowManualCheck(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Manual Check</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StudentsTable 
              students={filteredStudents} 
              onSort={requestSort} 
              sortConfig={sortConfig}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>
      </main>

      {/* Student Detail Dialog */}
      {selectedStudent && (
        <StudentDetailDialog 
          student={selectedStudent} 
          onClose={handleCloseDetails}
          onInterventionComplete={handleInterventionComplete}
        >
          {null}
        </StudentDetailDialog>
      )}
      
      {/* Manual Check Dialog */}
      {showManualCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Record Manual Check</CardTitle>
              <CardDescription>
                Record a manual wellness or behavior check for a student
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleManualCheck}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="Enter student ID"
                    value={manualCheckData.studentId}
                    onChange={(e) => 
                      setManualCheckData({...manualCheckData, studentId: e.target.value})
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkType">Check Type</Label>
                  <Select
                    value={manualCheckData.checkType}
                    onValueChange={(value) => 
                      setManualCheckData({...manualCheckData, checkType: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select check type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wellness">Wellness Check</SelectItem>
                      <SelectItem value="behavior">Behavior Check</SelectItem>
                      <SelectItem value="academic">Academic Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add any relevant notes..."
                    value={manualCheckData.notes}
                    onChange={(e) => 
                      setManualCheckData({...manualCheckData, notes: e.target.value})
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowManualCheck(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Check
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default SchoolDashboard;
