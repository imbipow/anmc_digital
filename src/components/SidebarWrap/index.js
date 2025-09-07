import React from 'react';
import {Link} from 'react-router-dom'
import evnt from '../../images/blog/profile.png'
import ins1 from '../../images/recent-posts/img-4.jpg'
import ins2 from '../../images/recent-posts/img-6.jpg'
import ins3 from '../../images/recent-posts/img-5.jpg'


const SidebarWrap = () => {

    const SubmitHandler = (e) =>{
       e.preventDefault()
    }

    return(
        <div className="col col-lg-4 col-12">
            <div className="wpo-blog-sidebar">
                <div className="widget profile-widget">
                    <div className="profile-img">
                        <img src={evnt} alt="" />
                        <h2>Alexander Bartler</h2>
                        <p>Hi! here is our blog. Read our post - and be with us</p>
                    </div>
                    <div className="pro-social">
                        <ul>
                            <li><Link to="/event-single"><i className="ti-facebook"></i></Link></li>
                            <li><Link to="/event-single"><i className="ti-twitter-alt"></i></Link></li>
                            <li><Link to="/event-single"><i className="ti-instagram"></i></Link></li>
                            <li><Link to="/event-single"><i className="ti-google"></i></Link></li>
                        </ul>
                    </div>
                </div>
                <div className="widget search-widget">
                    <form onSubmit={SubmitHandler}>
                        <div>
                            <input type="text" className="form-control" placeholder="Search Post.."/>
                            <button type="submit"><i className="ti-search"></i></button>
                        </div>
                    </form>
                </div>
                <div className="widget recent-post-widget">
                    <h3>Upcoming Event</h3>
                    <div className="posts">
                        <div className="post">
                            <div className="img-holder">
                                <img src={ins1} alt=""/>
                            </div>
                            <div className="details">
                                <h4><Link to="/event-single">Many Children are suffering a lot for food.</Link></h4>
                                <span className="date">22 Sep 2021</span>
                            </div>
                        </div>
                        <div className="post">
                            <div className="img-holder">
                                <img src={ins2} alt=""/>
                            </div>
                            <div className="details">
                                <h4><Link to="/event-single">Be kind for the poor people and the kids.</Link></h4>
                                <span className="date">22 Sep 2021</span>
                            </div>
                        </div>
                        <div className="post">
                            <div className="img-holder">
                                <img src={ins3} alt=""/>
                            </div>
                            <div className="details">
                                <h4><Link to="/event-single">Be soft and kind for the poor people.</Link></h4>
                                <span className="date">22 Sep 2021</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="widget tag-widget">
                    <h3>Tags</h3>
                    <ul>
                        <li><Link to="/event-single">Salat</Link></li>
                        <li><Link to="/event-single">Quran</Link></li>
                        <li><Link to="/event-single">Books</Link></li>
                        <li><Link to="/event-single">Education</Link></li>
                        <li><Link to="/event-single">World Wide</Link></li>
                        <li><Link to="/event-single">Marriage</Link></li>
                        <li><Link to="/event-single">Hajj</Link></li>
                        <li><Link to="/event-single">Health</Link></li>
                    </ul>
                </div>
            </div>
        </div>
     )
        
}

export default SidebarWrap;
