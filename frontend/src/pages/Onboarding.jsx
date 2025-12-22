import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new symptom assessment page
    navigate('/symptom-assessment', { replace: true });
  }, [navigate]);

  return null;
};

export default Onboarding; 