import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ViewerApp from "./ViewerApp";
import CreatorApp from "./CreatorApp";
import SurveyList from "./SurveyList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SurveyList />} />
        <Route path="/creator" element={<SurveyList />} />
        <Route path="/creator/new" element={<CreatorApp />} />
        <Route path="/creator/edit/:id" element={<CreatorApp />} />
        <Route path="/:id" element={<ViewerApp />} />
      </Routes>
    </Router>
  );
}

export default App;
