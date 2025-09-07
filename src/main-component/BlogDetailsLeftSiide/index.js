import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import BlogDetailsLeft from '../../components/BlogDetailsLeft'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const BlogDetailsLeftSiide =() => {
    return(
        <Fragment>
            <Navbar/>
            <BlogDetailsLeft/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogDetailsLeftSiide;


