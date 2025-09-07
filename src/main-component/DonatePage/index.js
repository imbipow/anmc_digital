import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import Donate from '../../components/Donate'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const DonatePage =() => {
    return(
        <Fragment>
            <Navbar/>
            <Donate/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default DonatePage;
