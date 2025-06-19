import React from 'react'
import "./dashboard.css"
import CourseCard from '../../components/coursecard/CourseCard';

const Dashboard = () => {
  const {mycourse} = CourseData(); 
  return (
    <div className="student-dashboard">
      <h2>All enrolled Courses</h2>
      <div className="dashboard-content">
        {
          mycourse && mycourse.length>0 ? mycourse.map((e)=>(
            <CourseCard key={e._id} course={e}/>
          )) : (<p> No courses enrolled yet</p>)
        }
      </div>
      
    </div>
  )
}

export default Dashboard
