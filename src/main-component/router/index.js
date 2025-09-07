import React from 'react';
import { BrowserRouter, Routes, Route, } from "react-router-dom";

import Homepage from '../HomePage'
import Homepage2 from '../HomePage2'
import Homepage3 from '../HomePage3'
import Homepage4 from '../HomePage4'
import AboutPage from '../AboutPage'
import ServicePage from '../ServicePage'
import ShopPage from '../ShopPage'
import ShopSinglePage from '../ShopSinglePage'
import ServiceSinglePage from '../ServiceSinglePage'
import EventPage from '../EventPage'
import EventPageSingle from '../EventPageSingle'
import DonatePage from '../DonatePage'
import BlogPage from '../BlogPage'
import BlogPageLeft from '../BlogPageLeft'
import BlogPageFullwidth from '../BlogPageFullwidth'
import BlogDetails from '../BlogDetails'
import BlogDetailsLeftSiide from '../BlogDetailsLeftSiide'
import BlogDetailsFull from '../BlogDetailsFull'
import ErrorPage from '../ErrorPage'
import ContactPage from '../ContactPage'
import LoginPage from '../LoginPage'
import SignUpPage from '../SignUpPage'
import ForgotPassword from '../ForgotPassword'
import MemberPortal from '../MemberPortal'
import UpdateDetails from '../UpdateDetails'
import BookServices from '../BookServices'
import MemberDonate from '../MemberDonate'
import MyBookings from '../MyBookings'
import MemberDocuments from '../MemberDocuments'
import AdminApp from '../../admin/Admin'
import TestAPI from '../../TestAPI'
import TestHomepageData from '../../TestHomepageData'


const AllRoute = () => {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<Homepage/>} />
          <Route path='home' element={<Homepage/>} />
          <Route path='home2' element={<Homepage2/>} />
          <Route path='home3' element={<Homepage3/>} />
          <Route path='home4' element={<Homepage4/>} />
          <Route path='about' element={<AboutPage/>} />
          <Route path='service' element={<ServicePage/>} />
          <Route path='shop' element={<ShopPage/>} />
          <Route path='shop-single' element={<ShopSinglePage/>} />
          <Route path='service-single' element={<ServiceSinglePage/>} />
          <Route path='event' element={<EventPage/>} />
          <Route path='event-single' element={<EventPageSingle/>} />
          <Route path='donate' element={<DonatePage/>} />
          <Route path='blog' element={<BlogPage/>} />
          <Route path='blog-left' element={<BlogPageLeft/>} />
          <Route path='blog-fullwidth' element={<BlogPageFullwidth/>} />
          <Route path='blog-details' element={<BlogDetails/>} />
          <Route path='blog-details-left' element={<BlogDetailsLeftSiide/>} />
          <Route path='blog-details-fullwidth' element={<BlogDetailsFull/>} />
          <Route path='404' element={<ErrorPage/>} />
          <Route path='contact' element={<ContactPage/>} />
          <Route path='login' element={<LoginPage/>} />
          <Route path='signup' element={<SignUpPage/>} />
          <Route path='forgot-password' element={<ForgotPassword/>} />
          <Route path='member-portal' element={<MemberPortal/>} />
          <Route path='member/update-details' element={<UpdateDetails/>} />
          <Route path='member/book-services' element={<BookServices/>} />
          <Route path='member/donate' element={<MemberDonate/>} />
          <Route path='member/bookings' element={<MyBookings/>} />
          <Route path='member/documents' element={<MemberDocuments/>} />
          <Route path='admin/*' element={<AdminApp/>} />
          <Route path='test-api' element={<TestAPI/>} />
          <Route path='test-homepage-data' element={<TestHomepageData/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default AllRoute;
