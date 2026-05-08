import {
  ChevronLeft,
  ChevronRight,
  Download,
  Medal,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { DEPARTMENT_OPTIONS } from "../constants/departments";
import { formatNumber, formatPercent } from "../utils/format";

const VIEW_OPTIONS = [
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
];

const rankTone = (rank) => {
  if (rank === 1) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (rank === 2) {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  if (rank === 3) {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-slate-200 bg-white text-slate-500";
};

const buildScoreLabel = (value) => {
  const numericValue = Number(value) || 0;
  return formatNumber(Math.round(numericValue * 50.4));
};

const ITEMS_PER_PAGE = 5;

const getScoreKey = (view) => {
  if (view === "yearly") {
    return "yearScore";
  }

  if (view === "quarterly") {
    return "quarterScore";
  }

  return "monthScore";
};

export const AdminLeaderboardPage = () => {
  const { leaderboard, users } = useAppContext();
  const [activeView, setActiveView] = useState("monthly");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const employees = useMemo(
    () => users.filter((user) => user.role === "Employee"),
    [users],
  );

  const employeeLookup = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const rankings = useMemo(
    () =>
      (leaderboard.rankings || []).map((entry) => {
        const employee = employeeLookup.get(entry.id);

        return {
          ...entry,
          role: employee?.department || "Operations",
          title: employee?.role || "Employee",
          avatar: employee?.avatar || "",
          performance: employee?.performance ?? entry.score ?? 0,
          monthScore: entry.monthScore ?? entry.score ?? 0,
          quarterScore: entry.quarterScore ?? entry.score ?? 0,
          yearScore: entry.yearScore ?? entry.score ?? 0,
        };
      }),
    [employeeLookup, leaderboard.rankings],
  );

  const scoreKey = getScoreKey(activeView);

  const filteredRankings = useMemo(() => {
    const scopedRankings =
      selectedDepartment === "All"
        ? rankings
        : rankings.filter((entry) => entry.role === selectedDepartment);

    return [...scopedRankings]
      .sort((left, right) => {
        const scoreDiff = (right[scoreKey] || 0) - (left[scoreKey] || 0);

        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return left.name.localeCompare(right.name);
      })
      .map((entry, index) => ({
        ...entry,
        activeScore: entry[scoreKey] || 0,
        totalPoints: buildScoreLabel(entry[scoreKey]),
        viewRank: index + 1,
      }));
  }, [rankings, scoreKey, selectedDepartment]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, selectedDepartment]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRankings.length / ITEMS_PER_PAGE),
  );
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const spotlight = filteredRankings[0] || null;
  const secondarySpotlight = filteredRankings[1] || spotlight;
  const spotlightMeta =
    activeView === "yearly"
      ? leaderboard.year
      : activeView === "quarterly"
        ? leaderboard.quarter
        : leaderboard.month;
  const spotlightName = spotlight?.name || spotlightMeta?.name || "No data yet";
  const spotlightRole = spotlight?.role || spotlightMeta?.role || "Employee";
  const spotlightAchievement =
    spotlightMeta?.achievement ||
    "Top performance summary will appear once ranked employee activity is available.";
  const spotlightScore = spotlight?.activeScore ?? spotlightMeta?.score ?? 0;
  const spotlightStats = {
    solved: Math.max(36, Math.round((spotlightScore || 0) * 1.46)),
    rating: ((spotlightScore || 0) / 20).toFixed(1),
  };

  const showingLabel = filteredRankings.length
    ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredRankings.length)} of ${formatNumber(filteredRankings.length)} employees`
    : "Showing 0 of 0 employees";

  const handleExport = () => {
    const csvRows = [
      [
        "Rank",
        "Employee",
        "Department",
        "Title",
        "Score",
        "Efficiency",
        "Trend",
      ],
      ...filteredRankings.map((employee) => [
        employee.viewRank,
        employee.name,
        employee.role,
        employee.title,
        employee.activeScore,
        employee.performance,
        employee.trend || "0%",
      ]),
    ];

    const csvContent = csvRows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `leaderboard-${activeView}-${selectedDepartment.toLowerCase()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="space-y-5">
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-white/80 bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white shadow-soft">
        <div>
          <h1 className="text-[2.15rem] font-semibold tracking-[-0.03em]">
            Performance Leaderboard
          </h1>
          <p className="mt-2 text-[0.96rem]">
            Celebrating excellence and driving impact across PragatiDesk.
          </p>
        </div>

        <div className="flex rounded-2xl border border-brand-border/80 bg-white p-1 shadow-soft">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`rounded-xl px-5 py-2.5 text-[0.95rem] font-medium transition ${
                activeView === option.key
                  ? "bg-emerald-50 text-brand-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => setActiveView(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-border/60 px-6 py-5">
            <div>
              <h2 className="text-[1.05rem] font-semibold text-slate-950">
                Top 10 Performance Ranking
              </h2>
              <p className="mt-1.5 max-w-xl text-[0.95rem] leading-7 text-slate-500">
                Real-time stats based on tickets, reviews, and collaboration.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-2xl border border-brand-border/80 bg-white px-4 py-2.5 text-[0.95rem] font-medium text-slate-900 transition hover:bg-slate-50">
                <SlidersHorizontal size={16} />
                <select
                  className="bg-transparent"
                  value={selectedDepartment}
                  onChange={(event) =>
                    setSelectedDepartment(event.target.value)
                  }
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENT_OPTIONS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-brand-border/80 bg-white px-4 py-2.5 text-[0.95rem] font-medium text-slate-900 transition hover:bg-slate-50"
                onClick={handleExport}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/90 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Total Points</th>
                  <th className="px-6 py-4">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 bg-white">
                {paginatedRankings.length ? (
                  paginatedRankings.map((employee) => (
                    <tr
                      key={
                        employee.id || `${employee.viewRank}-${employee.name}`
                      }
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-[0.95rem] font-semibold ${rankTone(employee.viewRank)}`}
                        >
                          {employee.viewRank}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={employee.avatar}
                            name={employee.name}
                            size="sm"
                          />
                          <div>
                            <p className="text-[0.98rem] font-semibold text-slate-950">
                              {employee.name}
                            </p>
                            <p className="text-[0.93rem] text-slate-500">
                              {employee.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[0.98rem] text-slate-700">
                        {employee.role}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[1rem] font-semibold text-slate-950">
                          {employee.totalPoints}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex min-w-[200px] items-center gap-4">
                          <ProgressBar
                            value={employee.performance || 0}
                            className="h-2 flex-1 bg-slate-100"
                          />
                          <span className="text-[0.93rem] font-medium text-slate-500">
                            {formatPercent(employee.performance || 0)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-[0.95rem] text-slate-500"
                      colSpan={5}
                    >
                      No leaderboard rankings are available for this view yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-border/60 px-6 py-5">
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {showingLabel}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border/80 bg-white text-slate-400 transition hover:bg-slate-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[0.95rem] font-semibold transition ${
                    page === currentPage
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-brand-border/80 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border/80 bg-white text-slate-400 transition hover:bg-slate-50"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="border border-emerald-100 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f9fff7_100%)] p-6">
            <div className="text-center">
              <Badge tone="bg-emerald-100 text-brand-primary">
                {activeView === "yearly"
                  ? "Employee of the year"
                  : activeView === "quarterly"
                    ? "Employee of the quarter"
                    : "Employee of the month"}
              </Badge>

              <div className="relative mx-auto mt-6 w-fit">
                <div className="rounded-full ring-4 ring-slate-600 shadow-soft">
                  <Avatar
                    src={spotlight?.avatar}
                    name={spotlightName}
                    size="2xl"
                  />
                </div>
                <div className="absolute -bottom-[12px] -right-[10px] flex h-[40px] w-[40px] items-center justify-center rounded-full border-4 border-white bg-amber-400 text-white shadow-soft">
                  <Medal size={22} />
                </div>
              </div>

              <h3 className="mt-7 text-[1.15rem] font-semibold text-slate-950">
                {spotlightName}
              </h3>
              <p className="mt-1 text-[0.98rem] text-brand-primary">
                {spotlightRole}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                <div className="rounded-3xl border border-emerald-100/80 bg-white/85 px-4 py-3">
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Solved
                  </p>
                  <p className="mt-2 text-[1.05rem] font-semibold text-slate-950">
                    {formatNumber(spotlightStats.solved)}
                  </p>
                </div>
                <div className="rounded-3xl border border-emerald-100/80 bg-white/85 px-4 py-3">
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Rating
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[1.05rem] font-semibold text-slate-950">
                    {spotlightStats.rating}
                    <Star size={14} className="text-amber-400" />
                  </p>
                </div>
              </div>

              <p className="mt-5 text-[0.95rem] italic leading-8 text-slate-600">
                "{spotlightAchievement}"
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
