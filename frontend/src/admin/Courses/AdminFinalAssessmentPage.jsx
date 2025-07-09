import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal';
import { server } from '../../main';
import toast from 'react-hot-toast';
import styles from './adminFinalAssessmentPage.module.css';

const emptyQuestion = {
  question: '',
  options: ['', '', '', ''],
  correctAnswers: [],
  questionType: 'single',
  explanation: '',
  marks: 1
};

const AdminFinalAssessmentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editAssessment, setEditAssessment] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', passingScore: 60, timeLimit: 0, attemptsAllowed: 1, questions: [ { ...emptyQuestion, options: ['', '', '', ''] } ] });
  const [previewAssessment, setPreviewAssessment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch course info
  useEffect(() => {
    if (!courseId) return;
    axios.get(`${server}/api/course/${courseId}`)
      .then(({ data }) => setCourse(data.course))
      .catch(() => setCourse(null));
  }, [courseId]);

  // Fetch all assessments for this course
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/admin/assessments/${courseId}`, {
        headers: { token: localStorage.getItem('token') }
      });
      setAssessments(data.assessments);
    } catch (err) {
      toast.error('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (courseId) fetchAssessments(); }, [courseId]);

  // Handlers for form
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;
    if (type === 'number') {
      val = value === '' ? '' : Number(value);
    }
    setForm({ ...form, [name]: val });
  };
  const handleQuestionChange = (idx, field, value) => {
    const updated = [...form.questions];
    updated[idx][field] = value;
    setForm({ ...form, questions: updated });
  };
  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...form.questions];
    updated[qIdx].options[oIdx] = value;
    setForm({ ...form, questions: updated });
  };
  const handleCorrectAnswersChange = (qIdx, arr) => {
    const updated = [...form.questions];
    updated[qIdx].correctAnswers = arr;
    setForm({ ...form, questions: updated });
  };
  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        { ...emptyQuestion, options: ['', '', '', ''] }
      ]
    });
  };
  const removeQuestion = (idx) => {
    if (form.questions.length === 1) return;
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) });
  };

  // Create or update assessment
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('SUBMIT form:', form); // Debug log
    try {
      if (editAssessment) {
        await axios.put(`${server}/api/admin/assessment/${editAssessment._id}`, form, {
          headers: { token: localStorage.getItem('token') }
        });
        toast.success('Assessment updated');
      } else {
        await axios.post(`${server}/api/admin/assessment`, { ...form, courseId }, {
          headers: { token: localStorage.getItem('token') }
        });
        toast.success('Assessment created');
      }
      setShowForm(false);
      setEditAssessment(null);
      setForm({ title: '', description: '', passingScore: 60, timeLimit: 0, attemptsAllowed: 1, questions: [ { ...emptyQuestion, options: ['', '', '', ''] } ] });
      fetchAssessments();
    } catch (err) {
      toast.error('Failed to save assessment');
    }
  };

  // Toggle assessment active status
  const handleToggle = async (assessment) => {
    try {
      if (assessment.isActive) {
        await axios.patch(`${server}/api/admin/assessment/${assessment._id}/deactivate`, {}, {
          headers: { token: localStorage.getItem('token') }
        });
        toast.success('Assessment deactivated');
      } else {
        await axios.patch(`${server}/api/admin/assessment/${assessment._id}/activate`, {}, {
          headers: { token: localStorage.getItem('token') }
        });
        toast.success('Assessment activated');
      }
      fetchAssessments();
    } catch (err) {
      toast.error('Failed to toggle assessment');
    }
  };

  // Preview
  const handlePreview = async (id) => {
    try {
      const { data } = await axios.get(`${server}/api/admin/assessment/${id}/preview`, {
        headers: { token: localStorage.getItem('token') }
      });
      setPreviewAssessment(data.assessment);
    } catch {
      toast.error('Failed to preview');
    }
  };

  // Edit
  const handleEdit = (assessment) => {
    setEditAssessment(assessment);
    setForm({
      title: assessment.title,
      description: assessment.description || '',
      passingScore: assessment.passingScore || 60,
      timeLimit: assessment.timeLimit || 0,
      attemptsAllowed: assessment.attemptsAllowed || 1,
      questions: assessment.questions.map(q => ({
        ...q,
        options: [...q.options],
        correctAnswers: [...q.correctAnswers]
      }))
    });
    setShowForm(true);
  };

  // New
  const handleNew = () => {
    setEditAssessment(null);
    setForm({ title: '', description: '', passingScore: 60, timeLimit: 0, attemptsAllowed: 1, questions: [{ ...emptyQuestion, options: ['', '', '', ''] }] });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${server}/api/admin/assessment/${deleteTarget}`, {
        headers: { token: localStorage.getItem('token') }
      });
      toast.success('Assessment deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchAssessments();
    } catch (err) {
      toast.error('Failed to delete assessment');
    }
  };

  return (
    <div className={styles.manageAssessmentsPage}>
      <div className={styles.assessmentsHeader}>
        <div className={styles.headerContent}>
          <h1 style={{ color: '#7cffb2' }}>Manage Final Assessments</h1>
                     <p className={styles.courseInfo}>Course: {course ? course.title : 'Loading...'}</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.viewAttemptsBtn} 
            onClick={() => navigate(`/admin/course/${courseId}/attempts`)}
          >
            View Attempts
          </button>
          <button className={styles.createBtn} onClick={handleNew}>
            <span>+</span> Create Assessment
          </button>
        </div>
      </div>

      <div className={styles.assessmentsContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading assessments...</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className={styles.noAssessments}>
            <h3>No Assessments Yet</h3>
            <p>Create your first final assessment for this course to get started.</p>
            <button className={styles.createBtn} onClick={handleNew}>
              Create Assessment
            </button>
          </div>
        ) : (
          <div className={styles.assessmentsGrid}>
            {assessments.map(a => (
              <div key={a._id} className={styles.assessmentCard}>
                <div className={styles.assessmentHeader}>
                  <h3>{a.title}</h3>
                  <div className={styles.statusBadge}>
                    <span className={a.isActive ? styles.active : styles.inactive}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.assessmentDetails}>
                  {a.description && <div className={styles.description}>{a.description}</div>}
                  <div className={styles.statsGrid}>
                    <div className={styles.stat}>
                      <span className={styles.label}>Questions:</span>
                      <span className={styles.value}>{a.questions.length}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Points:</span>
                      <span className={styles.value}>{a.totalPoints}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Passing:</span>
                      <span className={styles.value}>{a.passingScore}%</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Time:</span>
                      <span className={styles.value}>{a.timeLimit} min</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Attempts:</span>
                      <span className={styles.value}>{a.attemptsAllowed}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Created:</span>
                      <span className={styles.value}>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.assessmentActions}>
                  <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => handleEdit(a)}>
                    Edit
                  </button>
                                     <button className={`${styles.actionBtn} ${styles.toggleBtn}`} onClick={() => handleToggle(a)}>
                     {a.isActive ? 'Deactivate' : 'Activate'}
                   </button>
                  <button className={`${styles.actionBtn} ${styles.viewBtn}`} onClick={() => handlePreview(a._id)}>
                    Preview
                  </button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => {
                    setDeleteTarget(a._id);
                    setShowDeleteConfirm(true);
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for create/edit */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className={styles.adminAssessmentForm}>
          <h3>{editAssessment ? 'Edit' : 'Create'} Assessment</h3>
          <label>Title:<br/>
            <input name="title" value={form.title} onChange={handleFormChange} required />
          </label>
          <label>Description:<br/>
            <textarea name="description" value={form.description} onChange={handleFormChange} rows={2} />
          </label>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <label>Passing Score (%):<br/>
              <input name="passingScore" type="number" min={0} max={100} value={form.passingScore} onChange={handleFormChange} style={{ width: 80 }} />
            </label>
            <label>Time Limit (min):<br/>
              <input name="timeLimit" type="number" min={0} value={form.timeLimit} onChange={handleFormChange} style={{ width: 80 }} />
            </label>
            <label>Attempts Allowed:<br/>
              <input name="attemptsAllowed" type="number" min={1} value={form.attemptsAllowed} onChange={handleFormChange} style={{ width: 80 }} />
            </label>
          </div>
          <h4>Questions</h4>
          {form.questions.map((q, idx) => (
            <div key={idx} className={styles.questionSection}>
              <h5>Question {idx + 1}</h5>
              <div className={styles.questionInputs}>
                <label>Question Text:<br/>
                  <textarea
                    value={q.question}
                    onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                    rows={2}
                    required
                  />
                </label>
                <label>Question Type:<br/>
                  <select
                    value={q.questionType}
                    onChange={(e) => handleQuestionChange(idx, 'questionType', e.target.value)}
                  >
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                  </select>
                </label>
                <label>Marks:<br/>
                  <input
                    type="number"
                    min={1}
                    value={q.marks}
                    onChange={(e) => handleQuestionChange(idx, 'marks', parseInt(e.target.value))}
                    style={{ width: 80 }}
                  />
                </label>
                <label>Explanation (optional):<br/>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                    rows={2}
                  />
                </label>
                <div>
                  <label>Options:</label>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className={styles.optionInput}>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        required
                      />
                      <input
                        type={q.questionType === 'single' ? 'radio' : 'checkbox'}
                        name={`correct${idx}`}
                        checked={q.correctAnswers.includes(optIdx)}
                        onChange={(e) => {
                          if (q.questionType === 'single') {
                            handleCorrectAnswersChange(idx, [optIdx]);
                          } else {
                            if (e.target.checked) {
                              handleCorrectAnswersChange(idx, [...q.correctAnswers, optIdx]);
                            } else {
                              handleCorrectAnswersChange(idx, q.correctAnswers.filter(i => i !== optIdx));
                            }
                          }
                        }}
                      />
                      <span>Correct</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={`${styles.questionActions} ${styles.addOptionBtn}`}
                    onClick={() => addQuestion(idx)}
                  >
                    Add Option
                  </button>
                </div>
              </div>
              {form.questions.length > 1 && (
                <div className={styles.questionActions}>
                  <button
                    type="button"
                    className={`${styles.questionActions} ${styles.removeQuestionBtn}`}
                    onClick={() => removeQuestion(idx)}
                  >
                    Remove Question
                  </button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className={`${styles.questionActions} ${styles.addOptionBtn}`} onClick={addQuestion}>
            Add Question
          </button>
          <div className={styles.formActions}>
            <button type="button" className={`${styles.formActions} ${styles.cancelBtn}`} onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className={`${styles.formActions} ${styles.submitBtn}`}>
              {editAssessment ? 'Update' : 'Create'} Assessment
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={!!previewAssessment} onClose={() => setPreviewAssessment(null)}>
        <div className={styles.previewModal}>
          <h3>Preview: {previewAssessment?.title}</h3>
          {previewAssessment?.description && <div className={styles.description}>{previewAssessment.description}</div>}
          <div className={styles.previewStats}>
            <div><b>Questions:</b> {previewAssessment?.questions.length}</div>
            <div><b>Points:</b> {previewAssessment?.totalPoints}</div>
            <div><b>Passing:</b> {previewAssessment?.passingScore}%</div>
            <div><b>Time:</b> {previewAssessment?.timeLimit} min</div>
            <div><b>Attempts:</b> {previewAssessment?.attemptsAllowed}</div>
            <div><b>Created:</b> {previewAssessment?.createdAt && new Date(previewAssessment.createdAt).toLocaleDateString()}</div>
          </div>
          {previewAssessment?.questions.map((q, idx) => (
            <div key={idx} className={styles.previewQuestion}>
              <h4>Q{idx + 1}: {q.question}</h4>
              <ul className={styles.previewOptions}>
                {q.options.map((opt, oIdx) => (
                  <li key={oIdx} className={q.correctAnswers.includes(oIdx) ? styles.correct : ''}>
                    {String.fromCharCode(65 + oIdx)}. {opt}
                    {q.correctAnswers.includes(oIdx) && ' (Correct)'}
                  </li>
                ))}
              </ul>
              {q.explanation && <div className={styles.description}>Explanation: {q.explanation}</div>}
            </div>
          ))}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteConfirmModal}>
            <h3>Delete Assessment</h3>
            <p>Are you sure you want to delete this assessment? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={`${styles.modalActions} ${styles.cancelBtn}`} onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className={`${styles.modalActions} ${styles.deleteBtn}`} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinalAssessmentPage; 