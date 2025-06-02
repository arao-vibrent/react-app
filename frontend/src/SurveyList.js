import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSurveys, deleteSurvey } from './api';
import './SurveyList.css';

export default function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    loadSurveys();
  }, [currentPage]);

  const loadSurveys = async (search = searchTerm) => {
    try {
      setLoading(true);
      const response = await getSurveys(currentPage, itemsPerPage, search);
      setSurveys(response.surveys);
      setTotalPages(response.total_pages);
      setTotalSurveys(response.total);
      setLoading(false);
    } catch (err) {
      setError('Failed to load surveys');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await deleteSurvey(id);
        await loadSurveys();
      } catch (err) {
        setError('Failed to delete survey');
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadSurveys();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadSurveys('');
  };

  if (loading) return <div>Loading surveys...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="survey-list">
      <div className="header">
        <h2>Survey</h2>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by ID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={handleClear} className="clear-button">
                ×
              </button>
            )}
          </div>
          <Link to="/creator/new" className="button">Create New Survey</Link>
        </div>
      </div>
      
      {surveys.length === 0 ? (
        <p>No surveys found. Create your first survey!</p>
      ) : (
        <>
          <div className="table-container">
            <table className="survey-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(survey => {
                  const surveyData = JSON.parse(survey.design);
                  return (
                    <tr key={survey.id}>
                      <td>{survey.id}</td>
                      <td>{surveyData.title}</td>
                      <td>{new Date(survey.updated_at).toLocaleString()}</td>
                      <td className="actions">
                        <Link to={`/creator/edit/${survey.id}`} className="button">Edit</Link>
                        <Link to={`/${survey.id}`} className="button">View</Link>
                        <button onClick={() => handleDelete(survey.id)} className="button delete">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="button"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages} (Total: {totalSurveys})</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 