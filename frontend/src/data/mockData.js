export const roles = ['Admin', 'Team Leader', 'Employee'];
export const ticketTypes = ['Bug', 'Task', 'Feature Request', 'Support', 'Improvement'];

export const users = [
  {
    id: 'admin-1',
    name: 'Asha Verma',
    email: 'asha@pragatidesk.com',
    role: 'Admin',
    department: 'Operations',
    performance: 96,
    avatar: 'AV',
  },
  {
    id: 'leader-1',
    name: 'Rohan Nair',
    email: 'rohan@pragatidesk.com',
    role: 'Team Leader',
    department: 'Support',
    performance: 91,
    avatar: 'RN',
  },
  {
    id: 'employee-1',
    name: 'Meera Joshi',
    email: 'meera@pragatidesk.com',
    role: 'Employee',
    department: 'Support',
    performance: 88,
    avatar: 'MJ',
  },
  {
    id: 'employee-2',
    name: 'Kabir Shah',
    email: 'kabir@pragatidesk.com',
    role: 'Employee',
    department: 'Support',
    performance: 82,
    avatar: 'KS',
  },
  {
    id: 'employee-3',
    name: 'Naina Gill',
    email: 'naina@pragatidesk.com',
    role: 'Employee',
    department: 'Engineering',
    performance: 93,
    avatar: 'NG',
  },
];

export const tickets = [
  {
    id: 'TCK-101',
    title: 'Customer onboarding delays',
    description:
      'Audit the onboarding workflow, identify document bottlenecks, and reduce turnaround time for newly created support tickets.',
    ticketType: 'Improvement',
    priority: 'High',
    status: 'Open',
    assignedLeaderId: 'leader-1',
    department: 'Support',
    createdAt: '2026-04-08',
  },
  {
    id: 'TCK-102',
    title: 'Quarterly productivity review',
    description:
      'Prepare the monthly and quarterly productivity summary, validate team scorecards, and align insights for manager review.',
    ticketType: 'Task',
    priority: 'Medium',
    status: 'Open',
    assignedLeaderId: 'leader-1',
    department: 'Operations',
    createdAt: '2026-04-11',
  },
];

export const tasks = [
  {
    id: 'TSK-301',
    ticketId: 'TCK-101',
    title: 'Validate document checklist',
    assigneeId: 'employee-1',
    status: 'In Progress',
    dueDate: '2026-04-16',
    timeSpent: 4650,
    delayReason: '',
  },
  {
    id: 'TSK-302',
    ticketId: 'TCK-101',
    title: 'Review KYC exceptions',
    assigneeId: 'employee-2',
    status: 'Delayed',
    dueDate: '2026-04-15',
    timeSpent: 2880,
    delayReason: 'Awaiting updated customer documents.',
  },
  {
    id: 'TSK-303',
    ticketId: 'TCK-102',
    title: 'Compile weekly scorecard',
    assigneeId: 'employee-3',
    status: 'Completed',
    dueDate: '2026-04-14',
    timeSpent: 5480,
    delayReason: '',
  },
  {
    id: 'TSK-304',
    ticketId: 'TCK-102',
    title: 'Prepare manager feedback summary',
    assigneeId: 'employee-1',
    status: 'Pending',
    dueDate: '2026-04-18',
    timeSpent: 0,
    delayReason: '',
  },
];

export const notifications = [
  {
    id: 'NTF-1',
    title: 'New ticket assigned',
    message: 'TCK-102 has been assigned to Rohan Nair.',
    type: 'assignment',
    read: false,
    role: 'Team Leader',
  },
  {
    id: 'NTF-2',
    title: 'Delay approval requested',
    message: 'Kabir submitted a delay request for TSK-302.',
    type: 'delay',
    read: false,
    role: 'Team Leader',
  },
  {
    id: 'NTF-3',
    title: 'Performance alert',
    message: 'Kabir Shah performance is below the 85% threshold.',
    type: 'performance',
    read: true,
    role: 'Admin',
  },
];

export const delayRequests = [
  {
    id: 'DL-1',
    taskId: 'TSK-302',
    employeeId: 'employee-2',
    reason: 'Awaiting updated customer documents.',
    status: 'Pending',
  },
];

export const performanceSeries = {
  completion: [
    { name: 'Mon', completionRate: 78, delayRate: 12 },
    { name: 'Tue', completionRate: 82, delayRate: 10 },
    { name: 'Wed', completionRate: 86, delayRate: 8 },
    { name: 'Thu', completionRate: 81, delayRate: 14 },
    { name: 'Fri', completionRate: 91, delayRate: 5 },
  ],
  monthly: [
    { name: 'Jan', performance: 83 },
    { name: 'Feb', performance: 87 },
    { name: 'Mar', performance: 89 },
    { name: 'Apr', performance: 92 },
  ],
};

export const leaderboard = {
  month: {
    name: 'Naina Gill',
    score: 97,
    role: 'Employee',
    achievement: 'Highest completion streak and zero delay escalation',
  },
  year: {
    name: 'Meera Joshi',
    score: 95,
    role: 'Employee',
    achievement: 'Top performer across quality and delivery metrics',
  },
  rankings: [
    { rank: 1, name: 'Naina Gill', score: 97, trend: '+6%' },
    { rank: 2, name: 'Meera Joshi', score: 95, trend: '+4%' },
    { rank: 3, name: 'Rohan Nair', score: 91, trend: '+2%' },
    { rank: 4, name: 'Kabir Shah', score: 82, trend: '-3%' },
  ],
};
