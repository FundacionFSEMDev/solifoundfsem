import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <h1>Comunidad Colaborativa</h1>
        <p>
          Conéctate con personas de ideas afines y expertos en diferentes campos para crear soluciones innovadoras.
        </p>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    height: 120px;
    padding: 0.5rem;
    background: rgba(198, 198, 198, 0.34);
    border-radius: 8px;
    backdrop-filter: blur(5px);
    border-bottom: 3px solid rgba(255, 255, 255, 0.440);
    border-left: 2px  rgba(255, 255, 255, 0.545) outset;
    box-shadow: -40px 50px 30px rgba(0, 0, 0, 0.280);
    transform: skewX(10deg);
    transition: .4s;
    overflow: hidden;
    color: #333;
  }

  .card:hover {
    height: 254px;
    transform: skew(0deg);
  }

  .card h1 {
    text-align: center;
    margin: 1.3rem 1.3rem 2.5rem;
    font-size: 1.25rem;
    color: var(--primary);
    text-shadow: -1px 1px 2px rgba(0, 0, 0, 0.2);
  }

  .card p {
    opacity: 0;
    padding: 0 1rem;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.5;
    transition: opacity 0.3s ease-in-out;
  }

  .card:hover p {
    opacity: 1;
  }`

export default Card;