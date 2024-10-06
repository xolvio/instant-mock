import React, {useEffect} from 'react';
import {useNavigate} from 'react-router';
import GraphDashboard from './/graph-dashboard';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/graphs', {replace: true});
  }, [navigate]);

  return <GraphDashboard />;
};

export default Home;
