import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/defaultV2.min.css";
import "./CreatorApp.css";
import { getSurvey, saveSurveyResponse } from "./api";

export default function ViewerApp() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());
  const [surveyInfo, setSurveyInfo] = useState(null);

  useEffect(() => {
    getSurvey(id).then(survey => {
      const surveyData = JSON.parse(survey.design);
      setSurveyInfo(surveyData);
      setModel(new Model(surveyData));
      setLoading(false);
    }).catch(err => {
      setError("Failed to load survey");
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading survey...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!model) return <div>Survey not found</div>;

  const handleComplete = async (sender) => {
    try {
      const participantId = searchParams.get('participantId');
      await saveSurveyResponse(id, sender.data, participantId);
      
      // Prepare result object for parent frame
      const result = {
        sourceId: "2",
        source: "SurveyJS",
        name: surveyInfo?.title || "Survey",
        description: surveyInfo?.description || "",
        startTime: startTime,
        completionTime: Date.now(),
        detailedResult: sender.data
      };

      // Log the result object
      console.log('Survey Result:', result);

      // Send message to parent frame
      window.parent.postMessage(result, '*');
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  return <div className="viewer-scope">
          <div className="creator-scope">
            <Survey model={model} onComplete={handleComplete} />
          </div>
      </div>;
}
