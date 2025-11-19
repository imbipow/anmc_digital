import React, { useState, useEffect } from 'react'
import {Link}  from 'react-router-dom'
import contentService from '../../services/contentService'
import './style.css'

const HeaderTopbar = () => {
    const [contactInfo, setContactInfo] = useState({
        phone: '+61 3 9876 5432',
        email: 'info@anmcinc.org.au'
    });

    useEffect(() => {
        const loadContactInfo = async () => {
            try {
                const data = await contentService.getContact();
                if (data) {
                    setContactInfo({
                        phone: data.phone || '+61 3 9876 5432',
                        email: data.email || 'info@anmcinc.org.au'
                    });
                }
            } catch (error) {
                console.error('Error loading contact info:', error);
                // Keep default values if API fails
            }
        };
        loadContactInfo();
    }, []);

    return(
        <div className="topbar">
            <div className="container">
                <div className="row">
                    <div className="col col-md-6 col-sm-12 col-12">
                        <div className="contact-intro">
                            <ul>
                                <li><i className="fi flaticon-call"></i>{contactInfo.phone}</li>
                                <li><i className="fi flaticon-envelope"></i> {contactInfo.email}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col col-md-6 col-sm-12 col-12">
                        <div className="contact-info">
                            <ul>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/signup">Become a member</Link></li>
                                <li><Link className="theme-btn" to="/donate">Donate Now</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderTopbar;