import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import Service2 from '../../components/Service2'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const ServicePage =() => {
    return(
        <Fragment>
            <Navbar/>
            <Service2 serviceClass={'s2'}/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default ServicePage;
