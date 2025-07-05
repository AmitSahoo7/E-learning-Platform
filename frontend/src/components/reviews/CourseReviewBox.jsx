import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";
import "./CourseReviewBox.css";

const CourseReviewBox = ({ courseId, user }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [userReviewId, setUserReviewId] = useState(null);
  const isPaidUser =
    user?.subscription?.includes(courseId) || user?.role === "admin";

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${server}/api/course-review/${courseId}`);
      setReviews(res.data.reviews);

      const existingReview = res.data.reviews.find(
        (r) => r.userId._id === user?._id
      );
      if (existingReview) {
        setUserReviewId(existingReview._id);
        setRating(existingReview.rating);
        setReviewText(existingReview.review || "");
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  useEffect(() => {
    if (courseId && user) {
      // Reset local state when course changes
      setRating(0);
      setReviewText("");
      setUserReviewId(null);
      fetchReviews();
    }
  }, [courseId, user]);

  const handleSubmit = async () => {
    if (!rating) return alert("Please provide a rating!");

    try {
      const { data } = await axios.post(
        `${server}/api/course-review/${courseId}`,
        { rating, review: reviewText },
        { headers: { token: localStorage.getItem("token") } }
      );
      /*console.log("✅ Submitted review:", data);*/
      fetchReviews();
    } catch (error) {
      console.error("❌ Failed to submit review", error);
      alert(error?.response?.data?.message || "Error submitting review");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${server}/api/course-review/${courseId}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setRating(0);
      setReviewText("");
      setUserReviewId(null);
      fetchReviews();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="course-review-box">
      <h3>
        Course Rating: ⭐ {averageRating} ({reviews.length} reviews)
      </h3>

      {isPaidUser && (
        <div className="submit-section">
          <p>Your Rating:</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                onClick={() => setRating(i)}
                className={i <= rating ? "filled" : ""}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your experience (optional)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <button onClick={handleSubmit}>Submit</button>
          
        </div>
      )}

      <div className="reviews-list">
        {reviews.map((r) => (
          <div key={r._id} className="review-card">
            <div className="review-head">
              <strong>{r.userId?.name || "User"}</strong>
              <span className="stars-static">{"★".repeat(r.rating)}</span>
            </div>
            <p>{r.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseReviewBox;

