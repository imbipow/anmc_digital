import React, {Fragment} from 'react';
import Header from '../../components/header'
import EventSection2 from '../../components/event2'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'
import evn1 from '../../images/event/img-1.jpg'
import evn2 from '../../images/event/img-2.jpg'
import evn3 from '../../images/event/img-6.jpg'
import evn4 from '../../images/event/img-7.jpg'


const EventPage =() => {
    return(
        <Fragment>
            <Header/>
            <EventSection2 eventImg1={evn1} eventImg2={evn2} eventImg3={evn3} eventImg4={evn4} EventClass={'wpo-event-area-2'}/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default EventPage;
