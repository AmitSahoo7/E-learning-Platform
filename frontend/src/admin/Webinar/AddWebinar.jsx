import React, { useState } from 'react';
import axios from 'axios';
import './adminwebinar.css';

const API_URL = '/api/webinar';

const emptyWebinar = {
  date: '',
  topic: '',
  time: '',
  instructors: [''],
  description: '',
  objectives: '',
  notes: '',
  document: null,
  poster: null
};

const AddWebinar = ({ onClose, editWebinar }) => {
  const [form, setForm] = useState(editWebinar ? {
    ...editWebinar,
    date: editWebinar.date ? new Date(editWebinar.date).toISOString().slice(0, 10) : '',
    instructors: editWebinar.instructors || [''],
    document: null
  } : emptyWebinar);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleInstructorChange = (idx, value) => {
    setForm(f => {
      const instructors = [...f.instructors];
      instructors[idx] = value;
      return { ...f, instructors };
    });
  };

  const addInstructor = () => {
    setForm(f => ({ ...f, instructors: [...f.instructors, ''] }));
  };

  const removeInstructor = idx => {
    setForm(f => {
      const instructors = f.instructors.filter((_, i) => i !== idx);
      return { ...f, instructors };
    });
  };

  const handleFileChange = e => {
    setForm(f => ({ ...f, document: e.target.files[0] }));
  };

  const handlePosterChange = e => {
    setForm(f => ({ ...f, poster: e.target.files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'instructors') {
          value.forEach(i => formData.append('instructors', i));
        } else if (key === 'document' && value) {
          formData.append('document', value);
        } else if (key === 'poster' && value) {
          formData.append('poster', value);
        } else if (key !== 'document' && key !== 'poster') {
          formData.append(key, value);
        }
      });
      if (editWebinar) {
        await axios.put(`${API_URL}/${editWebinar._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', token: localStorage.getItem('token') }
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data', token: localStorage.getItem('token') }
        });
      }
      onClose(true);
    } catch {
      setError('Failed to submit. Please check your input.');
    }
    setSubmitting(false);
  };

  return (
    <div className="webinar-modal-bg">
      <div className="webinar-modal">
        <h3>{editWebinar ? 'Edit Webinar' : 'Create Webinar'}</h3>
        <form className="webinar-form" onSubmit={handleSubmit}>
          <label>Date*<input type="date" name="date" value={form.date} onChange={handleChange} required /></label>
          <label>Time*<input type="time" name="time" value={form.time} onChange={handleChange} required /></label>
          <label>Topic*<input type="text" name="topic" value={form.topic} onChange={handleChange} required /></label>
          <label>Description*<textarea name="description" value={form.description} onChange={handleChange} required /></label>
          <label>Objectives*<textarea name="objectives" value={form.objectives} onChange={handleChange} required /></label>
          <div className="instructors-section">
            <label>Instructors*</label>
            {form.instructors.map((inst, idx) => (
              <div key={idx} className="instructor-row">
                <input type="text" value={inst} onChange={e => handleInstructorChange(idx, e.target.value)} required />
                {form.instructors.length > 1 && (
                  <button type="button" onClick={() => removeInstructor(idx)} className="remove-instructor">-</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addInstructor} className="add-instructor">+ Add Instructor</button>
          </div>
          <label>Notes (optional)<textarea name="notes" value={form.notes} onChange={handleChange} /></label>
          <label>Document (optional)<input type="file" name="document" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.ppt,.pptx" /></label>
          <label>Poster (cover image)
            <input type="file" name="poster" onChange={handlePosterChange} accept="image/*" />
          </label>
          {form.poster && typeof form.poster === 'object' && (
            <img src={URL.createObjectURL(form.poster)} alt="Poster preview" style={{ maxWidth: 180, margin: '8px 0', borderRadius: 8 }} />
          )}
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="button" onClick={() => onClose(false)} disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : (editWebinar ? 'Update' : 'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWebinar; 