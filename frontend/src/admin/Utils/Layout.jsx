import React from "react";
import "./common.css";

const Layout = ({ children }) => {
  return (
    <div className="dashboard-admin-no-sidebar">
      {children}
    </div>
  );
};

export default Layout;