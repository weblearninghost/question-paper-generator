import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

import QuestionPapers from "../pages/question-paper/QuestionPapers";
import CreateQuestionPaper from "../pages/question-paper/CreateQuestionPaper";
import QuestionPaperDetails from "../pages/question-paper/QuestionPaperDetails";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/question-papers" element={<QuestionPapers />} />

          <Route
            path="/question-papers/create"
            element={<CreateQuestionPaper />}
          />

          <Route
            path="/question-papers/:paperId"
            element={<QuestionPaperDetails />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
