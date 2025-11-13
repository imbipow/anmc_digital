import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
// import SEO from '../../components/SEO'
import Contactpage from '../../components/Contactpage'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const ContactPage =() => {
    return(
        <Fragment>
            {/* <SEO
                title="Contact Us"
                description="Get in touch with the Australian Nepalese Multicultural Centre (ANMC). Contact us for inquiries about our programs, services, membership, or community support. We're here to help."
                keywords="Contact ANMC, Get in Touch, Community Support, ANMC Office, Nepalese Community Contact, Multicultural Centre"
            /> */}
            <Navbar/>
            <Contactpage/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default ContactPage;

