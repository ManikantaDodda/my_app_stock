import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Table from './Table';
import History from './History';
import './App.css';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Table />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
