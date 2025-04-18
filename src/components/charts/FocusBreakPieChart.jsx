import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const formatTimeReadable = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const FocusBreakPieChart = ({
  focusTime,
  breakTime,
  timeRange,
  setTimeRange,
}) => {
  const data = {
    labels: ["Focus Time", "Break Time"],
    datasets: [
      {
        data: [focusTime, breakTime],
        backgroundColor: ["#BABABA", "#7E7E7E"],
        borderColor: "#191919",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 🔧 Disable built-in legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${formatTimeReadable(value)}`;
          },
        },
      },
    },
  };

  const customLabels = [
    { label: "Focus", color: "#BABABA" },
    { label: "Break", color: "#7E7E7E" },
  ];

  return (
    <div className="zt-main-tile-1">
      <div className="zt-tile-sec-1">
        <div className="zt-item-wrapper">
          <p
            style={{
              fontSize: "24px",
            }}
          >
            Focus vs Break
          </p>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="zt-dd-pr-s"
            >
              <option value="" disabled hidden>
                Sort by
              </option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="allTime">All Time</option>
            </select>
        </div>
        <div
          style={{
            height: "66px",
            paddingBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "Rubik",
              fontSize: "48px",
            }}
          >
            {formatTimeReadable(focusTime)}
          </span>
          <span
            style={{
              fontFamily: "Rubik",
              fontSize: "24px",
              color: "#7E7E7E",
            }}
          >
            {" "}
            vs {formatTimeReadable(breakTime)}
          </span>
        </div>
      </div>

      <div className="zt-tile-sec-2">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          {customLabels.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "Rubik",
                fontSize: "14px",
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
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "300px",
          }}
        >
          <Pie data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default FocusBreakPieChart;
