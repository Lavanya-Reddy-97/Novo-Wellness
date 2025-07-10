export const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/wellness-dashboard': 'Wellness',
  '/cognitive-tasks': 'Cognitive Tasks',
  '/buddysafe': 'BuddySafe',
  '/assessment': 'Assessment',
  '/assessment/new': 'New Assessment',
  '/my-assessments': 'My Assessments',
  '/progress-tracking': 'Progress Tracking',
  '/profile-settings': 'Profile Settings',
  '/resources': 'Resources',
  '/resources/:id': 'Resource Details',
  '/school-dashboard': 'School Dashboard',
  '/student-dashboard': 'Student Dashboard',
  '/chat': 'Chat',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/analytics': 'Analytics',
  '/school-settings': 'School Settings',
  // Safety pages
  '/safety/cyberbullying': 'Cyberbullying Safety',
  '/safety/physical-bullying': 'Physical Bullying Safety',
  '/safety/academic-pressure': 'Academic Pressure Safety',
  '/safety/substance-abuse': 'Substance Abuse Safety',
};

export const getPageTitle = (path: string): string => {
  return pageTitles[path] || 'Novo Wellness';
};
