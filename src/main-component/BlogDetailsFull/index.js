import React, {Fragment} from 'react';
import Navbar from '../../components/Navbar'
import BlogDetailsFullwidth from '../../components/BlogDetailsFullwidth'
import Footer from '../../components/footer'
import Scrollbar from '../../components/scrollbar'


const BlogDetailsFull =() => {
    return(
        <Fragment>
            <Navbar/>
            <BlogDetailsFullwidth/>
            <Footer footerClass={'wpo-ne-footer-2'}/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogDetailsFull;