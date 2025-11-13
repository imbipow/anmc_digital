import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
// import SEO from '../../components/SEO'
import About from '../../components/about'
import EventSection from '../../components/event'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'
import evn1 from '../../images/event/img-3.jpg'
import evn2 from '../../images/event/img-4.jpg'


const AboutPage =() => {
    return(
        <Fragment>
            {/* <SEO
                title="About Us"
                description="Learn about the Australian Nepalese Multicultural Centre (ANMC). Discover our mission, values, and commitment to supporting the Nepalese and multicultural community in Australia through various programs and services."
                keywords="About ANMC, Nepalese Community Australia, Multicultural Centre, Community Organization, Australian Nepalese, Our Mission"
            /> */}
            <Navbar/>
            <About/>
            <EventSection eventImg1={evn1} eventImg2={evn2}  EventClass={'wpo-event-area-2'}/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default AboutPage;
