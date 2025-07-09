import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';
import toast from 'react-hot-toast';
import './AssessmentAttemptsViewer.css';

const InstructorFinalAssessmentAttemptsViewer = () => {
  const { courseId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [attemptsByUser, setAttemptsByUser] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (courseId) {
      fetchAttempts();
    }
  }, [courseId]);

  useEffect(() => {
    if (showDetails) {
      console.log('selectedAttempt:', selectedAttempt);
    }
  }, [showDetails, selectedAttempt]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/instructor/attempts/${courseId}`, {
        headers: { token: localStorage.getItem('token') }
      });
      setAttempts(data.attempts);
      setAttemptsByUser(data.attemptsByUser);
      setStatistics(data.statistics);
    } catch (err) {
      toast.error('Failed to fetch attempts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptDetails = async (attemptId) => {
    try {
      const { data } = await axios.get(`${server}/api/instructor/attempt/${attemptId}`, {
        headers: { token: localStorage.getItem('token') }
      });
      setSelectedAttempt(data.attempt);
      setShowDetails(true);
    } catch (err) {
      toast.error('Failed to fetch attempt details');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getFilteredAttempts = () => {
    let filtered = attempts;
    if (filter === 'passed') {
      filtered = filtered.filter(a => a.isPassed);
    } else if (filter === 'failed') {
      filtered = filtered.filter(a => !a.isPassed);
    }
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.percentage || 0) - (a.percentage || 0);
        case 'name':
          return (a.user?.name || '').localeCompare(b.user?.name || '');
        case 'date':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Score', 'Percentage', 'Status', 'Duration', 'Date'],
      ...getFilteredAttempts().map(attempt => [
        attempt.user?.name || 'N/A',
        attempt.user?.email || 'N/A',
        `${attempt.score}/${attempt.maxScore}`,
        `${attempt.percentage}%`,
        attempt.isPassed ? 'PASSED' : 'FAILED',
        formatDuration(attempt.duration),
        formatDate(attempt.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-attempts-${courseId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="attempts-loading">Loading attempts...</div>;
  }

  return (
    <div className="attempts-viewer">
      <div className="attempts-header">
        <h2 style={{ color: '#7cffb2' }}>Final Assessment Attempts</h2>
        <div className="header-actions">
          <button className="export-btn" onClick={exportToCSV}>
            Export to CSV
          </button>
          <button className="refresh-btn" onClick={fetchAttempts}>
            Refresh
          </button>
        </div>
      </div>
      <div className="statistics-grid">
        <div className="stat-card">
          <h3 style={{ color: '#7cffb2' }}>Total Attempts</h3>
          <p className="stat-number">{statistics.totalAttempts}</p>
        </div>
        <div className="stat-card">
          <h3 style={{ color: '#7cffb2' }}>Unique Users</h3>
          <p className="stat-number">{statistics.uniqueUsers}</p>
        </div>
        <div className="stat-card">
          <h3 style={{ color: '#7cffb2' }}>Pass Rate</h3>
          <p className="stat-number">{statistics.passRate}%</p>
        </div>
        <div className="stat-card">
          <h3 style={{ color: '#7cffb2' }}>Average Score</h3>
          <p className="stat-number">{statistics.averageScore}%</p>
        </div>
      </div>
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Attempts</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="score">Score</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      <div className="attempts-table-container">
        <table className="attempts-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Assessment</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAttempts().map((attempt) => (
              <tr key={attempt._id} className={attempt.isPassed ? 'passed-row' : 'failed-row'}>
                <td>
                  <div className="user-info">
                    <span className="user-name-black">{attempt.user?.name || 'N/A'}</span>
                    <span className="user-email">{attempt.user?.email || 'N/A'}</span>
                  </div>
                </td>
                <td>{attempt.assessmentId?.title || 'N/A'}</td>
                <td>{attempt.score}/{attempt.maxScore}</td>
                <td>
                  <span className={`percentage ${attempt.isPassed ? 'passed' : 'failed'}`}>
                    {attempt.percentage}%
                  </span>
                </td>
                <td>{attempt.isPassed ? 'PASSED' : 'FAILED'}</td>
                <td>{formatDuration(attempt.duration)}</td>
                <td>{formatDate(attempt.createdAt)}</td>
                <td>
                  <button className="view-btn" onClick={() => fetchAttemptDetails(attempt._id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Attempt Details Modal */}
      {showDetails && selectedAttempt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Attempt Details</h3>
              <button className="close-btn" onClick={() => setShowDetails(false)}>&times;</button>
            </div>
            {selectedAttempt ? (
              <>
                <div><b>User:</b> {selectedAttempt.user?.name} ({selectedAttempt.user?.email})</div>
                <div><b>Assessment:</b> {selectedAttempt.assessmentId?.title}</div>
                <div><b>Score:</b> {selectedAttempt.score}/{selectedAttempt.maxScore}</div>
                <div><b>Percentage:</b> {selectedAttempt.percentage}%</div>
                <div><b>Status:</b> {selectedAttempt.isPassed ? 'PASSED' : 'FAILED'}</div>
                <div><b>Duration:</b> {formatDuration(selectedAttempt.duration)}</div>
                <div><b>Date:</b> {formatDate(selectedAttempt.createdAt)}</div>
                <div><b>Answers:</b></div>
                <ul>
                  {selectedAttempt.answers && selectedAttempt.answers.length > 0 ? (
                    selectedAttempt.answers.map((ans, idx) => (
                      <li key={idx}>
                        <b>Q{idx + 1}:</b> {ans.selectedAnswers?.join(', ') || 'No answer'}
                      </li>
                    ))
                  ) : (
                    <li>No answers found.</li>
                  )}
                </ul>
              </>
            ) : (
              <div>No attempt details found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorFinalAssessmentAttemptsViewer; 