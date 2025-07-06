import React, { useEffect, useState } from 'react';
import './webinar.css';
import axios from 'axios';
import CountdownIST from '../../components/CountdownIST';
import { server } from '../../main';

const API_URL = '/api/webinar';

function formatDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return '';
  const dateObj = new Date(dateStr);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'long' });
  const year = dateObj.getFullYear();
  // Ordinal suffix
  const j = day % 10, k = day % 100;
  let dayStr = day + (k === 11 || k === 12 || k === 13 ? 'th' : (j === 1 ? 'st' : (j === 2 ? 'nd' : (j === 3 ? 'rd' : 'th'))));
  // 12-hour time
  let [h, m] = timeStr.split(':');
  h = Number(h);
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  const timeFormatted = `${h}:${m} ${ampm}`;
  return `${dayStr} ${month} ${year} at ${timeFormatted}`;
}

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
      <h1 className="webinar-title">Upcoming Webinars</h1>
      {loading ? <div className="webinar-loading">Loading webinars...</div> : (
        webinars.length === 0 ? (
          <>
            <div className="webinar-empty">No upcoming webinars.</div>
            <p className="webinar-description">
              Stay tuned for our next free webinar! Here you'll find all the details and registration links for our upcoming events.
            </p>
          </>
        ) : (
          <div className="webinar-cards-row" style={{ background: 'none', boxShadow: 'none', borderRadius: 0, padding: 0 }}>
            {webinars
              .slice()
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(w => (
                <div className="webinar-card" key={w._id}>
                  {w.poster && (
                    <img src={`${server}/uploads/${w.poster}`} alt="Webinar Poster" className="webinar-card-poster" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />
                  )}
                  <div className="webinar-card-topic">{w.topic}</div>
                  <div className="webinar-card-time">{formatDateTime(w.date, w.time)}</div>
                  <div className="webinar-card-instructors"><b>Instructors:</b> {w.instructors && w.instructors.join(', ')}</div>
                  {w.description && <div className="webinar-card-desc">{w.description}</div>}
                  <div className="webinar-card-obj"><b>Objectives:</b> {w.objectives}</div>
                  {w.notes && <div className="webinar-card-notes"><b>Notes:</b> {w.notes}</div>}
                  {w.document && <div className="webinar-card-doc"><a href={`/uploads/${w.document}`} target="_blank" rel="noopener noreferrer">View Document</a></div>}
                  <CountdownIST date={w.date} time={w.time} />
                </div>
              ))}
          </div>
        )
      )}

      {/* Past Webinars Section */}
      <h2 className="webinar-title" style={{ marginTop: '3rem' }}>Past Webinars</h2>
      <div className="webinar-cards-row" style={{ background: 'none', boxShadow: 'none', borderRadius: 0, padding: 0 }}>
        <div className="webinar-card">
          <img src="/default-course.png" alt="Demo Poster" className="webinar-card-poster" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />
          <div className="webinar-card-topic">Demo Past Webinar</div>
          <div className="webinar-card-time">5th May 2024 at 4:00 pm</div>
          <div className="webinar-card-instructors"><b>Instructors:</b> Demo Instructor</div>
          <div className="webinar-card-desc">This is a demo past webinar about learning new tech skills.</div>
          <div className="webinar-card-obj"><b>Objectives:</b> Demo objectives</div>
          <div className="webinar-countdown" style={{ background: '#232f4b', color: '#f87171' }}>Completed</div>
        </div>
      </div>
    </div>
  );
};

export default Webinar; 