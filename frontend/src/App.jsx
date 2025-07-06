// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignInSide from './pages/SignInSide';
import SignUpSide from './pages/SignUpSide';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignInSide />} />
        <Route path="/signup" element={<SignUpSide />} />
        <Route path="/" element={<SignInSide />} />
      </Routes>
    </Router>
  );
};

export default App;
