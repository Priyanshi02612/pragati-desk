export const mockPerformanceSeries = {
  completion: [
    { name: "Mon", completionRate: 78, delayRate: 12 },
    { name: "Tue", completionRate: 82, delayRate: 10 },
    { name: "Wed", completionRate: 86, delayRate: 8 },
    { name: "Thu", completionRate: 81, delayRate: 14 },
    { name: "Fri", completionRate: 91, delayRate: 5 },
  ],
  monthly: [
    { name: "Jan", performance: 83 },
    { name: "Feb", performance: 87 },
    { name: "Mar", performance: 89 },
    { name: "Apr", performance: 92 },
  ],
};

export const mockLeaderboard = {
  month: {
    name: "Naina Gill",
    score: 97,
    role: "Employee",
    achievement: "Highest completion streak and zero delay escalation",
  },
  year: {
    name: "Meera Joshi",
    score: 95,
    role: "Employee",
    achievement: "Top performer across quality and delivery metrics",
  },
  rankings: [
    { rank: 1, name: "Naina Gill", score: 97, trend: "+6%" },
    { rank: 2, name: "Meera Joshi", score: 95, trend: "+4%" },
    { rank: 3, name: "Rohan Nair", score: 91, trend: "+2%" },
    { rank: 4, name: "Kabir Shah", score: 82, trend: "-3%" },
  ],
};
