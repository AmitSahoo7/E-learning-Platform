import React, { useEffect, useState } from 'react';
import AddWebinar from './AddWebinar';
import './adminwebinar.css';
import axios from 'axios';

const API_URL = '/api/webinar';

const AdminWebinars = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editWebinar, setEditWebinar] = useState(null);

  const fetchWebinars = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        headers: { token: localStorage.getItem('token') }
      });
      setWebinars(data.webinars || []);
    } catch {
      setWebinars([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this webinar?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { token: localStorage.getItem('token') }
      });
      fetchWebinars();
    } catch (err) {
      console.error('Failed to delete webinar:', err);
    }
  };

  const handleEdit = (webinar) => {
    setEditWebinar(webinar);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditWebinar(null);
    setShowForm(true);
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setEditWebinar(null);
    if (refresh) fetchWebinars();
  };

  return (
    <div className="admin-webinar-container">
      <h2>Manage Webinars</h2>
      <button className="add-webinar-btn" onClick={handleAdd}>+ Create Webinar</button>
      {loading ? <div>Loading...</div> : (
        <table className="webinar-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Topic</th>
              <th>Instructors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {webinars.length === 0 ? (
              <tr><td colSpan="5">No webinars found.</td></tr>
            ) : webinars.map(w => (
              <tr key={w._id}>
                <td>{new Date(w.date).toLocaleDateString()}</td>
                <td>{w.time}</td>
                <td>{w.topic}</td>
                <td>{w.instructors && w.instructors.join(', ')}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(w)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(w._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <AddWebinar
          onClose={handleFormClose}
          editWebinar={editWebinar}
        />
      )}
    </div>
  );
};

export default AdminWebinars; 