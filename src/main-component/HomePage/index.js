import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
// import SEO from '../../components/SEO'
import HeroSlider from '../../components/hero/HeroSlider'
import Service from '../../components/Service'
import CounterSection from '../../components/counter'
import BlogSection from '../../components/BlogSection'
import EventSection from '../../components/event'
import ProjectAchievements from '../../components/ProjectAchievements'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'
import blog1 from '../../images/blog/img-1.jpg'
import blog2 from '../../images/blog/img-2.jpg'
import blog3 from '../../images/blog/img-3.jpg'
import hero1 from '../../images/slider/img-3.png'
import evn1 from '../../images/event/img-3.jpg'
import evn2 from '../../images/event/img-4.jpg'


const HomePage =() => {
    return(
        <Fragment>
            {/* <SEO
                title="Home"
                description="Welcome to the Australian Nepalese Multicultural Centre (ANMC). Building a stronger, more connected Nepalese and multicultural community in Australia through cultural programs, social services, and community engagement."
                keywords="ANMC, Australian Nepalese Multicultural Centre, Nepalese Community Australia, Multicultural Centre, Community Programs, Cultural Events, Community Support"
            /> */}
            <Navbar/>
            <HeroSlider HeroStyleClass={'hero-style-2'} heroImg={hero1}/>
            <EventSection eventImg1={evn1} eventImg2={evn2} EventClass={'wpo-event-area-2'}/>
            <ProjectAchievements />
            <BlogSection blogImg1={blog1} blogImg2={blog2} blogImg3={blog3}/>
            <CounterSection countclass={'section-padding'}/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default HomePage;