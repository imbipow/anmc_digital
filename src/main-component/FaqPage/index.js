import React, { Fragment } from 'react';
import Navbar from '../../components/Navbar';
import PageTitle from '../../components/pagetitle';
import Faq from '../../components/Faq';
import Footer from '../../components/footer';
import Scrollbar from '../../components/scrollbar';

const FaqPage = () => {
    return (
        <Fragment>
            <Navbar />
            <PageTitle pageTitle={'FAQs'} pagesub={'Frequently Asked Questions'} />
            <Faq />
            <Footer footerClass={'wpo-ne-footer-2'} />
            <Scrollbar />
        </Fragment>
    );
};

export default FaqPage;
