import React, { useState, useEffect } from 'react'
import {Link}  from 'react-router-dom'
import Logo from '../../images/logo.png'
import Newsletter from '../Newsletter'
import API_CONFIG from '../../config/api'
import fallbackContent from '../../data/fallbackContent'
import './style.css'

const Footer = (props) =>{
    const [contactInfo, setContactInfo] = useState({
        address: '100 Duncans Lane, Diggers Rest VIC 3427',
        phone: '0451 070 296',
        email: 'info@anmcinc.org.au',
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: ''
        }
    });

    useEffect(() => {
        // Fetch contact information from API
        fetch(API_CONFIG.getURL(API_CONFIG.endpoints.contact))
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setContactInfo({
                        address: data.address || contactInfo.address,
                        phone: data.phone || contactInfo.phone,
                        email: data.email || contactInfo.email,
                        socialMedia: data.socialMedia || contactInfo.socialMedia
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching contact info:', error);
                console.log('Using fallback content for Footer');
                // Keep default values if fetch fails (already set in state)
            });
    }, []);

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
                                <p>Place to showcase Nepalese culture and heritage, social gathering and celebrating functions, worship- Hindu and Buddhist temple  </p>
                                <ul>
                                    {contactInfo.socialMedia.facebook && (
                                        <li><a href={contactInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer"><i className="ti-facebook"></i></a></li>
                                    )}
                                    {contactInfo.socialMedia.twitter && (
                                        <li><a href={contactInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer"><i className="ti-twitter-alt"></i></a></li>
                                    )}
                                    {contactInfo.socialMedia.instagram && (
                                        <li><a href={contactInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer"><i className="ti-instagram"></i></a></li>
                                    )}
                                    {contactInfo.socialMedia.youtube && (
                                        <li><a href={contactInfo.socialMedia.youtube} target="_blank" rel="noopener noreferrer"><i className="ti-youtube"></i></a></li>
                                    )}
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
                                    <li><Link onClick={ClickHandler} to="/projects">Our Projects</Link></li>
                                    <li><Link onClick={ClickHandler} to="/donate">Donations</Link></li>
                                    <li><Link onClick={ClickHandler} to="/facilities">Book Facilities</Link></li>
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
                                    <li><Link onClick={ClickHandler} to="/news">Latest News</Link></li>
                                    <li><Link onClick={ClickHandler} to="/signup">Become a member</Link></li>
                                    <li><Link onClick={ClickHandler} to="/faq">FAQ</Link></li>
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
                                        <li><i className="fi ti-location-pin"></i>{contactInfo.address}</li>
                                        <li><i className="fi flaticon-call"></i>{contactInfo.phone}</li>
                                        <li><i className="fi flaticon-envelope"></i>{contactInfo.email}</li>
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