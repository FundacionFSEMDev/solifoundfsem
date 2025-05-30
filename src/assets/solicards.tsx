import React from 'react';
import styled from 'styled-components';
import { Users, HeartHandshake, Lightbulb } from 'lucide-react';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div data-text="Diversidad" style={{transform: 'rotate(-15deg)'}} className="glass">
          <Users size={40} />
        </div>
        <div data-text="Igualdad" style={{transform: 'rotate(5deg)'}} className="glass">
          <HeartHandshake size={40} />
        </div>
        <div data-text="Innovación" style={{transform: 'rotate(25deg)'}} className="glass">
          <Lightbulb size={40} />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container .glass {
    position: relative;
    width: 180px;
    height: 200px;
    background: linear-gradient(#fff2, transparent);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 25px rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.5s;
    border-radius: 10px;
    margin: 0 -45px;
    backdrop-filter: blur(10px);
  }

  .container:hover .glass {
    transform: rotate(0deg) !important;
    margin: 0 10px;
  }

  .container .glass::before {
    content: attr(data-text);
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }
  
  .container .glass svg {
    fill: #fff;
    stroke: #fff;
  }
`;

export default Card