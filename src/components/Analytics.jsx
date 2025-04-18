import React, { useState, useEffect } from "react";
import { loadSessionsFromFile } from "../utils/fileStorage";
import { saveAs } from "file-saver";
import FocusBreakPieChart from "./charts/FocusBreakPieChart";
import TimeTrendLineChart from "./charts/TimeTrendLineChart";
import WeeklyBreakBarChart from "./charts/WeeklyBreakBarChart";
import "../App.css";

const Analytics = ({ onBack }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [minFocusTime, setMinFocusTime] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const sessionsPerPage = 10;

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, minFocusTime]);

  useEffect(() => {
    setMinFocusTime("0");
  }, [sortBy]);

  const loadSessions = async () => {
    const data = await loadSessionsFromFile();
    setSessions(data);
  };

  const handleDelete = async (timestamp) => {
    await window.electronAPI.deleteSession(timestamp);
    await loadSessions();
    setSelectedSession(null);
  };

  const formatIST = (iso) => {
    const date = new Date(iso);
    return {
      date: date.toLocaleDateString("en-IN"),
      time: date.toLocaleTimeString("en-IN"),
    };
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const getBreakCount = (history) =>
    history.filter((item) => item.type === "break_start").length;

  const sortedFilteredSessions = sessions
    .filter((s) => s.focusTime >= minFocusTime * 60)
    .sort((a, b) => {
      if (sortBy === "focus") return b.focusTime - a.focusTime;
      return new Date(b.startTime) - new Date(a.startTime);
    });

  const totalPages = Math.ceil(sortedFilteredSessions.length / sessionsPerPage);
  const paginatedSessions = sortedFilteredSessions.slice(
    (currentPage - 1) * sessionsPerPage,
    currentPage * sessionsPerPage
  );

  const isInRange = (date, range) => {
    const now = new Date();
    const sessionDate = new Date(date);

    if (range === "today") {
      return sessionDate.toDateString() === now.toDateString();
    } else if (range === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 6);
      return sessionDate >= weekAgo;
    } else if (range === "month") {
      return (
        sessionDate.getFullYear() === now.getFullYear() &&
        sessionDate.getMonth() === now.getMonth()
      );
    } else if (range === "customMonth") {
      return (
        sessionDate.getFullYear() === parseInt(selectedYear) &&
        sessionDate.getMonth() === parseInt(selectedMonth)
      );
    } else {
      return true;
    }
  };

  const sessionsInRange = sortedFilteredSessions.filter((s) =>
    isInRange(
      s.startTime,
      timeRange === "customMonth" ? "customMonth" : timeRange
    )
  );

  const rangeFocusTime = sessionsInRange.reduce(
    (sum, s) => sum + s.focusTime,
    0
  );
  const rangeBreakTime = sessionsInRange.reduce(
    (sum, s) => sum + s.breakTime,
    0
  );

  return (
    <div>
      <div id="back-logo-header" className="zt-wrapper">
        <button onClick={onBack} className="zt-bt-sc-s">
          <svg
            className="chevron"
            width="9"
            height="12"
            viewBox="0 0 9 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.69991 0.600079C9.19697 1.26281 9.06265 2.203 8.39992 2.70005L3.99996 6L8.39992 9.29995C9.06265 9.797 9.19697 10.7372 8.69991 11.3999C8.20286 12.0627 7.26267 12.197 6.59994 11.6999L0.599994 7.19998C0.222289 6.91671 0 6.47213 0 6C0 5.52787 0.222289 5.0833 0.599994 4.80002L6.59994 0.300084C7.26267 -0.196965 8.20286 -0.0626525 8.69991 0.600079Z"
              fill="currentColor"
            />
          </svg>
          Back
        </button>
        <div>
          <img src="/Assets/Images/Main_Logo_Grey.svg" alt="Zentym Logo" />
        </div>
      </div>

      <div>
        <div className="zt-item-aligner-right zt-mb" >
        <h2 className="zt-title-m">SESSION REPORT</h2>
        <button className="zt-bt-sc-s" onClick={() => setMinFocusTime(0)}>Reset</button>
        </div>
        
        <div className="zt-sc-holder">
          <div className="zt-tile-container">
            <FocusBreakPieChart
              focusTime={rangeFocusTime}
              breakTime={rangeBreakTime}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />

            <WeeklyBreakBarChart
              sessions={sortedFilteredSessions}
              selectedRange={timeRange}
              setSelectedRange={setTimeRange}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          </div>

          <TimeTrendLineChart
            sessions={sortedFilteredSessions}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
          />
        </div>
      </div>

      <div>
        <h2 className="zt-title-m zt-mb">SESSION HISTORY</h2>

        <div id="table-sort" className="zt-item-aligner-right">
          <select
            className="zt-dd-pr-s"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              fontFamily: "Rubik",
            }}
          >
            <option value="" disabled hidden>
              Sort by
            </option>
            <option value="date">Date</option>
            <option value="focus">Focus Time</option>
          </select>
          <input
            placeholder="Min Focus Time (min)"
            type="number"
            min={0}
            value={minFocusTime}
            onChange={(e) => setMinFocusTime(Number(e.target.value))}
            className="zt-dd-pr-s"
          />
          <button className="zt-bt-sc-s" onClick={() => setMinFocusTime(0)}>Reset</button>
        </div>

        <div className="zt-table-container">
          <table className="zt-custom-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Time (IST)</th>
                <th>Focus</th>
                <th>Break</th>
                <th>Breaks Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSessions.map((s, idx) => {
                const { date, time } = formatIST(s.startTime);
                return (
                  <tr key={idx} onClick={() => setSelectedSession(s)}>
                    <td>{String(idx + 1).padStart(2, "0")}</td>
                    <td>{date}</td>
                    <td>{time}</td>
                    <td>{formatTime(s.focusTime)}</td>
                    <td>{formatTime(s.breakTime)}</td>
                    <td>{String(getBreakCount(s.history)).padStart(2, "0")}</td>
                    <td>
                      <button
                        className="zt-bt-sc-s"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.startTime);
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 1.93469C0 2.55044 0.453317 3.09393 1.07889 3.17364L1.91205 10.8863C1.97843 11.5008 2.49193 12 3.14286 12H8.85714C9.50807 12 10.0216 11.5008 10.088 10.8863L10.9211 3.17364C11.5467 3.09393 12 2.55044 12 1.93469C12 1.26782 11.4683 0.685714 10.7619 0.685714H9.02531L8.91879 0.532319C8.69073 0.20392 8.31494 0 7.90476 0H4.09524C3.68506 0 3.30927 0.203921 3.08121 0.532318L2.97469 0.685714H1.2381C0.531713 0.685714 0 1.26782 0 1.93469ZM3.48383 10.3592L2.6161 2.32653H9.3839L8.51617 10.3592H3.48383Z"
                            fill="currentColor"
                          />
                          <path
                            d="M3.95454 3.99404C3.95454 3.55241 4.30567 3.17364 4.76406 3.17364C5.22245 3.17364 5.57359 3.55241 5.57359 3.99404V8.69608C5.57359 9.13772 5.22245 9.51649 4.76406 9.51649C4.30567 9.51649 3.95454 9.13772 3.95454 8.69608V3.99404ZM6.43073 3.99404C6.43073 3.55241 6.78187 3.17364 7.24026 3.17364C7.69864 3.17364 8.04978 3.55241 8.04978 3.99404V8.69608C8.04978 9.13772 7.69864 9.51649 7.24026 9.51649C6.78187 9.51649 6.43073 9.13772 6.43073 8.69608V3.99404Z"
                            fill="currentColor"
                          />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="zt-item-aligner-left">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="zt-bt-sc-s"
            >
              Previous
            </button>
            <span className="">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="zt-bt-sc-s"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedSession && (
        <div className="zt-modal-overlay">
          <div className="zt-modal-content">
            <button
              className="zt-modal-close"
              onClick={() => setSelectedSession(null)}
            >
              ✕
            </button>

            <h3 className="zt-modal-title">Session Details</h3>
            <p>
              <strong>Start:</strong>{" "}
              {formatIST(selectedSession.startTime).date},{" "}
              {formatIST(selectedSession.startTime).time}
            </p>
            <p>
              <strong>Focus Time:</strong>{" "}
              {formatTime(selectedSession.focusTime)}
            </p>
            <p>
              <strong>Break Time:</strong>{" "}
              {formatTime(selectedSession.breakTime)}
            </p>
            <p className="">
              <strong>History:</strong>
            </p>
            <ol className="zt-modal-history">
              {selectedSession.history.map((h, i) => (
                <li key={i}>
                  {h.type} @ {formatIST(h.timestamp).time} — {h.reason}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
