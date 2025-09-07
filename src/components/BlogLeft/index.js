import React from 'react';
import {Link} from 'react-router-dom'
import BlogSidebar from '../BlogSidebar'
import VideoModal from '../../components/ModalVideo'

import blog1 from '../../images/blog/img-7.jpg'
import blog2 from '../../images/blog/img-9.jpg'
import blog3 from '../../images/blog/img-8.jpg'


const BlogLeft = () => {

    const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }


    return(
        <section className="wpo-blog-pg-section left section-padding">
            <div className="container">
                <div className="row">
                    <BlogSidebar/>
                    <div className="col col-lg-8">
                        <div className="wpo-blog-content">
                            <div className="post format-standard-image">
                                <div className="entry-media">
                                   <img src={blog1} alt="" />
                                </div>
                                <ul className="entry-meta">
                                    <li><Link onClick={ClickHandler} to="/blog-details"> By Robert harry</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details"> 25 Feb 2021</Link></li>
                                </ul>
                                <h3><Link onClick={ClickHandler} to="/blog-details">The Importance of Marriage in Islam.</Link></h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt of the graduate ut labore et dolore magna aliqua.</p>
                                <div className="entry-bottom">
                                    <Link onClick={ClickHandler} to="/blog-details" className="read-more">View More...</Link>
                                    <ul>
                                        <li><i className="fi flaticon-like"></i>80</li>
                                        <li><i className="fi flaticon-share"></i></li>
                                    </ul>
                                </div>
                                <div className="blog-thumb-badge">
                                    <div className="blog-thumb-text">
                                        <span>Marriage</span>
                                    </div>
                                </div>
                            </div>
                            <div className="post post-text-wrap">
                                <div className="blog-thumb-text">
                                    <span>Marriage</span>
                                </div>
                                <ul className="entry-meta">
                                    <li><Link onClick={ClickHandler} to="/blog-details"> By Robert harry</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details"> 25 Feb 2021</Link></li>
                                </ul>
                                <h3><Link onClick={ClickHandler} to="/blog-details">The Importance of Marriage in Islam.</Link></h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt of the graduate ut labore et dolore magna aliqua.</p>
                                <div className="entry-bottom">
                                    <Link onClick={ClickHandler} to="/blog-details" className="read-more">View More...</Link>
                                    <ul>
                                        <li><i className="fi flaticon-like"></i>80</li>
                                        <li><i className="fi flaticon-share"></i></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="post format-gallery">
                                <div className="entry-media post-slider">
                                    <img src={blog3} alt="" />
                                </div>
                                <ul className="entry-meta">
                                    <li><Link onClick={ClickHandler} to="/blog-details"> By Robert harry</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details"> 25 Feb 2021</Link></li>
                                </ul>
                                <h3><Link onClick={ClickHandler} to="/blog-details">Compleate Hajj guide for your Hajj.</Link></h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt of the graduate ut labore et dolore magna aliqua.</p>
                                <div className="entry-bottom">
                                    <Link onClick={ClickHandler} to="/blog-details" className="read-more">View More...</Link>
                                    <ul>
                                        <li><i className="fi flaticon-like"></i>80</li>
                                        <li><i className="fi flaticon-share"></i></li>
                                    </ul>
                                </div>
                                <div className="blog-thumb-badge">
                                    <div className="blog-thumb-text">
                                        <span>Health</span>
                                    </div>
                                </div>
                            </div>
                            <div className="post post-text-wrap">
                                <div className="post-bloquote">
                                    <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.</p>
                                    <span>Robert Harry</span>
                                </div>
                                <div className="blog-thumb-text">
                                    <span>Salat</span>
                                </div>
                                <ul className="entry-meta">
                                    <li><Link onClick={ClickHandler} to="/blog-details"> By Robert harry</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details"> 25 Feb 2021</Link></li>
                                </ul>
                                <h3><Link onClick={ClickHandler} to="/blog-details">Salat is the best exercise for body fitness</Link></h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt of the graduate ut labore et dolore magna aliqua.</p>
                                <div className="entry-bottom">
                                    <Link onClick={ClickHandler} to="/blog-details" className="read-more">View More...</Link>
                                    <ul>
                                        <li><i className="fi flaticon-like"></i>80</li>
                                        <li><i className="fi flaticon-share"></i></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="post format-video">
                                <div className="entry-media video-holder">
                                    <img src={blog2} alt="" />
                                    <div className="video-btn2">
                                        <VideoModal/>
                                    </div>
                                </div>
                                <div className="blog-thumb-badge">
                                    <div className="blog-thumb-text">
                                        <span>Salat</span>
                                    </div>
                                </div>
                                <ul className="entry-meta">
                                    <li><Link onClick={ClickHandler} to="/blog-details"> By Robert harry</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details"> 25 Feb 2021</Link></li>
                                </ul>
                                <h3><Link onClick={ClickHandler} to="/blog-details">Salat is the best exercise for body fitness</Link></h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt of the graduate ut labore et dolore magna aliqua.</p>
                                <div className="entry-bottom">
                                    <Link onClick={ClickHandler} to="/blog-details" className="read-more">View More...</Link>
                                    <ul>
                                        <li><i className="fi flaticon-like"></i>80</li>
                                        <li><i className="fi flaticon-share"></i></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="post post-text-wrap">
                                <h5><i className="fi flaticon-link"></i>Risus commodo viverra maecenas accumsan lacus vel.</h5>
                                <div className="blog-thumb-text">
                                    <span>Salat</span>
                                </div>
                                <ul className="entry-meta">
                                    <li><Link onClick={ClickHandler} to="/blog-details"> By Robert harry</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details"> 25 Feb 2021</Link></li>
                                </ul>
                                <h3><Link onClick={ClickHandler} to="/blog-details">Salat is the best exercise for body fitness</Link></h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt of the graduate ut labore et dolore magna aliqua.</p>
                                <div className="entry-bottom">
                                    <Link onClick={ClickHandler} to="/blog-details" className="read-more">View More...</Link>
                                    <ul>
                                        <li><i className="fi flaticon-like"></i>80</li>
                                        <li><i className="fi flaticon-share"></i></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="pagination-wrapper pagination-wrapper-left">
                                <ul className="pg-pagination">
                                    <li>
                                        <Link onClick={ClickHandler} to="/blog-details" aria-label="Previous">
                                            <i className="fi ti-angle-left"></i>
                                        </Link>
                                    </li>
                                    <li className="active"><Link onClick={ClickHandler} to="/blog-details">1</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details">2</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog-details">3</Link></li>
                                    <li>
                                        <Link onClick={ClickHandler} to="/blog-details" aria-label="Next">
                                            <i className="fi ti-angle-right"></i>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
     )
        
}

export default BlogLeft;
