import React, {Fragment} from 'react';
import Navbar2 from '../../components/Navbar2'
import Hero2 from '../../components/hero2'
import About from '../../components/about'
import Service2 from '../../components/Service2'
import PaymentInfo from '../../components/PaymentInfo'
import EventSection from '../../components/event'
import Support from '../../components/Support'
import BlogSection from '../../components/BlogSection'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'
import abimg from '../../images/about.png'
import evn1 from '../../images/event/img-3.jpg'
import evn2 from '../../images/event/img-4.jpg'
import blog1 from '../../images/blog/img-4.jpg'
import blog2 from '../../images/blog/img-5.jpg'
import blog3 from '../../images/blog/img-6.jpg'


const HomePage =() => {
    return(
        <Fragment>
            <Navbar2/>
            <Hero2/>
            <About aboutImg={abimg}/>
            <Service2/>
            <PaymentInfo/>
            <EventSection eventImg1={evn1} eventImg2={evn2} EventClass={'wpo-event-area-2'}/>
            <Support/>
            <BlogSection blogImg1={blog1} blogImg2={blog2} blogImg3={blog3}/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default HomePage;