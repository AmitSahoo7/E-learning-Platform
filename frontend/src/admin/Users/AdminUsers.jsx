import React, { useEffect, useState } from "react";
import "./users.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";
import Loading from '../../components/loading/Loading';
import { UserData } from '../../context/UserContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = UserData();

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${server}/api/admin/users`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, newRole) => {
    if (window.confirm("Are you sure you want to update this user's role?")) {
      try {
        const { data } = await axios.put(
          `${server}/api/admin/user/${id}`,
          { role: newRole },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        toast.success(data.message);
        fetchUsers(); // Refresh the user list
      } catch (error) {
        toast.error(error.response?.data?.message || "Update failed.");
      }
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      return navigate("/");
    }
    fetchUsers();
  }, [user, navigate]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout>
      <nav className="admin-feature-nav">
        <a href="/admin/dashboard" className="admin-feature-link">Dashboard Home</a>
        <a href="/admin/course/add" className="admin-feature-link">Add Course</a>
        <a href="/admin/course" className="admin-feature-link">Manage Courses</a>
        <a href="/admin/users" className="admin-feature-link">Manage Users</a>
      </nav>
      <div className="admin-users-page">
        <h2>All Users</h2>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Update Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem._id}>
                  <td>{userItem._id}</td>
                  <td>{userItem.name}</td>
                  <td>{userItem.email}</td>
                  <td>{userItem.role}</td>
                  <td>
                    <select
                      value={userItem.role}
                      onChange={e => updateRole(userItem._id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 4 }}
                    >
                      <option value="user">user</option>
                      <option value="instructor">instructor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;
