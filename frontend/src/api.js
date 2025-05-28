const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getSurveys = async (page = 1, perPage = 10, search = '') => {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(search && { search })
    });
    const response = await fetch(`${API_BASE_URL}/surveys?${params}`);
    return response.json();
};

export const getSurvey = async (id) => {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`);
    return response.json();
};

export const createSurvey = async (survey) => {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(survey),
    });
    return response.json();
};

export const updateSurvey = async (id, survey) => {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(survey),
    });
    return response.json();
};

export const deleteSurvey = async (id) => {
    const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
        method: 'DELETE',
    });
    return response.json();
};

export const saveSurveyResponse = async (surveyId, response, participantId) => {
    const params = new URLSearchParams();
    if (participantId) {
        params.append('participantId', participantId);
    }
    const apiResponse = await fetch(`${API_BASE_URL}/responses?${params}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ survey_id: surveyId, response }),
    });
    return apiResponse.json();
}; 