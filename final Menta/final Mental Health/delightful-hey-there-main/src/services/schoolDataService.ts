import { db } from "@/integrations/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  risk_level: 'low' | 'medium' | 'high';
  last_assessment: string;
  wellbeing_score: number;
  attendance: number;
  interventions: {
    type: string;
    date: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  }[];
  assessments: {
    date: string;
    score: number;
    category: string;
  }[];
}

export interface SchoolAnalytics {
  totalStudents: number;
  highRiskStudents: number;
  interventionsThisMonth: number;
  averageWellbeingScore: number;
  wellbeingTrend: 'improving' | 'declining' | 'stable';
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  gradeDistribution: Record<string, number>;
  recentAssessments: Array<{
    date: string;
    count: number;
  }>;
}

export const fetchSchoolAnalytics = async (filters: {
  school: string;
  branch: string;
  state: string;
  city: string;
  pincode: string;
}): Promise<SchoolAnalytics> => {
  // 1. Query demographics for all students in this school/branch
  const studentsQuery = query(
    collection(db, "demographics"),
    where("school", "==", filters.school),
    where("branch", "==", filters.branch),
    where("state", "==", filters.state),
    where("city", "==", filters.city),
    where("pincode", "==", filters.pincode)
  );
  const studentsSnapshot = await getDocs(studentsQuery);
  const studentIds = studentsSnapshot.docs.map(doc => doc.id);
  const studentsData = studentsSnapshot.docs.map(doc => doc.data());
  console.log('[fetchSchoolAnalytics] Students found:', studentIds.length, studentIds);

  // 2. Batch query for moods and aggregate
  let allMoods: any[] = [];
  const batchSize = 10;
  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batchIds = studentIds.slice(i, i + batchSize);
    const moodsQuery = query(
      collection(db, "moods"),
      where("user_id", "in", batchIds)
    );
    const moodsSnapshot = await getDocs(moodsQuery);
    allMoods = allMoods.concat(moodsSnapshot.docs.map(doc => doc.data()));
  }
  console.log('[fetchSchoolAnalytics] Total moods found:', allMoods.length);

  // 3. Calculate analytics
  const totalStudents = studentIds.length;
  const highRiskStudents = studentsData.filter(s => s.risk_level === 'high').length;
  // Calculate risk distribution
  const riskDistribution = {
    low: studentsData.filter(s => s.risk_level === 'low').length,
    medium: studentsData.filter(s => s.risk_level === 'medium').length,
    high: studentsData.filter(s => s.risk_level === 'high').length,
  };
  // Calculate grade distribution
  const gradeDistribution: Record<string, number> = {};
  studentsData.forEach(s => {
    if (s.grade) gradeDistribution[s.grade] = (gradeDistribution[s.grade] || 0) + 1;
  });
  // Calculate average wellbeing score
  const wellbeingScores = allMoods.map(m => m.mood_score).filter((score: number) => typeof score === 'number');
  const averageWellbeingScore = wellbeingScores.length > 0 ? (wellbeingScores.reduce((a, b) => a + b, 0) / wellbeingScores.length) : 0;
  // Placeholder for interventions
  const interventionsThisMonth = 0;
  const analyticsObj = {
    totalStudents,
    highRiskStudents,
    interventionsThisMonth,
    averageWellbeingScore,
    wellbeingTrend: 'stable' as 'stable', // TODO: Implement real trend logic
    riskDistribution,
    gradeDistribution,
    recentAssessments: [], // TODO: Implement real recent assessments
  };
  console.log('[fetchSchoolAnalytics] Computed analytics:', analyticsObj);
  return analyticsObj;
};

export const fetchStudents = async (filters: {
  school: string;
  branch: string;
  state: string;
  city: string;
  pincode: string;
}) => {
  const studentsQuery = query(
    collection(db, "demographics"),
    where("school", "==", filters.school),
    where("branch", "==", filters.branch),
    where("state", "==", filters.state),
    where("city", "==", filters.city),
    where("pincode", "==", filters.pincode)
  );
  const studentsSnapshot = await getDocs(studentsQuery);
  return studentsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      email: data.email || '',
      grade: data.grade || '',
      section: data.section || '',
      risk_level: data.risk_level || 'low',
      last_assessment: data.last_assessment || '',
      wellbeing_score: typeof data.wellbeing_score === 'number' ? data.wellbeing_score : 0,
      attendance: typeof data.attendance === 'number' ? data.attendance : 0,
      interventions: Array.isArray(data.interventions) ? data.interventions : [],
      assessments: Array.isArray(data.assessments) ? data.assessments : [],
    };
  });
};

