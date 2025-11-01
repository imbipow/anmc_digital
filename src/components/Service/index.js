import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_CONFIG from '../../config/api'
import './style.css'

const Service = (props) => {
    const [facilities, setFacilities] = useState([]);

    useEffect(() => {
        // Fetch facilities data from API
        fetch(API_CONFIG.getURL(API_CONFIG.endpoints.facilities))
            .then(response => response.json())
            .then(data => setFacilities(data))
            .catch(error => console.error('Error fetching facilities:', error));
    }, []);

    return(
        <div className="facilities-page">
            {/* Facilities Overview Section */}
            <div className="facilities-overview-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12 offset-lg-2">
                            <div className="wpo-section-title text-center">
                                <h2>Our Facilities</h2>
                                <p>ANMC offers world-class facilities designed to serve our community's diverse needs. From grand celebrations to intimate gatherings, our spaces provide the perfect setting for your events while honoring our cultural heritage.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Facility Cards Section */}
            <div className="facility-cards-section">
                <div className="container">
                    <div className="facility-cards-wrapper">
                        {facilities.map((facility, index) => (
                            <div key={facility.id} className="facility-card">
                                <div className="facility-header">
                                    <div className="facility-icon">
                                        <i className={`fa ${facility.icon}`}></i>
                                    </div>
                                    <div className="facility-title-section">
                                        <h3>{facility.name}</h3>
                                        <div className="capacity-info">
                                            <i className="fa fa-users"></i>
                                            <span>{facility.capacity}</span>
                                        </div>
                                    </div>
                                    <div className="pricing-badge">
                                        {facility.pricing}
                                    </div>
                                </div>
                                
                                <div className="facility-content">
                                    <p className="facility-description">{facility.description}</p>
                                    
                                    <div className="facility-features">
                                        <h4>Features & Amenities</h4>
                                        <ul className="features-list">
                                            {facility.features.map((feature, idx) => (
                                                <li key={idx}>
                                                    <i className="fa fa-check-circle"></i>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="facilities-contact-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12 offset-lg-2">
                            <div className="wpo-section-title text-center">
                                <h2>Book Our Facilities</h2>
                                <p>Interested in booking any of our facilities? Please contact us or visit our member portal to make a reservation.</p>
                                <div className="contact-buttons">
                                    <Link to="/contact" className="theme-btn">Contact Us</Link>
                                    <Link to="/member-portal" className="theme-btn theme-btn-primary">Member Portal</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Service;