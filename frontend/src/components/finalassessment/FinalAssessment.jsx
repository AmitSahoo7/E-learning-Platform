import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';
import './FinalAssessment.css';

const FinalAssessment = ({ user, onComplete }) => {
  const { courseId } = useParams();
  console.log('FinalAssessment courseId:', courseId);
  const [assessment, setAssessment] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (courseId && user) {
      fetchAssessment();
    }
  }, [courseId, user]);

  useEffect(() => {
    let timer;
    if (currentAttempt && timeLeft > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentAttempt, timeLeft, submitted]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      console.log('Fetching assessment for courseId:', courseId);
      console.log('Server URL:', server);
      console.log('Full URL:', `${server}/api/final-assessment/${courseId}`);
      console.log('Token:', localStorage.getItem("token") ? 'Present' : 'Missing');
      
      const { data } = await axios.get(
        `${server}/api/final-assessment/${courseId}`,
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      console.log('Assessment data received:', data);
      setAssessment(data);
      setError(null);
    } catch (err) {
      console.error('Assessment fetch error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 403 && err.response?.data?.lectureProgressPercentage !== undefined) {
        setError({
          type: 'lecture_progress',
          message: err.response.data.message,
          data: err.response.data
        });
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load assessment. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    try {
      const { data } = await axios.post(
        `${server}/api/final-assessment/${courseId}/start`,
        {},
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      setCurrentAttempt(data.attempt);
      setTimeLeft(data.timeLimit * 60); // Convert to seconds
      setAnswers(new Array(data.finalAssessment.questions.length).fill([]));
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.lectureProgressPercentage !== undefined) {
        alert(err.response.data.message);
      } else {
        alert(err.response?.data?.message || "Failed to start assessment");
      }
    }
  };

  const handleTimeUp = async () => {
    alert("Time's up! Submitting your assessment...");
    await submitAssessment();
  };

  const handleOptionToggle = (questionIndex, optionIndex) => {
    if (submitted) return;

    setAnswers(prev => {
      const newAnswers = [...prev];
      const question = assessment.finalAssessment.questions[questionIndex];
      const isMultiple = question.correctAnswers.length > 1;

      if (isMultiple) {
        const currentAnswers = newAnswers[questionIndex] || [];
        if (currentAnswers.includes(optionIndex)) {
          newAnswers[questionIndex] = currentAnswers.filter(i => i !== optionIndex);
        } else {
          newAnswers[questionIndex] = [...currentAnswers, optionIndex];
        }
      } else {
        newAnswers[questionIndex] = [optionIndex];
      }
      return newAnswers;
    });
  };

  const submitAssessment = async () => {
    try {
      setSubmitted(true);
      const formattedAnswers = answers.map((answer, index) => ({
        questionIndex: index,
        selectedAnswers: answer || []
      }));

      const { data } = await axios.post(
        `${server}/api/final-assessment/attempt/${currentAttempt._id}/submit`,
        { answers: formattedAnswers },
        {
          headers: { token: localStorage.getItem("token") },
        }
      );

      setResult(data);
      if (onComplete) {
        onComplete(data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit assessment");
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="assessment-loading">Loading assessment...</div>;
  
  // Handle lecture progress error
  if (error && typeof error === 'object' && error.type === 'lecture_progress') {
    return (
      <div className="lecture-progress-warning">
        <div className="warning-icon">⚠️</div>
        <h3>Lecture Progress Required</h3>
        <p className="warning-message">{error.message}</p>
        <div className="progress-details">
          <div className="progress-item">
            <span className="progress-label">Your Progress:</span>
            <span className="progress-value">{error.data.lectureProgressPercentage}%</span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Completed Lectures:</span>
            <span className="progress-value">{error.data.completedLectures} / {error.data.totalLectures}</span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Required:</span>
            <span className="progress-value">{error.data.requiredPercentage}%</span>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${error.data.lectureProgressPercentage}%` }}
          ></div>
        </div>
        <p className="continue-learning">
          Please continue learning and complete more lectures before attempting the final assessment.
        </p>
      </div>
    );
  }
  
  if (error) return <div className="assessment-error">{typeof error === 'string' ? error : error.message}</div>;
  if (!assessment) return null;

  if (result) {
    return (
      <div className="assessment-result">
        <h3>Assessment Complete!</h3>
        <div className="result-details">
          <div className="result-item">
            <span className="result-label">Score:</span>
            <span className="result-value">{result.score} / {result.totalPoints}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Percentage:</span>
            <span className="result-value">{result.percentage}%</span>
          </div>
          <div className="result-item">
            <span className="result-label">Status:</span>
            <span className={`result-value ${result.isPassed ? 'passed' : 'failed'}`}>
              {result.isPassed ? 'PASSED' : 'FAILED'}
            </span>
          </div>
        </div>
        <button 
          className="retake-btn"
          onClick={() => window.location.reload()}
        >
          Take Another Attempt
        </button>
      </div>
    );
  }

  if (!currentAttempt) {
    return (
      <div className="assessment-start">
        <h3>Final Assessment</h3>
        <div className="assessment-info">
          <p><strong>Title:</strong> {assessment.finalAssessment.title}</p>
          <p><strong>Description:</strong> {assessment.finalAssessment.description}</p>
          <p><strong>Questions:</strong> {assessment.finalAssessment.questions.length}</p>
          <p><strong>Time Limit:</strong> {assessment.finalAssessment.timeLimit} minutes</p>
          <p><strong>Attempts Used:</strong> {assessment.attemptsUsed} / {assessment.attemptsAllowed}</p>
          <p><strong>Passing Score:</strong> {assessment.finalAssessment.passingScore}%</p>
        </div>

        {assessment.bestAttempt && (
          <div className="best-attempt">
            <h4>Your Best Attempt</h4>
            <p>Score: {assessment.bestAttempt.score} / {assessment.finalAssessment.totalPoints}</p>
            <p>Percentage: {assessment.bestAttempt.percentage}%</p>
            <p>Status: {assessment.bestAttempt.isPassed ? 'PASSED' : 'FAILED'}</p>
          </div>
        )}

        {assessment.canTakeAssessment ? (
          <button 
            className="start-assessment-btn"
            onClick={startAssessment}
          >
            Start Assessment
          </button>
        ) : (
          <div className="no-attempts">
            <p>You have used all {assessment.attemptsAllowed} attempts.</p>
            <p>Your best score: {assessment.bestAttempt?.percentage || 0}%</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h3>{assessment.finalAssessment.title}</h3>
        <div className="assessment-timer">
          Time Remaining: <span className={timeLeft < 300 ? 'time-warning' : ''}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="assessment-questions">
        {assessment.finalAssessment.questions.map((question, qIndex) => (
          <div key={qIndex} className="question-card">
            <h4>Question {qIndex + 1}</h4>
            <p className="question-text">{question.question}</p>
            
            <div className="options-list">
              {question.options.map((option, optIndex) => {
                const isSelected = answers[qIndex]?.includes(optIndex);
                const isCorrect = submitted && question.correctAnswers.includes(optIndex);
                const isWrongSelected = submitted && isSelected && !isCorrect;

                return (
                  <div
                    key={optIndex}
                    className={`option-item ${isSelected ? 'selected' : ''} ${
                      submitted && isCorrect ? 'correct' : ''
                    } ${isWrongSelected ? 'wrong' : ''}`}
                    onClick={() => handleOptionToggle(qIndex, optIndex)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                    <span className="option-text">{option}</span>
                  </div>
                );
              })}
            </div>

            {submitted && (
              <div className="question-feedback">
                <p>
                  <strong>Correct Answer(s):</strong> {
                    question.correctAnswers.map(index => 
                      String.fromCharCode(65 + index)
                    ).join(', ')
                  }
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="assessment-footer">
        <div className="progress-info">
          Questions Answered: {answers.filter(a => a && a.length > 0).length} / {assessment.finalAssessment.questions.length}
        </div>
        {!submitted && (
          <button 
            className="submit-assessment-btn"
            onClick={submitAssessment}
            disabled={timeLeft === 0}
          >
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default FinalAssessment; 