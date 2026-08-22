import { createContext, useContext, useEffect, useState } from "react";

import { getUsers, initializeStorage, saveUsers } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();

    const storedUser = localStorage.getItem("dayflow_current_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  function login(email, password) {
    initializeStorage();

    const users = getUsers();

    const foundUser = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );

    if (!foundUser) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    if (!foundUser.verified) {
      return {
        success: false,
        message: "Your email is not verified. Please complete email verification.",
      };
    }

    const sessionUser = { ...foundUser };

    delete sessionUser.password;

    localStorage.setItem("dayflow_current_user", JSON.stringify(sessionUser));

    setUser(sessionUser);

    return {
      success: true,
      user: sessionUser,
    };
  }

  function signup({ employeeId, name, email, password, role }) {
    initializeStorage();

    const users = getUsers();

    const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    const id = employeeId.trim() || `EMP${String(users.length + 1).padStart(3, "0")}`;

    const employee = {
      id,
      name,
      email,
      password,
      role: role === "hr" ? "admin" : "employee",
      department: "Not Assigned",
      designation: "Employee",
      status: "Active",
      phone: "",
      address: "",
      salary: {
        base: 0,
        allowances: 0,
        deductions: 0,
      },
      jobDetails: {
        joiningDate: new Date().toISOString().split("T")[0],
        employmentType: "Full Time",
        manager: "Not Assigned",
      },
      documents: [],
      profilePicture: "",
      verified: false,
    };

    saveUsers([...users, employee]);

    localStorage.setItem(
      "dayflow_pending_verification",
      JSON.stringify({
        email,
        id,
      })
    );

    return {
      success: true,
      user: employee,
    };
  }

  function verifyEmail(email) {
    const users = getUsers();

    const updatedUsers = users.map((item) =>
      item.email.toLowerCase() === email.toLowerCase()
        ? {
            ...item,
            verified: true,
          }
        : item
    );

    saveUsers(updatedUsers);

    localStorage.removeItem("dayflow_pending_verification");

    return true;
  }

  function logout() {
    localStorage.removeItem("dayflow_current_user");
    setUser(null);
  }

  function updateCurrentUser(updates) {
    if (!user) return;

    const users = getUsers();

    const updatedUsers = users.map((item) =>
      item.id === user.id
        ? {
            ...item,
            ...updates,
          }
        : item
    );

    saveUsers(updatedUsers);

    const updatedUser = {
      ...user,
      ...updates,
    };

    localStorage.setItem("dayflow_current_user", JSON.stringify(updatedUser));

    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        verifyEmail,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}