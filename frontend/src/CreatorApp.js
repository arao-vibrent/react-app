import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import { getSurvey, createSurvey, updateSurvey } from "./api";
import "./CreatorApp.css";

export default function CreatorApp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const creatorRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const creator = new SurveyCreator({
      showLogicTab: true,
      isAutoSave: false
    });

    if (id) {
      // Edit mode
      getSurvey(id).then(survey => {
        creator.JSON = JSON.parse(survey.design);
      }).catch(err => {
        setError("Failed to load survey");
      });
    }

    creator.saveSurveyFunc = async (saveNo, callback) => {
      try {
        const surveyData = {
          design: creator.JSON
        };

        if (id) {
          await updateSurvey(id, surveyData);
        } else {
          const { id: newId } = await createSurvey(surveyData);
          navigate(`/creator/edit/${newId}`);
        }
        callback(saveNo, true);
      } catch (error) {
        console.error('Error saving survey:', error);
        callback(saveNo, false);
        setError("Failed to save survey");
      }
    };

    creatorRef.current = creator;
    setReady(true);
  }, [id, navigate]);

  if (!ready) return <div>Loading builder...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="App">
      <div className="creator-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Surveys
        </button>
      </div>
      <SurveyCreatorComponent creator={creatorRef.current} />
    </div>
  );
}
