import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaChevronRight, FaPlus } from 'react-icons/fa';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const initialMessage = {
    id: 1,
    text: 'Hello! Welcome to Handmade Haven. How can I help you today?',
    isBot: true,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const history = useHistory();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const quickQuestions = [
    { text: 'Track my order 🚚', action: 'order status' },
    { text: 'Trending products 🔥', action: 'recommend' },
    { text: 'Become a Seller 🎨', action: 'seller' },
    { text: 'Payment methods 💳', action: 'payment' },
    { text: 'Return policy 📦', action: 'return' },
    { text: 'Our mission 🤝', action: 'mission' },
  ];

  const startNewConversation = () => {
    setMessages([{
      ...initialMessage,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
    setLoading(false);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, isBot = false) => {
    const newMessage = {
      id: Date.now(),
      text,
      isBot,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const processResponse = async (text) => {
    const lowerText = text.toLowerCase();
    setLoading(true);

    // Artificial delay to feel more natural
    const delay = Math.random() * 1000 + 1000;

    setTimeout(async () => {
      let response = '';
      
      // Personality and Greetings
      if (lowerText.match(/^(hi|hello|hey|greetings|hola)/)) {
        response = userInfo 
          ? `Hello ${userInfo.name}! It's great to see you back. How can I assist you with your artisan journey today?`
          : 'Hello there! Welcome to Handmade Haven, your gateway to authentic Indian craftsmanship. How can I help you explore our collection today?';
      } 
      
      // Order Tracking & Status
      else if (lowerText.includes('order status') || lowerText.includes('track') || lowerText.includes('where is my package')) {
        if (userInfo) {
          response = `I see you're logged in, ${userInfo.name}. I'm redirecting you to your profile where you can see the real-time status of all your orders. Just a moment...`;
          addMessage(response, true);
          setTimeout(() => {
            history.push('/profile');
            setIsOpen(false);
          }, 2000);
          setLoading(false);
          return;
        } else {
          response = 'I can certainly help you track your order. Please provide your **Order ID** (e.g., #1) and the **Email address** used for the purchase in this format: "Track #1 for email@example.com".\n\nAlternatively, you can log in to view your complete order history.';
        }
      }

      // Product Information & Recommendations
      else if (lowerText.includes('product') || lowerText.includes('buy') || lowerText.includes('items') || lowerText.includes('recommend')) {
        try {
          const { data } = await axios.get('/api/products/top');
          const topProducts = data.slice(0, 3).map(p => `• **${p.name}** (₹${p.price})`).join('\n');
          response = `We have some exquisite handmade pieces! Our currently trending products include:\n\n${topProducts}\n\nWould you like to see more in a specific category like home decor or jewelry?`;
        } catch (error) {
          response = 'We offer a wide range of authentic handicrafts including pottery, textiles, and jewelry. You can explore our full collection on the Home page!';
        }
      }

      // Shipping & Delivery
      else if (lowerText.includes('shipping') || lowerText.includes('delivery') || lowerText.includes('how long')) {
        response = 'We take great care in packaging our artisan products. \n\n• **Prepaid Orders:** 3-5 business days.\n• **Cash on Delivery:** 5-7 business days.\n\nAll orders are shipped with tracking so you can follow their journey!';
      }

      // Returns & Refunds
      else if (lowerText.includes('return') || lowerText.includes('refund') || lowerText.includes('exchange')) {
        response = 'Your satisfaction is our priority. We accept returns within **7 days** of delivery if the product is damaged or not as described. Please ensure the artisan tag remains intact.';
      }

      // Payment Methods
      else if (lowerText.includes('payment') || lowerText.includes('pay') || lowerText.includes('method')) {
        response = 'We offer several secure payment options for your convenience:\n• Credit/Debit Cards\n• UPI (Google Pay, PhonePe, etc.)\n• Cash on Delivery (COD)';
      }

      // About & Mission
      else if (lowerText.includes('who are you') || lowerText.includes('about') || lowerText.includes('mission')) {
        response = 'Handmade Haven is a mission-driven platform dedicated to bringing the soul of Indian villages to the global stage. We connect rural artisans directly with you, ensuring fair wages and preserving traditional crafts.';
      }

      // Become a Seller
      else if (lowerText.includes('seller') || lowerText.includes('sell') || lowerText.includes('join as artisan')) {
        response = 'We are always looking for talented artisans! To join us as a seller, please register an account and select "Seller" during signup, or contact our team for a partnership.';
      }

      // Specific Order Query Pattern
      else if (lowerText.includes('@') && (lowerText.includes('#') || lowerText.match(/\d+/))) {
        const orderIdMatch = lowerText.match(/#?(\d+)/);
        const emailMatch = lowerText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);

        if (orderIdMatch && emailMatch) {
          const orderId = orderIdMatch[1];
          const email = emailMatch[0];
          try {
            const { data } = await axios.get(`/api/chat/orders/${orderId}?email=${email}&apiKey=dev-chat-key-123`);
            const status = data.isDelivered ? '✅ Delivered' : (data.isPaid ? '🚚 In Transit' : '⏳ Pending Payment');
            response = `**Order #${data.id} Summary:**\nStatus: ${status}\nTotal: ₹${data.total}\nItems: ${data.items.map(i => i.name).join(', ')}\n\nIs there anything else I can help you with regarding this order?`;
          } catch (error) {
            response = 'I couldn\'t locate that specific order. Please double-check the Order ID and Email address. If you continue to have trouble, our support team is ready to help!';
          }
        } else {
          response = 'To look up an order, I need both the Order ID and your Email address. Could you please provide them?';
        }
      }

      // Thank you
      else if (lowerText.includes('thank') || lowerText.includes('thanks')) {
        response = 'You\'re very welcome! It was my pleasure. Feel free to reach out if you have any more questions. Happy shopping!';
      }

      // Default
      else {
        response = 'That\'s an interesting question! While I\'m still learning, I can help you with **order tracking**, **product recommendations**, **shipping info**, and **payment queries**. \n\nWhat would you like to explore first?';
      }

      addMessage(response, true);
      setLoading(false);
    }, delay);
  };

  const handleQuickQuestion = (question) => {
    addMessage(question, false);
    processResponse(question);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = input;
    addMessage(userMessage, false);
    setInput('');
    processResponse(userMessage);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <Card className="chatbot-window shadow-lg border-0">
          <Card.Header className="d-flex justify-content-between align-items-center chatbot-header">
            <div>
              <FaRobot className="mr-2" /> <strong>HH Assistant</strong>
            </div>
            <div className="d-flex align-items-center">
              <Button 
                variant="link" 
                className="text-white p-0 mr-3" 
                onClick={startNewConversation}
                title="New Conversation"
              >
                <FaPlus size={14} />
              </Button>
              <Button 
                variant="link" 
                className="text-white p-0" 
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                <div className="message-icon">
                  {msg.isBot ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper bot">
                <div className="message-icon"><FaRobot /></div>
                <div className="message-content typing">...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </Card.Body>
          
          <div className="chatbot-quick-chips">
            {quickQuestions.map((q, index) => (
              <Button 
                key={index}
                variant="outline-primary" 
                className="quick-chip"
                onClick={() => handleQuickQuestion(q.text)}
                disabled={loading}
              >
                {q.text}
              </Button>
            ))}
          </div>

          <Card.Footer className="chatbot-footer">
            <Form onSubmit={submitHandler} className="d-flex">
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
              />
              <Button type="submit" variant="primary" className="ml-2">
                <FaPaperPlane />
              </Button>
            </Form>
          </Card.Footer>
        </Card>
      ) : (
        <Button className="chatbot-toggle rounded-circle shadow-lg" onClick={() => setIsOpen(true)}>
          <FaComments size={24} />
          <span className="chatbot-label">Chat with us 👋</span>
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
