import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_CONFIG from '../../config/api'
import cognitoAuthService from '../../services/cognitoAuth'
import './style.css'

const Service = (props) => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch services data from API
        fetch(API_CONFIG.getURL(API_CONFIG.endpoints.servicesActive))
            .then(response => response.json())
            .then(data => {
                // Filter out cleaning services (service category items)
                const filteredServices = data.filter(service =>
                    service.category !== 'service' &&
                    !service.anusthanName.toLowerCase().includes('cleaning')
                );
                setServices(filteredServices);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching services:', error);
                setLoading(false);
            });
    }, []);

    const formatDuration = (hours) => {
        if (!hours || hours === 0) return 'Contact for details';
        if (hours < 1) return `${hours * 60} minutes`;
        if (hours === 1) return '1 hour';
        return `${hours} hours`;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            service: 'fa-cog',
            small: 'fa-pray',
            medium: 'fa-place-of-worship',
            large: 'fa-gopuram',
            special: 'fa-star'
        };
        return icons[category] || 'fa-om';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            service: 'Service/Facility',
            small: 'Small Puja',
            medium: 'Medium Puja',
            large: 'Large Puja',
            special: 'Special'
        };
        return labels[category] || category;
    };

    const handleBookNow = async (service) => {
        try {
            // Check if user is logged in
            const isLoggedIn = await cognitoAuthService.isAuthenticated();

            if (isLoggedIn) {
                // User is logged in, redirect to booking page
                navigate('/member/book-services');
            } else {
                // User is not logged in, redirect to login page
                navigate('/login', {
                    state: {
                        message: 'Please login to book services',
                        returnUrl: '/member/book-services'
                    }
                });
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            // On error, redirect to login page
            navigate('/login', {
                state: {
                    message: 'Please login to book services',
                    returnUrl: '/member/book-services'
                }
            });
        }
    };

    if (loading) {
        return (
            <div className="facilities-page">
                <div className="facilities-overview-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 col-md-12 offset-lg-2">
                                <div className="wpo-section-title text-center">
                                    <h2>Loading Services...</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div className="facilities-page">
            {/* Services Overview Section */}
            <div className="facilities-overview-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12 offset-lg-2">
                            <div className="wpo-section-title text-center">
                                <h2>Our Services & Anusthans</h2>
                                <p>ANMC offers a comprehensive range of religious services and anusthans designed to serve our community's spiritual needs. From small poojas to grand ceremonies, we provide traditional services that honor our cultural and religious heritage.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kalash Booking Priority Section */}
            <div className="kalash-booking-section" style={{ backgroundColor: '#fff3e0', padding: '60px 0', marginBottom: '40px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 col-md-12 offset-lg-1">
                            <div className="kalash-card" style={{
                                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    width: '200px',
                                    height: '200px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%'
                                }}></div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-30px',
                                    left: '-30px',
                                    width: '150px',
                                    height: '150px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%'
                                }}></div>

                                <div className="row align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                                    <div className="col-lg-8 col-md-12">
                                        <div className="kalash-icon" style={{ marginBottom: '20px' }}>
                                            <i className="fa fa-star" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.9)' }}></i>
                                        </div>
                                        <h2 style={{ color: 'white', marginBottom: '15px', fontSize: '32px', fontWeight: 'bold' }}>
                                            Kalash Booking
                                        </h2>
                                        <p style={{ fontSize: '18px', marginBottom: '20px', lineHeight: '1.6', color: 'rgba(255,255,255,0.95)' }}>
                                            Book your sacred Kalash for special ceremonies and occasions. Choose between 1 or 2 Kalash with special pricing.
                                        </p>
                                        <div className="kalash-pricing" style={{ marginBottom: '25px' }}>
                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                <div style={{
                                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                                    padding: '12px 20px',
                                                    borderRadius: '8px',
                                                    backdropFilter: 'blur(10px)'
                                                }}>
                                                    <div style={{ fontSize: '14px', opacity: 0.9 }}>1 Kalash</div>
                                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>$111 AUD</div>
                                                </div>
                                                <div style={{
                                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                                    padding: '12px 20px',
                                                    borderRadius: '8px',
                                                    backdropFilter: 'blur(10px)'
                                                }}>
                                                    <div style={{ fontSize: '14px', opacity: 0.9 }}>2 Kalash</div>
                                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>$151 AUD</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-12 text-center">
                                        <Link
                                            to="/book-kalash"
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: 'white',
                                                color: '#ff9800',
                                                padding: '18px 40px',
                                                borderRadius: '50px',
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                textDecoration: 'none',
                                                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                                                transition: 'all 0.3s ease',
                                                border: '3px solid white'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = '#fff8e1';
                                                e.target.style.transform = 'translateY(-3px)';
                                                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'white';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                                            }}
                                        >
                                            <i className="fa fa-calendar-check" style={{ marginRight: '10px' }}></i>
                                            Book Kalash Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Cards Section */}
            <div className="facility-cards-section">
                <div className="container">
                    <div className="facility-cards-wrapper">
                        {services.map((service, index) => (
                            <div key={service.id} className="facility-card">
                                <div className="facility-header">
                                    <div className="facility-icon">
                                        <i className={`fa ${getCategoryIcon(service.category)}`}></i>
                                    </div>
                                    <div className="facility-title-section">
                                        <h3>{service.anusthanName}</h3>
                                        <div className="capacity-info">
                                            <span className="category-badge">{getCategoryLabel(service.category)}</span>
                                        </div>
                                    </div>
                                    <div className="pricing-badge">
                                        ${service.amount.toFixed(2)}
                                    </div>
                                </div>

                                <div className="facility-content">
                                    {service.notes && (
                                        <p className="facility-description">{service.notes}</p>
                                    )}

                                    <div className="facility-features">
                                        <h4>Service Details</h4>
                                        <ul className="features-list">
                                            <li>
                                                <i className="fa fa-clock"></i>
                                                Duration: {formatDuration(service.durationHours)}
                                            </li>
                                            <li>
                                                <i className="fa fa-dollar-sign"></i>
                                                Cost: ${service.amount.toFixed(2)} AUD
                                            </li>
                                            <li>
                                                <i className="fa fa-tag"></i>
                                                Category: {getCategoryLabel(service.category)}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="facility-action" style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleBookNow(service)}
                                            className="theme-btn"
                                            style={{
                                                backgroundColor: '#1e3c72',
                                                color: 'white',
                                                padding: '12px 30px',
                                                border: 'none',
                                                borderRadius: '5px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s ease',
                                                width: '100%'
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#2a5298'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#1e3c72'}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Important Notes Section */}
            <div className="facilities-notes-section" style={{ backgroundColor: '#f8f9fa', padding: '60px 0', marginTop: '40px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 col-md-12 offset-lg-1">
                            <div className="wpo-section-title text-center" style={{ marginBottom: '40px' }}>
                                <h2>Important Notes</h2>
                                <p style={{ color: '#666', fontSize: '16px' }}>Please read these important guidelines before booking our services</p>
                            </div>
                            <div className="notes-content" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        ANMC Excom. will review the above price in each Quarter
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        Please refer to the opening hours. Any Karya outside of these hours requires pre-booking with the Priest
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        Devotees are expected to bring all necessary pooja items
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        <strong>A 50% discount applies to ANMC life members, except the cleaning fee</strong>
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        You are welcome to use the Kitchen and Hall area for the Catering event
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        Other special pooja rates can be negotiated with the Priest or Lama Guru
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        Please ensure that tables, chairs, and kitchen items are stacked and organized before you leave, as the cleaning fee will not cover this
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        <strong>For larger Anusthan, please get in touch with ANMC for pricing (more than 60 people)</strong>
                                    </li>
                                    <li style={{ marginBottom: '15px', paddingLeft: '25px', position: 'relative', lineHeight: '1.6', color: '#333' }}>
                                        <i className="fa fa-check-circle" style={{ position: 'absolute', left: 0, top: '3px', color: '#4caf50' }}></i>
                                        Excom reserve the right to review the above price
                                    </li>
                                </ul>

                                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                                    <h4 style={{ color: '#856404', marginBottom: '15px', fontSize: '18px' }}>
                                        <i className="fa fa-exclamation-triangle" style={{ marginRight: '10px' }}></i>
                                        Mandatory Cleaning Fee ($160):
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        <li style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative', color: '#856404' }}>
                                            <i className="fa fa-arrow-right" style={{ position: 'absolute', left: 0, top: '3px' }}></i>
                                            Any event with more than 21 guests
                                        </li>
                                        <li style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative', color: '#856404' }}>
                                            <i className="fa fa-arrow-right" style={{ position: 'absolute', left: 0, top: '3px' }}></i>
                                            Any event with a catering service
                                        </li>
                                        <li style={{ marginBottom: '10px', paddingLeft: '25px', position: 'relative', color: '#856404' }}>
                                            <i className="fa fa-arrow-right" style={{ position: 'absolute', left: 0, top: '3px' }}></i>
                                            Any event using Kitchen area
                                        </li>
                                    </ul>
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