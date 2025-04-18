import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const WeeklyBreakBarChart = ({
  sessions,
  selectedRange,
  setSelectedRange,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) => {
  const today = new Date();

  // Filter sessions based on selected range
  const filteredSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startTime);

    if (selectedRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);
      return sessionDate >= weekAgo && sessionDate <= today;
    }

    if (selectedRange === "month") {
      return (
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear()
      );
    }

    if (
      selectedRange === "customMonth" &&
      selectedMonth !== "" &&
      selectedYear !== ""
    ) {
      return (
        sessionDate.getMonth() === parseInt(selectedMonth) &&
        sessionDate.getFullYear() === parseInt(selectedYear)
      );
    }

    return true; // allTime
  });

  // Count breaks per day
  const breakMap = {};
  filteredSessions.forEach((session) => {
    const date = new Date(session.startTime).toLocaleDateString("en-IN");
    const breakCount = session.history.filter(
      (h) => h.type === "break_start"
    ).length;
    breakMap[date] = (breakMap[date] || 0) + breakCount;
  });

  const labels = Object.keys(breakMap).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const dataValues = labels.map((label) => breakMap[label]);

  // Highest break info
  const maxBreaks = Math.max(...dataValues);
  const maxBreakIndex = dataValues.indexOf(maxBreaks);
  const maxBreakDate = labels[maxBreakIndex] || "N/A";

  const data = {
    labels,
    datasets: [
      {
        label: "Breaks Taken",
        data: dataValues,
        backgroundColor: "#7A7A7A",
        borderRadius: {
          topLeft: 8,
          topRight: 8,
        },
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: "Rubik",
            size: 10,
          },
          color: "#BABABA",
        },
        grid: {
          display: true,
          color: "#BABABA",
        },
      },
      y: {
        ticks: {
          font: {
            family: "Rubik",
            size: 10,
          },
          color: "#BABABA",
          stepSize: 5,
        },
        grid: {
          display: true,
          color: "#BABABA",
        },
        beginAtZero: true,
      },
    },
  };

  const customLabels = [{ label: "Breaks Taken", color: "#7A7A7A" }];

  return (
    <div className="zt-main-tile-2">
      <div className="zt-tile-sec-1">
        <div className="zt-item-wrapper">
          <h3
            style={{
              fontSize: "24px",
            }}
          >
            Break Count - {selectedRange === "week" ? "Week" : selectedRange}
          </h3>
          <div className="zt-item-aligner-left ">
            {customLabels.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "Rubik",
                  fontSize: "14px",
                  color: "#BABABA",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: item.color,
                    borderRadius: "4px",
                  }}
                />
                <span>{item.label}</span>
              </div>
            ))}
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="zt-dd-pr-s"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="allTime">All Time</option>
              <option value="customMonth">Custom Month</option>
            </select>
          </div>
        </div>

        <div
          id="break-count"
          style={{
            height: "66px",
            width: "100%",
            paddingBottom: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <p
            style={{
              fontFamily: "Rubik",
              fontSize: "48px",
            }}
          >
            {maxBreaks}
            <span
              style={{
                fontFamily: "Rubik",
                fontSize: "24px",
                color: "#7E7E7E",
              }}
            >
              {" "}
              on {maxBreakDate}
            </span>
          </p>
          {selectedRange === "customMonth" && (
            <div className="zt-item-aligner-left ">
              <select
                className="zt-dd-pr-s"
                onChange={(e) => setSelectedMonth(e.target.value)}
                value={selectedMonth}
              >
                <option value="" disabled>
                  Select Month
                </option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
              <select
                className="zt-dd-pr-s"
                onChange={(e) => setSelectedYear(e.target.value)}
                value={selectedYear}
              >
                <option value="" disabled>
                  Select Year
                </option>
                {[
                  ...new Set(
                    sessions.map((s) => new Date(s.startTime).getFullYear())
                  ),
                ]
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="zt-tile-sec-2">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyBreakBarChart;
