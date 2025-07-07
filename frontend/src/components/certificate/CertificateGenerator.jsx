import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';
import toast from 'react-hot-toast';
import './CertificateGenerator.css';

const CertificateGenerator = ({ user }) => {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (courseId && user) {
      checkEligibility();
      fetchCourseDetails();
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      const { data } = await axios.get(`${server}/api/course/${courseId}`);
      setCourse(data.course);
    } catch (err) {
      console.error('Failed to fetch course details:', err);
    }
  };

  const checkEligibility = async () => {
    try {
      const { data } = await axios.get(`${server}/api/certificate/${courseId}/eligibility`, {
        headers: { token: localStorage.getItem('token') }
      });
      setEligibility(data);
    } catch (err) {
      console.error('Failed to check eligibility:', err);
    }
  };

  const generateCertificate = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${server}/api/certificate/${courseId}/generate`, {}, {
        headers: { token: localStorage.getItem('token') }
      });
      
      setCertificate(data.certificate);
      toast.success('Certificate generated successfully!');
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to generate certificate');
      }
      console.error('Certificate generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      const response = await axios.get(`${server}/api/certificate/${certificate._id}/download`, {
        headers: { token: localStorage.getItem('token') },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download certificate');
      console.error('Download error:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!course) {
    return <div className="certificate-loading">Loading course details...</div>;
  }

  if (!eligibility) {
    return <div className="certificate-loading">Checking eligibility...</div>;
  }

  return (
    <div className="certificate-generator">
      <div className="certificate-header">
        <h2>Course Completion Certificate</h2>
        <div className="course-info">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
      </div>

      {certificate ? (
        <div className="certificate-display">
          <div className="certificate-card">
            <div className="certificate-header">
              <h3>🎓 Certificate of Completion</h3>
              <div className="certificate-number">
                #{certificate.certificateNumber}
              </div>
            </div>
            
            <div className="certificate-content">
              <p className="certificate-text">
                This is to certify that <strong>{user.name}</strong> has successfully 
                completed the course <strong>{course.title}</strong> with a final 
                assessment score of <strong>{certificate.score}%</strong>.
              </p>
              
              <div className="certificate-details">
                <div className="detail-item">
                  <span className="label">Issued Date:</span>
                  <span className="value">{formatDate(certificate.issuedAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Score:</span>
                  <span className="value score">{certificate.score}%</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`value status ${certificate.status}`}>
                    {certificate.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="certificate-actions">
              <button 
                className="download-btn"
                onClick={downloadCertificate}
              >
                📥 Download Certificate
              </button>
              <button 
                className="regenerate-btn"
                onClick={generateCertificate}
                disabled={loading}
              >
                🔄 Regenerate Certificate
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="eligibility-check">
          {eligibility?.eligible ? (
            <div className="eligible-section">
              <div className="success-icon">✅</div>
              <h3>You're Eligible for a Certificate!</h3>
              <p>Congratulations! You have completed all requirements for this course.</p>
              
              <div className="requirements-met">
                <h4>Requirements Met:</h4>
                <ul>
                  <li>✅ All lectures completed ({eligibility?.requirements?.lectures?.completed ?? 0}/{eligibility?.requirements?.lectures?.total ?? 0})</li>
                  <li>✅ All quizzes attempted ({eligibility?.requirements?.quizzes?.attempted ?? 0}/{eligibility?.requirements?.quizzes?.total ?? 0}) and completed ({eligibility?.requirements?.quizzes?.completed ?? 0}/{eligibility?.requirements?.quizzes?.total ?? 0}) - Avg: {eligibility?.requirements?.quizzes?.averageScore ?? 0}%</li>
                  <li>✅ Final assessment passed ({eligibility?.requirements?.assessment?.bestScore ?? 0}%)</li>
                  <li>✅ Total weighted score achieved ({eligibility?.requirements?.totalScore?.weightedScore ?? 0}% ≥ 60%)</li>
                </ul>
                <div className="score-breakdown">
                  <h5>Score Breakdown:</h5>
                  <p>Quiz Score (25%): {eligibility?.requirements?.totalScore?.quizContribution ?? 0}%</p>
                  <p>Final Assessment (75%): {eligibility?.requirements?.totalScore?.assessmentContribution ?? 0}%</p>
                  <p><strong>Total Score: {eligibility?.requirements?.totalScore?.weightedScore ?? 0}%</strong></p>
                </div>
              </div>
              
              <button 
                className="generate-btn"
                onClick={generateCertificate}
                disabled={loading}
              >
                {loading ? 'Generating...' : '🎓 Generate Certificate'}
              </button>
            </div>
          ) : (
            <div className="not-eligible-section">
              <div className="warning-icon">⚠️</div>
              <h3>Certificate Requirements Not Met</h3>
              <p>{eligibility?.reason || 'You need to complete all course requirements to generate a certificate.'}</p>
              
              <div className="requirements-list">
                <h4>Requirements:</h4>
                <ul>
                  <li className={eligibility?.requirements?.lectures?.complete ? 'complete' : 'incomplete'}>
                    📚 Complete all lectures (100%) - {eligibility?.requirements?.lectures?.progress ?? 0}%
                  </li>
                  <li className={eligibility?.requirements?.quizzes?.allAttempted ? 'complete' : 'incomplete'}>
                    🧠 Attempt all quizzes - {eligibility?.requirements?.quizzes?.attempted ?? 0}/{eligibility?.requirements?.quizzes?.total ?? 0} (Required regardless of score)
                  </li>
                  <li className={eligibility?.requirements?.quizzes?.complete ? 'complete' : 'incomplete'}>
                    🧠 Complete all quizzes - {eligibility?.requirements?.quizzes?.completed ?? 0}/{eligibility?.requirements?.quizzes?.total ?? 0} (Avg: {eligibility?.requirements?.quizzes?.averageScore ?? 0}%)
                  </li>
                  <li className={eligibility?.requirements?.assessment?.complete ? 'complete' : 'incomplete'}>
                    📝 Pass the final assessment - {eligibility?.requirements?.assessment?.completed ? (eligibility?.requirements?.assessment?.passed ? 'PASSED' : 'FAILED') : 'NOT ATTEMPTED'}
                  </li>
                  <li className={eligibility?.requirements?.totalScore?.complete ? 'complete' : 'incomplete'}>
                    🎯 Achieve total score ≥60% - {eligibility?.requirements?.totalScore?.weightedScore ?? 0}% (Quiz: {eligibility?.requirements?.totalScore?.quizContribution ?? 0}% + Assessment: {eligibility?.requirements?.totalScore?.assessmentContribution ?? 0}%)
                  </li>
                </ul>
              </div>
              
              <div className="progress-info">
                <p>Continue learning to unlock your certificate!</p>
                <button 
                  className="check-progress-btn"
                  onClick={checkEligibility}
                >
                  🔄 Check Progress
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateGenerator; 