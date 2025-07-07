import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import { server } from '../../main';
import toast from 'react-hot-toast';

const emptyQuestion = { question: '', options: ['', '', '', ''], correctAnswers: [], questionType: 'single' };

const FinalAssessmentManager = ({ courseId }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editAssessment, setEditAssessment] = useState(null);
  const [form, setForm] = useState({ title: '', questions: [ { ...emptyQuestion } ] });
  const [previewAssessment, setPreviewAssessment] = useState(null);

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
    setForm({ ...form, [e.target.name]: e.target.value });
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
    setForm({ ...form, questions: [...form.questions, { ...emptyQuestion }] });
  };
  const removeQuestion = (idx) => {
    if (form.questions.length === 1) return;
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) });
  };

  // Create or update assessment
  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setForm({ title: '', questions: [ { ...emptyQuestion } ] });
      fetchAssessments();
    } catch (err) {
      toast.error('Failed to save assessment');
    }
  };

  // Activate/deactivate
  const handleActivate = async (id) => {
    try {
      await axios.patch(`${server}/api/admin/assessment/${id}/activate`, {}, {
        headers: { token: localStorage.getItem('token') }
      });
      toast.success('Assessment activated');
      fetchAssessments();
    } catch {
      toast.error('Failed to activate');
    }
  };
  const handleDeactivate = async (id) => {
    try {
      await axios.patch(`${server}/api/admin/assessment/${id}/deactivate`, {}, {
        headers: { token: localStorage.getItem('token') }
      });
      toast.success('Assessment deactivated');
      fetchAssessments();
    } catch {
      toast.error('Failed to deactivate');
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
    setForm({ title: assessment.title, questions: assessment.questions });
    setShowForm(true);
  };

  // New
  const handleNew = () => {
    setEditAssessment(null);
    setForm({ title: '', questions: [ { ...emptyQuestion } ] });
    setShowForm(true);
  };

  return (
    <div>
      <h2>Final Assessments</h2>
      <button onClick={handleNew}>Create New Assessment</button>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map(a => (
              <tr key={a._id} style={a.isActive ? { background: '#e0ffe0' } : {}}>
                <td>{a.title}</td>
                <td>{a.questions.length}</td>
                <td>{a.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button onClick={() => handlePreview(a._id)}>Preview</button>
                  <button onClick={() => handleEdit(a)}>Edit</button>
                  {a.isActive ? (
                    <button onClick={() => handleDeactivate(a._id)}>Deactivate</button>
                  ) : (
                    <button onClick={() => handleActivate(a._id)}>Activate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal for create/edit */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit}>
          <h3>{editAssessment ? 'Edit' : 'Create'} Assessment</h3>
          <label>Title:<br/>
            <input name="title" value={form.title} onChange={handleFormChange} required />
          </label>
          <h4>Questions</h4>
          {form.questions.map((q, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
              <label>Question:<br/>
                <input value={q.question} onChange={e => handleQuestionChange(idx, 'question', e.target.value)} required />
              </label><br/>
              <label>Type:
                <select value={q.questionType} onChange={e => handleQuestionChange(idx, 'questionType', e.target.value)}>
                  <option value="single">Single Correct</option>
                  <option value="multiple">Multiple Correct</option>
                </select>
              </label><br/>
              <label>Options:</label>
              {q.options.map((opt, oIdx) => (
                <input key={oIdx} value={opt} onChange={e => handleOptionChange(idx, oIdx, e.target.value)} required style={{ marginRight: 4 }} />
              ))}
              <br/>
              <label>Correct Answer(s):
                {q.options.map((opt, oIdx) => (
                  <span key={oIdx} style={{ marginLeft: 8 }}>
                    <input
                      type={q.questionType === 'single' ? 'radio' : 'checkbox'}
                      checked={q.correctAnswers.includes(oIdx)}
                      onChange={e => {
                        let arr = q.questionType === 'single'
                          ? [oIdx]
                          : (e.target.checked
                              ? [...q.correctAnswers, oIdx]
                              : q.correctAnswers.filter(i => i !== oIdx));
                        handleCorrectAnswersChange(idx, arr);
                      }}
                    /> {String.fromCharCode(65 + oIdx)}
                  </span>
                ))}
              </label>
              <button type="button" onClick={() => removeQuestion(idx)} disabled={form.questions.length === 1}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addQuestion}>Add Question</button>
          <br/>
          <button type="submit">{editAssessment ? 'Update' : 'Create'} Assessment</button>
        </form>
      </Modal>
      {/* Modal for preview */}
      <Modal isOpen={!!previewAssessment} onClose={() => setPreviewAssessment(null)}>
        {previewAssessment && (
          <div>
            <h3>Preview: {previewAssessment.title}</h3>
            {previewAssessment.questions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <b>Q{idx + 1}:</b> {q.question}<br/>
                <ul>
                  {q.options.map((opt, oIdx) => (
                    <li key={oIdx}>{String.fromCharCode(65 + oIdx)}. {opt}</li>
                  ))}
                </ul>
                <div>Correct: {q.correctAnswers.map(i => String.fromCharCode(65 + i)).join(', ')}</div>
                <div>Type: {q.questionType}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FinalAssessmentManager; 