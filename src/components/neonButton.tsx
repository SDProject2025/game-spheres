// components/NeonButton.tsx
import searchUsers from "@/app/searchUsers/page";
import React from "react";
import { SiRclone } from "react-icons/si";
import styled from "styled-components";

type NeonButtonProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  src?: string;
  alt?: string;
  color?: string | "#00ffc3";
  variant?: "filled" | "outline";
};

const NeonButton = ({
  children,
  onClick,
  type = "button",
  src,
  alt,
  color = "#00ffc3",
  variant = "filled",
}: NeonButtonProps) => {
  return (
    <StyledWrapper neonColor={color} variant={variant}>
      <button className="btn" type={type} onClick={onClick}>
        <strong>{children}</strong>
        <div id="container-stars">
          <div id="stars" />
        </div>
        <div id="glow">
          <div className="circle" />
          <div className="circle" />
        </div>
        {src && <img src={src} alt={alt} className="h-5 w-15" />}
      </button>
    </StyledWrapper>
  );
};

export default NeonButton;

// ⬇️ styled-components styles:
const StyledWrapper = styled.div<{ neonColor: string, variant: "filled" | "outline" }>`
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 13rem;
    height: 3rem;
    cursor: pointer;
    border-radius: 5rem;
    position: relative;
    overflow: hidden;
    transition: 0.5s;

    border: ${(props) =>
    props.variant === "filled" 
      ? "double 2px transparent" 
      : `2px solid ${props.neonColor}`};

    background: ${(props) =>
    props.variant === "filled"
      ? "#1d1d1d"
      : "transparent"};

    background-image: ${(props) =>
    props.variant === "filled"
      ? `linear-gradient(#1d1d1d, #1d1d1d),
         linear-gradient(137.48deg, #00ffc3 10%, #00e6b3 45%, #00ff87 67%, #00a896 87%)`
      : "none"};

    background-origin: border-box;
    background-clip: content-box, border-box;

    animation: ${(props) =>
    props.variant === "filled" ? "gradient_301 5s ease infinite" : "none"};
  }

  #container-stars {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: 0.5s;
    backdrop-filter: blur(1rem);
    border-radius: 5rem;
  }

  strong {
   z-index: 2;
   font-family: "Montserrat", sans-serif;
   font-size: 11px;
   letter-spacing: 5px;
   color: ${(props) =>
     props.variant === "filled" ? "#fff" : props.neonColor};
   text-shadow: 0 0 4px ${(props) => (props.variant === "filled" ? "white" : props.neonColor)};
   padding: 10 50rem; 
 }

  #glow {
    position: absolute;
    display: flex;
    width: 12rem;
  }

  .circle {
    width: 100%;
    height: 30px;
    filter: blur(2rem);
    animation: pulse_3011 4s infinite;
    background: ${(props) => props.neonColor}; // stars colored in both variants
  }

  .circle:nth-of-type(1) {
    background: rgba(0, 255, 186, 0.636);
  }

  .circle:nth-of-type(2) {
    background: rgba(0, 255, 134, 0.4);
  }

  .btn:hover #container-stars {
    z-index: 1;
    background-color: #212121;
  }

  .btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px ${(props) => props.neonColor};
  }

  .btn:active {
    border: double 4px #fe53bb;
    background-origin: border-box;
    background-clip: content-box, border-box;
    animation: none;
  }

  .btn:active .circle {
    background: #fe53bb;
  }

  #stars {
    position: relative;
    background: transparent;
    width: 200rem;
    height: 200rem;
  }

  #stars::after {
    content: "";
    position: absolute;
    top: -10rem;
    left: -100rem;
    width: 100%;
    height: 100%;
    animation: animStarRotate 90s linear infinite;
    background-image: radial-gradient(#ffffff 1px, transparent 1%);
    background-size: 50px 50px;
  }

  #stars::before {
    content: "";
    position: absolute;
    top: 0;
    left: -50%;
    width: 170%;
    height: 500%;
    animation: animStar 60s linear infinite;
    background-image: radial-gradient(#ffffff 1px, transparent 1%);
    background-size: 50px 50px;
    opacity: 0.5;
  }

  @keyframes animStar {
    from {
      transform: translateY(0);
    }

    to {
      transform: translateY(-135rem);
    }
  }

  @keyframes animStarRotate {
    from {
      transform: rotate(360deg);
    }

    to {
      transform: rotate(0);
    }
  }

  @keyframes gradient_301 {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes pulse_3011 {
    0% {
      transform: scale(0.75);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
    }

    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
    }

    100% {
      transform: scale(0.75);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
`;
