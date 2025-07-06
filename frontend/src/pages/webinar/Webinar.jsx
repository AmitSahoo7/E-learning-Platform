import React, { useEffect, useState } from 'react';
import './webinar.css';
import axios from 'axios';

const API_URL = '/api/webinar';

const Webinar = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const { data } = await axios.get(API_URL);
        // Show all webinars, no date filter
        const allWebinars = data.webinars || [];
        setWebinars(allWebinars);
      } catch {
        setWebinars([]);
      }
      setLoading(false);
    };
    fetchWebinars();
  }, []);

  return (
    <div className="webinar-page-container">
      <h1 className="webinar-title">Upcoming Webinar</h1>
      <p className="webinar-description">
        Stay tuned for our next free webinar! Here you'll find all the details and registration links for our upcoming events.
      </p>
      {loading ? <div className="webinar-loading">Loading webinars...</div> : (
        webinars.length === 0 ? <div className="webinar-empty">No upcoming webinars.</div> : (
          <div className="webinar-cards-row">
            {webinars.map(w => (
              <div className="webinar-card" key={w._id}>
                <div className="webinar-card-topic">{w.topic}</div>
                <div className="webinar-card-time">{new Date(w.date).toLocaleDateString()} at {w.time}</div>
                <div className="webinar-card-instructors"><b>Instructors:</b> {w.instructors && w.instructors.join(', ')}</div>
                <div className="webinar-card-desc"><b>Description:</b> {w.description}</div>
                <div className="webinar-card-obj"><b>Objectives:</b> {w.objectives}</div>
                {w.notes && <div className="webinar-card-notes"><b>Notes:</b> {w.notes}</div>}
                {w.document && <div className="webinar-card-doc"><a href={`/uploads/${w.document}`} target="_blank" rel="noopener noreferrer">View Document</a></div>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Webinar; 