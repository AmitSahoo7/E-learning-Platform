import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../main";

const CourseContext = createContext();

export const CourseContextProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState([]);
  const [mycourse, setMyCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchCourses() {
    try {
      console.log("Fetching courses from:", `${server}/api/course/all`);
      const { data } = await axios.get(`${server}/api/course/all`);
      console.log("Received courses data:", data);
      setCourses(data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(error.message);
    }
  }

  async function fetchCourse(id) {
    try {
      const { data } = await axios.get(`${server}/api/course/${id}`);
      setCourse(data.course);
    } catch (error) {
      console.error("Error fetching single course:", error);
      setError(error.message);
    }
  }

  async function fetchMyCourse() {
    try {
      const { data } = await axios.get(`${server}/api/mycourse`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setMyCourse(data.courses);
    } catch (error) {
      console.error("Error fetching my courses:", error);
      setError(error.message);
    }
  }

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([fetchCourses(), fetchMyCourse()]).then(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        fetchCourses,
        fetchCourse,
        course,
        mycourse,
        fetchMyCourse,
        loading,
        error
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const CourseData = () => useContext(CourseContext);