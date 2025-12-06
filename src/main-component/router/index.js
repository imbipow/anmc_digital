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
import UserSignUpPage from '../UserSignUpPage'
import RegistrationSuccess from '../RegistrationSuccess'
import ForgotPassword from '../ForgotPassword'
import ChangePassword from '../ChangePassword'
import MemberPortal from '../MemberPortal'
import UpdateDetails from '../UpdateDetails'
// MemberDonate removed - donate functionality moved to main /donate page
import MyBookings from '../MyBookings'
import MemberDocuments from '../MemberDocuments'
import BookServices from '../BookServices'
import BookKalash from '../BookKalash'
import KalashBookingSuccess from '../KalashBookingSuccess'
import BookingSuccess from '../BookingSuccess'
import BookingCancelled from '../BookingCancelled'
import AdminPage from '../AdminPage'
import FaqPage from '../FaqPage'
import ProtectedRoute from '../../components/ProtectedRoute'


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
          <Route path='projects' element={<ServicePage/>} />
          <Route path='facilities' element={<ShopPage/>} />
          <Route path='facilities-single' element={<ShopSinglePage/>} />
          <Route path='projects-single' element={<ServiceSinglePage/>} />
          <Route path='event' element={<EventPage/>} />
          <Route path='event/:slug' element={<EventPageSingle/>} />
          <Route path='event-single' element={<EventPageSingle/>} />
          <Route path='donate' element={<DonatePage/>} />
          <Route path='news' element={<BlogPage/>} />
          <Route path='news/:slug' element={<BlogDetails/>} />
          <Route path='news-left' element={<BlogPageLeft/>} />
          <Route path='news-fullwidth' element={<BlogPageFullwidth/>} />
          <Route path='news-details' element={<BlogDetails/>} />
          <Route path='news-details-left' element={<BlogDetailsLeftSiide/>} />
          <Route path='news-details-fullwidth' element={<BlogDetailsFull/>} />
          <Route path='404' element={<ErrorPage/>} />
          <Route path='contact' element={<ContactPage/>} />
          <Route path='login' element={<LoginPage/>} />
          <Route path='signup' element={<SignUpPage/>} />
          <Route path='user-signup' element={<UserSignUpPage/>} />
          <Route path='registration-success' element={<RegistrationSuccess/>} />
          <Route path='forgot-password' element={<ForgotPassword/>} />
          <Route path='change-password' element={<ChangePassword/>} />
          <Route path='member-portal' element={<ProtectedRoute><MemberPortal/></ProtectedRoute>} />
          <Route path='member/update-details' element={<ProtectedRoute><UpdateDetails/></ProtectedRoute>} />
          <Route path='member/book-services' element={<ProtectedRoute><BookServices/></ProtectedRoute>} />
          {/* Member donate route removed - donate functionality available at /donate */}
          <Route path='member/bookings' element={<ProtectedRoute><MyBookings/></ProtectedRoute>} />
          <Route path='member/documents' element={<ProtectedRoute><MemberDocuments/></ProtectedRoute>} />
          <Route path='book-kalash' element={<BookKalash/>} />
          <Route path='kalash-booking-success' element={<KalashBookingSuccess/>} />
          <Route path='booking-success' element={<BookingSuccess/>} />
          <Route path='booking-cancelled' element={<BookingCancelled/>} />
          <Route path='admin' element={<AdminPage/>} />
          <Route path='faq' element={<FaqPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default AllRoute;
