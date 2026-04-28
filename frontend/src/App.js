import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyMessagesScreen from './screens/MyMessagesScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import PaymentListScreen from './screens/PaymentListScreen';
import FeedbackListScreen from './screens/FeedbackListScreen';
import BlogScreen from './screens/BlogScreen';
import SingleBlogScreen from './screens/SingleBlogScreen';
import ContactScreen from './screens/ContactScreen';

const RootLanding = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  if (userInfo) {
    return <Redirect to="/home" />;
  }
  return <Redirect to="/login?redirect=/home" />;
};

const App = () => {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Route path="/home" component={HomeScreen} exact />
        <Route path="/contact" component={ContactScreen} />
        <Route path="/order/:id" component={OrderScreen} />
        <Route path="/shipping" component={ShippingScreen} />
        <Route path="/payment" component={PaymentScreen} />
        <Route path="/placeorder" component={PlaceOrderScreen} />
        <Route path="/login" component={LoginScreen} />
        <Route path="/register" component={RegisterScreen} />
        <Route path="/profile" component={ProfileScreen} />
        <Route path="/mymessages" component={MyMessagesScreen} />
        <Route path="/blog" exact component={BlogScreen} />
        <Route path="/blog/:slug" exact component={SingleBlogScreen} />
        <Route path="/product/:id" component={ProductScreen} />
        <Route path="/cart/:id?" component={CartScreen} />
        <Route path="/admin/userlist" component={UserListScreen} />
        <Route path="/admin/user/:id/edit" component={UserEditScreen} />
        <Route path="/admin/productlist" component={ProductListScreen} exact />
        <Route
          path="/admin/productlist/:pageNumber"
          component={ProductListScreen}
          exact
        />
        <Route path="/admin/product/:id/edit" component={ProductEditScreen} />
        <Route path="/admin/orderlist" component={OrderListScreen} />
        <Route path="/admin/paymentlist" component={PaymentListScreen} />
        <Route path="/admin/feedbacklist" component={FeedbackListScreen} />
        <Route path="/search/:keyword" component={HomeScreen} exact />
        <Route path="/page/:pageNumber" component={HomeScreen} exact />
        <Route
          path="/search/:keyword/page/:pageNumber"
          component={HomeScreen}
          exact
        />
        <Route path="/" component={RootLanding} exact />
      </main>
      <ChatBot />
      <Footer />
    </Router>
  );
};

export default App;
