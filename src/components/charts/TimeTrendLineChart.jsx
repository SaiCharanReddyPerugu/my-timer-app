import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  elements,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const formatTimeHM = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const TimeTrendLineChart = ({
  sessions,
  timeRange,
  setTimeRange,
  setSelectedMonth,
  setSelectedYear,
  selectedMonth,
  selectedYear,
}) => {
  const getFilteredData = () => {
    if (!Array.isArray(sessions)) return [];

    const now = new Date();
    let fromDate = new Date(0);
    let toDate = new Date();

    if (timeRange === "today") {
      fromDate = new Date();
      fromDate.setHours(0, 0, 0, 0);
    } else if (timeRange === "week") {
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 6);
    } else if (timeRange === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (
      timeRange === "customMonth" &&
      selectedMonth !== "" &&
      selectedYear !== ""
    ) {
      fromDate = new Date(selectedYear, selectedMonth, 1);
      toDate = new Date(selectedYear, parseInt(selectedMonth) + 1, 1);
      return sessions.filter((s) => {
        const date = new Date(s.startTime);
        return date >= fromDate && date < toDate;
      });
    }

    return sessions.filter((s) => new Date(s.startTime) >= fromDate);
  };

  const buildChartData = () => {
    const filtered = getFilteredData();
    const grouped = {};

    filtered.forEach((session) => {
      const date = formatDate(session.startTime);
      if (!grouped[date]) {
        grouped[date] = { focus: 0, break: 0 };
      }
      grouped[date].focus += session.focusTime;
      grouped[date].break += session.breakTime;
    });

    const labels = Object.keys(grouped);
    const focusData = labels.map((label) => grouped[label].focus / 60);
    const breakData = labels.map((label) => grouped[label].break / 60);

    // 🔍 Find max focus time & date
    let maxFocusMinutes = 0;
    let maxFocusDate = "";
    focusData.forEach((value, index) => {
      if (value > maxFocusMinutes) {
        maxFocusMinutes = value;
        maxFocusDate = labels[index];
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Focus Time",
          data: focusData,
          borderColor: "#BABABA",
          backgroundColor: "#BABABA",
          pointBackgroundColor: "#7A7A7A",
          pointBorderColor: "#191919",
          tension: 0.4,
        },
        {
          label: "Break Time",
          data: breakData,
          borderColor: "#7A7A7A",
          backgroundColor: "#7A7A7A",
          pointBackgroundColor: "#7A7A7A",
          pointBorderColor: "#191919",
          tension: 0.4,
        },
      ],
      maxFocus: maxFocusMinutes * 60,
      maxFocusDate,
    };
  };

  const chartData = buildChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const minutes = context.parsed.y;
            const seconds = minutes * 60;
            return `${label}: ${formatTimeHM(seconds)}`;
          },
        },
      },
      legend: {
        display: false,
        labels: {
          color: "#BABABA",
          font: {
            family: "Rubik",
            size: 14,
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => {
            const h = Math.floor(value / 60);
            const m = Math.round(value % 60);
            return `${h}h ${m}m`;
          },
          color: "#BABABA",
          font: {
            family: "Rubik",
            size: 12,
          },
        },
        grid: {
          color: "#BABABA",
        },
      },
      x: {
        ticks: {
          color: "#BABABA",
          font: {
            family: "Rubik",
            size: 12,
          },
        },
        grid: {
          color: "#BABABA",
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        radius: 5,
        hoverRadius: 7,
      },
    },
  };

  const customLabels = [
    {
      label: "Focus Time",
      color: "#BABABA",
    },
    {
      label: "Break Time",
      color: "#7A7A7A",
    },
  ];

  return (
    <div className="zt-main-tile-3">
      <div className="zt-tile-sec-1">
        <div className="zt-item-wrapper">
          <h3 style={{ fontFamily: "Rubik", fontSize: "24px" }}>
            Focus & Break Trend
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
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="zt-dd-pr-s"
            >
              <option value="" disabled hidden>
                Select Range
              </option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="allTime">All Time</option>
              <option value="customMonth">Custom Month</option>
            </select>
          </div>
        </div>
        <div
          id="max-focus"
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
              color: "#7A7A7A",
              fontSize: "24px",
            }}
          >
            Max Focus Time :{" "}
            <span
              style={{
                fontFamily: "Rubik",
                fontSize: "48px",
                color: "#BABABA",
              }}
            >
              {formatTimeHM(chartData.maxFocus)}
              {chartData.maxFocusDate && ` on ${chartData.maxFocusDate}`}
            </span>
          </p>
          {timeRange === "customMonth" && (
            <div className="zt-item-aligner-left">
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
                {[...Array(6)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>
      <div
        className="zt-tile-sec-2"
        style={{
          height: "300px",
        }}
      >
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TimeTrendLineChart;
