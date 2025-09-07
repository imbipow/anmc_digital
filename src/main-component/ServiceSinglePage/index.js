import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import ServiceSingle from '../../components/ServiceSingle'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const ServiceSinglePage =() => {
    return(
        <Fragment>
            <Navbar/>
            <ServiceSingle/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default ServiceSinglePage;
