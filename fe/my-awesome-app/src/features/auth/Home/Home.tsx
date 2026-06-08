import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            For My <span>One and Only</span>
          </h1>
          <p className="hero-subtitle">
            Every moment with you is a treasure. This space is dedicated 
            to celebrating our journey, our memories, and all the 
            reasons why I love you more each day.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Start Our Journey
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Enter My Love
            </button>
          </div>
        </div>
        <div className="hero-image-placeholder">
          {/* You can place a romantic illustration or a picture of you two here */}
          <div className="blob-decoration"></div>
        </div>
      </section>

      <section className="features-preview">
        <div className="feature-item">
          <h3>Our Memories</h3>
          <p>A safe place to keep all our beautiful moments together.</p>
        </div>
        <div className="feature-item">
          <h3>Just For Us</h3>
          <p>A private, special corner of the internet meant only for you.</p>
        </div>
        <div className="feature-item">
          <h3>Endless Love</h3>
          <p>Because words alone aren't enough to express what you mean to me.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;