import React, { useState } from 'react'
import './style.css'

const Service = (props) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        facility: '',
        eventType: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        expectedGuests: '',
        memberStatus: '',
        specialRequirements: '',
        cateringNeeds: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Booking form submitted:', formData);
        // Handle form submission logic here
    };

    const facilities = [
        {
            id: 'car-puja',
            name: 'Car Puja (Vehicle Blessing)',
            capacity: '5-15 people',
            description: 'Traditional blessing ceremony for new vehicles with Puja rituals performed by our experienced priests.',
            features: [
                'Traditional Puja rituals',
                'Experienced Hindu priests',
                'All Puja materials included',
                'Blessing ceremony documentation',
                'Sacred thread (Kalash) provided',
                'Photography area available'
            ],
            pricing: '$50',
            icon: 'fa-car'
        },
        {
            id: 'marriage-ceremony',
            name: 'Marriage Ceremony',
            capacity: '50-200 people',
            description: 'Complete traditional Nepali wedding ceremony with all rituals conducted according to Hindu traditions.',
            features: [
                'Full traditional wedding rituals',
                'Qualified Hindu priest',
                'Wedding mandap setup',
                'Sacred fire ceremony (Havan)',
                'All ceremonial materials',
                'Photography/videography space',
                'Bridal preparation area',
                'Guest seating arrangements'
            ],
            pricing: '$200',
            icon: 'fa-heart'
        },
        {
            id: 'bartabhanda-ceremony',
            name: 'Bartabhanda Ceremony',
            capacity: '30-100 people',
            description: 'Sacred thread ceremony for young men, marking their spiritual initiation into Hindu traditions.',
            features: [
                'Complete Bartabhanda rituals',
                'Sacred thread ceremony',
                'Hindu priest services',
                'All ceremonial items provided',
                'Traditional setup',
                'Family gathering space',
                'Documentation of ceremony'
            ],
            pricing: '$150',
            icon: 'fa-male'
        },
        {
            id: 'community-hall-rental',
            name: 'Community Hall Rental',
            capacity: '200-300 people',
            description: 'Spacious community hall available for private events, celebrations, and gatherings.',
            features: [
                'Professional sound system',
                'Stage with lighting',
                'Full kitchen facilities',
                'Tables and chairs included',
                'Air conditioning',
                'Parking for 150+ vehicles',
                'Flexible hourly rental',
                'Event setup assistance'
            ],
            pricing: '$100/hour',
            icon: 'fa-building'
        }
    ];

    return(
        <div className="facilities-page">
            {/* Facilities Overview Section */}
            <div className="facilities-overview-section section-padding">
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

            {/* Booking Form Section */}
            <div className="booking-form-section section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12 offset-lg-2">
                            <div className="wpo-section-title text-center">
                                <h2>Book a Facility</h2>
                                <p>Ready to reserve one of our facilities? Fill out the form below and we'll get back to you within 24 hours to confirm your booking.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-lg-10 col-md-12 offset-lg-1">
                            <div className="booking-form-wrapper">
                                <form onSubmit={handleSubmit} className="booking-form">
                                    <div className="form-section">
                                        <h3>Personal Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>First Name *</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Last Name *</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <h3>Facility Requirements</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Select Facility *</label>
                                                <select
                                                    name="facility"
                                                    value={formData.facility}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Choose a facility...</option>
                                                    <option value="car-puja">Car Puja (Vehicle Blessing) - $50</option>
                                                    <option value="marriage-ceremony">Marriage Ceremony - $200</option>
                                                    <option value="bartabhanda-ceremony">Bartabhanda Ceremony - $150</option>
                                                    <option value="community-hall-rental">Community Hall Rental - $100/hour</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Expected Guests *</label>
                                                <select
                                                    name="expectedGuests"
                                                    value={formData.expectedGuests}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Number of guests...</option>
                                                    <option value="1-25">1-25 people</option>
                                                    <option value="26-50">26-50 people</option>
                                                    <option value="51-100">51-100 people</option>
                                                    <option value="101-200">101-200 people</option>
                                                    <option value="201+">201+ people</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <h3>Event Details</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Event Type *</label>
                                                <select
                                                    name="eventType"
                                                    value={formData.eventType}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Select event type...</option>
                                                    <option value="car-puja">Car Puja (Vehicle Blessing)</option>
                                                    <option value="wedding">Traditional Wedding Ceremony</option>
                                                    <option value="bartabhanda">Bartabhanda (Sacred Thread)</option>
                                                    <option value="festival">Cultural Festival</option>
                                                    <option value="religious">Religious Ceremony</option>
                                                    <option value="meeting">Community Meeting</option>
                                                    <option value="celebration">Birthday/Anniversary</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Member Status</label>
                                                <select
                                                    name="memberStatus"
                                                    value={formData.memberStatus}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select status...</option>
                                                    <option value="member">ANMC Member</option>
                                                    <option value="non-member">Non-Member</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Event Date *</label>
                                                <input
                                                    type="date"
                                                    name="eventDate"
                                                    value={formData.eventDate}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group time-group">
                                                <label>Time *</label>
                                                <div className="time-inputs">
                                                    <input
                                                        type="time"
                                                        name="startTime"
                                                        value={formData.startTime}
                                                        onChange={handleInputChange}
                                                        placeholder="Start time"
                                                        required
                                                    />
                                                    <span>to</span>
                                                    <input
                                                        type="time"
                                                        name="endTime"
                                                        value={formData.endTime}
                                                        onChange={handleInputChange}
                                                        placeholder="End time"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <h3>Additional Requirements</h3>
                                        <div className="form-row">
                                            <div className="form-group full-width">
                                                <label>Special Requirements</label>
                                                <textarea
                                                    name="specialRequirements"
                                                    value={formData.specialRequirements}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Any special setup requirements, accessibility needs, or additional services..."
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Catering Needs</label>
                                                <select
                                                    name="cateringNeeds"
                                                    value={formData.cateringNeeds}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select catering option...</option>
                                                    <option value="self-catered">Self-catered (kitchen use only)</option>
                                                    <option value="external-catered">External catering service</option>
                                                    <option value="no-catering">No catering required</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-submit">
                                        <button type="submit" className="theme-btn submit-btn">
                                            <i className="fa fa-paper-plane"></i>
                                            Submit Booking Request
                                        </button>
                                        <p className="form-note">
                                            * We'll review your request and contact you within 24 hours to confirm availability and discuss pricing.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Service;