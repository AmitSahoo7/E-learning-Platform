import 'aos/dist/aos.css'; // Import AOS CSS
import AOS from 'aos';

AOS.init(); // Initialize AOS

export const server = import.meta.env.VITE_SERVER;

if (!server) {
  throw new Error("VITE_SERVER is not defined. Check your environment variables.");
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import { CourseContextProvider } from "./context/CourseContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserContextProvider>
        <CourseContextProvider>
          <App />
        </CourseContextProvider>
      </UserContextProvider>
    </BrowserRouter>
  </StrictMode>
);
