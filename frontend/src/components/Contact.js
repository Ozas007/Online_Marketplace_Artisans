import React from 'react';
import styled from 'styled-components';
import { contactItems } from '../constants/contactConstant';
import { FaLongArrowAltRight } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <Container className="section">
      <div className="title">
        <h2>get in touch</h2>
        <div className="underline"></div>
      </div>

      <SectionCenter className="section-center">
        <ContactInfo>
          <p>
            If you have any questions or just want to get in touch, ping us via
            the form. We look forward to hear from you!
          </p>
          {contactItems.map((item) => (
            <div key={item.id} className="contact-item">
              <span>{item.icon}</span>
              <h5>{item.title}:</h5>
              <p>{item.description}</p>
            </div>
          ))}
        </ContactInfo>

        <ContactForm />
      </SectionCenter>
    </Container>
  );
};

const ContactForm = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [name, setName] = React.useState(userInfo ? userInfo.name : '');
  const [email, setEmail] = React.useState(userInfo ? userInfo.email : '');
  const [emailError, setEmailError] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [succeeded, setSucceeded] = React.useState(false);
  const [error, setError] = React.useState('');

  const validateEmail = (value) => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(ok ? '' : 'Please enter a valid email address');
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) return;
    setError('');
    if (!name || !email || !subject || !message) {
      setError('Please fill all fields');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setSubmitting(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post('/api/feedback', { 
        name, 
        email, 
        subject, 
        message,
        type: 'ADMIN',
        recipientId: null
      }, config);
      setSucceeded(true);
      setName(userInfo.name);
      setEmail(userInfo.email);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to send');
    } finally {
      setSubmitting(false);
    }
  };

  if (!userInfo) {
    return (
      <FormContainer>
        <div className="form text-center">
          <h4 className="mb-4">Please log in to send a message</h4>
          <Link to="/login?redirect=/contact" className="btn btn-danger">
            Login to Contact Us
          </Link>
        </div>
      </FormContainer>
    );
  }

  if (userInfo.isAdmin) {
    return (
      <FormContainer>
        <div className="form text-center">
          <h4 className="mb-4">Admin Dashboard</h4>
          <p>As an administrator, you receive messages from users. You don't need to send messages to yourself.</p>
          <Link to="/admin/feedbacklist" className="btn btn-danger">
            View Received Messages
          </Link>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <form className="form" onSubmit={onSubmit}>
        <h4 className="mb-4">
          {succeeded
            ? 'Your message has been sent!'
            : 'send a message'}
        </h4>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <article>
          <div className="contact-from-control">
            <label htmlFor="Name">name</label>
            <input type="text" name="Name" required value={name} onChange={(e)=>setName(e.target.value)} readOnly />
          </div>
          <div className="contact-from-control">
            <label htmlFor="Email">email</label>
            <input
              type="email"
              name="Email"
              required
              value={email}
              readOnly
            />
          </div>
        </article>

        <div className="contact-from-control">
          <label htmlFor="Subject">subject</label>
          <input type="text" name="Subject" required value={subject} onChange={(e)=>setSubject(e.target.value)} />
        </div>

        <div className="contact-from-control">
          <label htmlFor="Message">message</label>
          <textarea
            name="Message"
            placeholder="Your message here..."
            required
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-block btn-danger"
          disabled={submitting}
        >
          {submitting ? 'sending...' : 'send message'} <FaLongArrowAltRight />
        </button>
      </form>
    </FormContainer>
  );
};

const Container = styled.section`
  .title {
    text-align: center;
    margin: 0 auto 2rem;
  }
`;

const SectionCenter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  overflow-x: hidden;

  @media (min-width: 992px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 4rem;
  }
`;

const ContactInfo = styled.article`
  max-width: 592px;
  margin: 0 auto;

  .contact-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    border-bottom: 1px solid #ccc;
    padding: 1.5rem 0;

    &:last-child {
      border-bottom: none;
    }

    span {
      font-size: 1.25rem;
      background-color: var(--clr-primary-5);
      color: var(--clr-white);
      padding: 0.35rem 0.7rem;
      margin-right: 0.5rem;
      text-align: center;
      border-radius: 50%;
      height: 3rem;
      width: 3rem;

      svg {
        vertical-align: middle;
      }
    }

    h5,
    p {
      margin-bottom: 0;
    }
  }
`;

const FormContainer = styled.article`
  .form {
    background-color: #f5f5f5;
    padding: 3rem 2rem;
    max-width: 592px;
    margin: 0 auto;
    border-radius: var(--radius);

    @media (max-width: 492px) {
      padding: 1.5rem;
    }
  }

  h4 {
    color: var(--clr-primary-2);
    text-align: center;
  }

  .contact-from-control {
    margin: 1rem 0;

    label {
      text-transform: capitalize;
      color: var(--clr-primary-2);
    }

    input,
    textarea {
      margin-top: 0.25rem;
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--clr-grey);
      outline: 0;
      border-radius: var(--radius);
    }

    textarea {
      height: 100px;
      resize: vertical;
      font-family: var(--bodyFont);
    }
  }

  article {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    .contact-from-control {
      margin: 0;
    }
  }

  .btn {
    font-family: 'Poppins', sans-serif;
    font-size: 0.9rem;

    &:hover {
      background-color: var(--clr-red-dark);
    }
  }
`;

export default Contact;
