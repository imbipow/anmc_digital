import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import Hero from '../../components/hero'
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
            <Navbar/>
            <Hero HeroStyleClass={'hero-style-2'} heroImg={hero1}/>
            <CounterSection countclass={'section-padding'}/>
            <ProjectAchievements />
            <EventSection eventImg1={evn1} eventImg2={evn2} EventClass={'wpo-event-area-2'}/>
            <BlogSection blogImg1={blog1} blogImg2={blog2} blogImg3={blog3}/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default HomePage;