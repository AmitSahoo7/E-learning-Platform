import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './LectureCommentSection.css';
import { server } from '../../main';
import { FiMoreVertical } from 'react-icons/fi';

const LectureCommentSection = ({ lectureId, isPaidUser, user }) => {
  const [newComment, setNewComment] = useState('');
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${server}/api/comments/${lectureId}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setAllComments(res.data.comments.reverse());
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lectureId) fetchComments();
  }, [lectureId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `${server}/api/comments/${lectureId}`,
        { text: newComment },
        { headers: { token: localStorage.getItem("token") } }
      );
      setAllComments([res.data.comment, ...allComments]);
      setNewComment('');
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${server}/api/comments/${commentId}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setAllComments(allComments.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleMenuToggle = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  return (
    <div className="comment-container">
      <div className="comment-box">
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
                <div className="comment-header-row">
                  <span className="comment-user">{comment.userId?.name || "User"}</span>

                  {user && comment.userId && (user._id === comment.userId._id || user.role === "admin") && (
                  <div className="menu-wrapper">
                    <FiMoreVertical
                      className="menu-icon"
                      onClick={() => handleMenuToggle(comment._id)}
                    />
                    {activeMenu === comment._id && (
                      <div className="dropdown-menu">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this comment?")) {
                              handleDeleteComment(comment._id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
                </div>
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
    </div>
  );
};

export default LectureCommentSection;
