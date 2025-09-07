import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import BlogLeft from '../../components/BlogLeft'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const BlogPageLeft =() => {
    return(
        <Fragment>
            <Navbar/>
            <BlogLeft/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogPageLeft;

