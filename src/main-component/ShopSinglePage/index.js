import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import ShopSingle from '../../components/shopsingle'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const ShopSinglePage =() => {
    return(
        <Fragment>
            <Navbar/>
            <ShopSingle/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default ShopSinglePage;
