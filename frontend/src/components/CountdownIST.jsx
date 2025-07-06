import React, { useEffect, useState } from 'react';

function getISTDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  // If dateStr is ISO string, extract YYYY-MM-DD
  let datePart = dateStr;
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    datePart = dateStr.split('T')[0];
  }
  // If dateStr is a Date object, format to YYYY-MM-DD
  if (dateStr instanceof Date) {
    datePart = dateStr.toISOString().slice(0, 10);
  }
  const [year, month, day] = (datePart || '').split('-').map(Number);
  const [hour, minute] = (timeStr || '').split(':').map(Number);
  if ([year, month, day, hour, minute].some(isNaN)) return null;
  // Create a Date in UTC, then add 5:30 offset for IST
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
  utcDate.setHours(utcDate.getHours() + 5, utcDate.getMinutes() + 30);
  return utcDate;
}

function getISTNow() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
}

function getCountdown(targetDate) {
  if (!targetDate) return null;
  const now = getISTNow();
  let diff = targetDate - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  if ([days, hours, minutes].some(isNaN)) return null;
  return { days, hours, minutes };
}

const CountdownIST = ({ date, time }) => {
  const [countdown, setCountdown] = useState(() => getCountdown(getISTDate(date, time)));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const update = () => {
      const target = getISTDate(date, time);
      if (!target) {
        setInvalid(true);
        setCountdown(null);
        return;
      }
      setInvalid(false);
      setCountdown(getCountdown(target));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [date, time]);

  if (!date || !time) return null;
  if (invalid) return <div className="webinar-countdown">Invalid date/time</div>;
  if (!countdown) return <div className="webinar-countdown">Started</div>;
  return (
    <div className="webinar-countdown">
      Starts in: {countdown.days}d {countdown.hours}h {countdown.minutes}m
    </div>
  );
};

export default CountdownIST; 