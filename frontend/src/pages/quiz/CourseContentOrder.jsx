import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CourseContentOrder = ({ user }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const fetchContent = async () => {
      setLoading(true);
      try {
        const [lecturesRes, quizzesRes] = await Promise.all([
          axios.get(`${server}/api/lectures/${courseId}`, { headers: { token: localStorage.getItem('token') } }),
          axios.get(`${server}/api/quiz/${courseId}`, { headers: { token: localStorage.getItem('token') } })
        ]);
        const lectures = Array.isArray(lecturesRes.data) ? lecturesRes.data : lecturesRes.data.lectures || [];
        const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];
        const merged = [
          ...lectures.map(l => ({ ...l, type: 'lecture', id: l._id })),
          ...quizzes.map(q => ({ ...q, type: 'quiz', id: q._id }))
        ];
        merged.sort((a, b) => (a.order || 0) - (b.order || 0));
        setContentList(merged);
      } catch {
        setContentList([]);
      }
      setLoading(false);
    };
    fetchContent();
  }, [courseId]);

  function DraggableItem({ item }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, border: '1px solid #eee', borderRadius: 8, margin: '8px 0', background: '#fff', padding: 16, display: 'flex', alignItems: 'center', cursor: 'grab' }}>
        <span {...attributes} {...listeners} style={{ marginRight: 12, fontWeight: 700, cursor: 'grab' }}>≡</span>
        {item.type === 'lecture' ? (
          <span>Lecture: {item.title}</span>
        ) : (
          <span>Quiz: {item.title}</span>
        )}
      </div>
    );
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = contentList.findIndex(i => i.id === active.id);
    const newIndex = contentList.findIndex(i => i.id === over.id);
    const newList = arrayMove(contentList, oldIndex, newIndex);
    setContentList(newList);
    // Prepare payload for backend
    const items = newList.map((item, idx) => ({ type: item.type, id: item.id, order: idx + 1 }));
    try {
      await axios.post(`${server}/api/course/update-content-order`, { courseId, items }, { headers: { token: localStorage.getItem('token') } });
    } catch {}
  };

  // Only allow admin/instructor
  const isInstructor = user && (user.role === 'admin' || user.role === 'instructor');
  if (!isInstructor) return <div style={{ padding: 32, color: 'red' }}>Access denied.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#f9f9f9', borderRadius: 12, padding: 32 }}>
      <h2 style={{ marginBottom: 24 }}>Reorder Course Content</h2>
      {loading ? (
        <div>Loading content...</div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={contentList.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {contentList.map(item => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </SortableContext>
        </DndContext>
      )}
      <button style={{ marginTop: 32 }} onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default CourseContentOrder; 