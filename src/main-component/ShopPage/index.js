import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import Service from '../../components/Service'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const ShopPage =() => {
    return(
        <Fragment>
            <Navbar/>
            <Service/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default ShopPage;
