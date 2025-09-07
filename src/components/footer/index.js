import React from 'react'
import {Link}  from 'react-router-dom'
import Logo from '../../images/logo.png'
import Newsletter from '../Newsletter'
import './style.css'

const Footer = (props) =>{

    const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

  return(
    <div className={`wpo-ne-footer ${props.footerClass}`}>
        <Newsletter/>
        <footer className="wpo-site-footer">
            <div className="wpo-upper-footer">
                <div className="container">
                    <div className="row">
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="widget about-widget">
                                <div className="logo widget-title">
                                    <img src={Logo} alt="" />
                                </div>
                                <p>Building bridges, strengthening communities. Fostering cultural diversity and community engagement across Australia.</p>
                                <ul>
                                    <li><Link onClick={ClickHandler} to="/"><i className="ti-facebook"></i></Link></li>
                                    <li><Link onClick={ClickHandler} to="/"><i className="ti-twitter-alt"></i></Link></li>
                                    <li><Link onClick={ClickHandler} to="/"><i className="ti-instagram"></i></Link></li>
                                    <li><Link onClick={ClickHandler} to="/"><i className="ti-google"></i></Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="widget link-widget">
                                <div className="widget-title">
                                    <h3>Quick Links</h3>
                                </div>
                                <ul>
                                    <li><Link onClick={ClickHandler} to="/about">About ANMC</Link></li>
                                    <li><Link onClick={ClickHandler} to="/service">Our Projects</Link></li>
                                    <li><Link onClick={ClickHandler} to="/donate">Become Member</Link></li>
                                    <li><Link onClick={ClickHandler} to="/shop">Book Facilities</Link></li>
                                    <li><Link onClick={ClickHandler} to="/event">Events</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col col-lg-2 col-md-6 col-12">
                            <div className="widget link-widget">
                                <div className="widget-title">
                                    <h3>Community</h3>
                                </div>
                                <ul>
                                    <li><Link onClick={ClickHandler} to="/blog">Latest News</Link></li>
                                    <li><Link onClick={ClickHandler} to="/blog">Newsletter</Link></li>
                                    <li><Link onClick={ClickHandler} to="/donate">Volunteer</Link></li>
                                    <li><Link onClick={ClickHandler} to="/donate">Donations</Link></li>
                                    <li><Link onClick={ClickHandler} to="/contact">Contact Us</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col col-lg-3 offset-lg-1 col-md-6 col-12">
                            <div className="widget market-widget wpo-service-link-widget">
                                <div className="widget-title">
                                    <h3>Connect</h3>
                                </div>
                                <p>Get in touch with us for community programs, events, and support.</p>
                                <div className="contact-ft">
                                    <ul>
                                        <li><i className="fi ti-location-pin"></i>123 Community Drive, Melbourne VIC 3000</li>
                                        <li><i className="fi flaticon-call"></i>03 9555 1234</li>
                                        <li><i className="fi flaticon-envelope"></i>info@anmc.org.au</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="wpo-lower-footer">
                <div className="container">
                    <div className="row">
                        <div className="col col-xs-12">
                            <p className="copyright">&copy; 2025 ANMC INC. All rights reserved. | Registered with CAV</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
  )
} 

export default Footer;