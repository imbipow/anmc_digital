import React, { useState, useEffect } from 'react'
import {Link}  from 'react-router-dom'
import API_CONFIG from '../../config/api'
import './style.css'

const HeaderTopbar2 = () => {
    const [contactInfo, setContactInfo] = useState({
        address: '28 Street, New York City, USA',
        email: 'Anmc@gmail.com',
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
                        email: data.email || contactInfo.email,
                        socialMedia: data.socialMedia || contactInfo.socialMedia
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching contact info:', error);
                // Keep default values if fetch fails
            });
    }, []);

    return(
        <div className="header-topbar">
            <div className="container">
                <div className="row">
                    <div className="col col-md-6 col-sm-7 col-12">
                        <div className="contact-intro">
                            <ul>
                                <li><i className="fi ti-location-pin"></i>{contactInfo.address}</li>
                                <li><i className="fi flaticon-envelope"></i> {contactInfo.email}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col col-md-6 col-sm-5 col-12">
                        <div className="contact-info">
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
                                <li><Link className="theme-btn-s2" to="/donate">Make Donation </Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderTopbar2;