import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import BlogFullwidth from '../../components/BlogFullwidth'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const BlogPageFullwidth =() => {
    return(
        <Fragment>
            <Navbar/>
            <BlogFullwidth/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogPageFullwidth;

