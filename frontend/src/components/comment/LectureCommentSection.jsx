import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LectureCommentSection.css';
import { server } from '../../main'; // adjust if needed

const LectureCommentSection = ({ lectureId, isPaidUser, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all comments
  useEffect(() => {
    if (!lectureId) return;

    const fetchComments = async () => {
      try {
        const res = await axios.get(`${server}/api/comments/${lectureId}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setAllComments(res.data.comments.reverse()); // most recent first
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [lectureId]);

  // Post a new comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `${server}/api/comments`,
        {
          lectureId,
          text: newComment,
        },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      // Add new comment to the list
      setAllComments([res.data.comment, ...allComments]);
      setNewComment('');
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="comment-container">
      <h2 className="comment-header">
        {allComments.length === 1 ? '1 Comment' : `${allComments.length} Comments`}
      </h2>

      {isPaidUser && (
        <div className="input-row">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
            className="comment-input"
          />
          <button onClick={handlePostComment} className="post-btn">
            Post
          </button>
        </div>
      )}

      <div className="comment-list">
        {loading ? (
          <p>Loading comments...</p>
        ) : allComments.length > 0 ? (
          allComments.map((comment) => (
            <div key={comment._id} className="comment-block">
              <span className="comment-user">@{comment.username}</span>
              <p className="comment-text">{comment.text}</p>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="no-comment-text">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default LectureCommentSection;
