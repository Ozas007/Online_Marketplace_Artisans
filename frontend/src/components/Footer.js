import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <Wrapper>
      <div className="footer-content">
        <p className="copyright">
          Copyright &copy;{new Date().getFullYear()}
          <span> Handmade Haven</span>
        </p>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.footer`
  min-height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--clr-black);
  color: var(--clr-white);
  padding: 1rem 0;

  .footer-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .copyright {
    margin: 0;
    color: var(--clr-white);
    letter-spacing: var(--spacing);
    font-size: 1rem;
    span {
      color: var(--clr-primary-5);
    }
  }
`;

export default Footer;
