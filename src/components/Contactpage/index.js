import React, { useState, useEffect } from 'react';
import contentService from '../../services/contentService';
import './style.css'

const Contactpage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [contactInfo, setContactInfo] = useState({});
    const [executiveMembers, setExecutiveMembers] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const loadContactData = async () => {
            try {
                // Load contact information
                const contact = await contentService.getContact();
                setContactInfo(contact);

                // Load executive committee from about us
                const aboutData = await contentService.getAboutUs();
                if (aboutData && aboutData.executiveCommittee && aboutData.executiveCommittee.members) {
                    const formattedMembers = aboutData.executiveCommittee.members.map(member => ({
                        name: member.name || member.title,
                        position: member.title || member.position,
                        email: member.email,
                        phone: member.phone
                    }));
                    setExecutiveMembers(formattedMembers);
                } else {
                    // Fallback data
                    setExecutiveMembers([
                        {
                            name: 'Rajesh Sharma',
                            position: 'President',
                            email: 'president@anmc.org.au',
                            phone: '+61 400 123 456'
                        },
                        {
                            name: 'Sita Patel',
                            position: 'Vice President',
                            email: 'vicepresident@anmc.org.au',
                            phone: '+61 400 234 567'
                        },
                        {
                            name: 'Prakash Thapa',
                            position: 'Secretary',
                            email: 'secretary@anmc.org.au',
                            phone: '+61 400 345 678'
                        },
                        {
                            name: 'Kamala Gurung',
                            position: 'Treasurer',
                            email: 'treasurer@anmc.org.au',
                            phone: '+61 400 456 789'
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error loading contact data:', error);
            }
        };
        loadContactData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Contact form submitted:', formData);
        // Handle form submission logic here
    };

    return(
        <div className="contact-page">
            {/* Contact Information Section */}
            <div className="contact-info-section section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12 offset-lg-2">
                            <div className="wpo-section-title text-center">
                                <h2>Contact Us</h2>
                                <p>Get in touch with the Australian Nepalese Multicultural Centre. We're here to help and answer any questions you may have.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="contact-cards-wrapper">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="contact-details-card">
                                    <div className="card-header">
                                        <div className="card-icon">
                                            <i className="fa fa-map-marker"></i>
                                        </div>
                                        <h3>Contact Details</h3>
                                    </div>
                                    
                                    <div className="card-content">
                                        <div className="contact-item">
                                            <div className="contact-info">
                                                <h4>Physical Address</h4>
                                                <p>{contactInfo.address || '123 Community Street, Melbourne VIC 3001'}</p>
                                            </div>
                                        </div>

                                        <div className="contact-item">
                                            <div className="contact-info">
                                                <h4>Email & Phone</h4>
                                                <p>
                                                    <strong>General Inquiries:</strong><br/>
                                                    <a href={`mailto:${contactInfo.email || 'info@anmc.org.au'}`}>{contactInfo.email || 'info@anmc.org.au'}</a><br/>
                                                    <a href={`tel:${contactInfo.phone || '+61398765432'}`}>{contactInfo.phone || '+61 3 9876 5432'}</a>
                                                </p>
                                                <p>
                                                    <strong>Emergency Contact:</strong><br/>
                                                    <a href={`tel:${contactInfo.emergencyPhone || '+61400123456'}`}>{contactInfo.emergencyPhone || '+61 400 123 456'}</a>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="contact-item">
                                            <div className="contact-info">
                                                <h4>Office Hours</h4>
                                                <div className="office-hours">
                                                    <div className="hours-row">
                                                        <span>Weekdays:</span>
                                                        <span>{contactInfo.officeHours || 'Monday to Friday: 9:00 AM - 5:00 PM'}</span>
                                                    </div>
                                                    <div className="hours-row">
                                                        <span>Weekend:</span>
                                                        <span>{contactInfo.weekendHours || 'Saturday: 10:00 AM - 2:00 PM'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-lg-6 col-md-12">
                                <div className="executive-info-card">
                                    <div className="card-header">
                                        <div className="card-icon">
                                            <i className="fa fa-users"></i>
                                        </div>
                                        <h3>Executive Committee</h3>
                                    </div>
                                    
                                    <div className="card-content">
                                        <div className="executive-members">
                                            {executiveMembers.map((member, index) => (
                                                <div key={index} className="executive-member">
                                                    <div className="member-info">
                                                        <h4>{member.name}</h4>
                                                        <span className="position">{member.position}</span>
                                                        <div className="member-contact">
                                                            <p><a href={`mailto:${member.email}`}>{member.email}</a></p>
                                                            <p><a href={`tel:${member.phone.replace(/\s+/g, '')}`}>{member.phone}</a></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="registration-details">
                                            <h4>Registration Details</h4>
                                            <div className="reg-info">
                                                <p><strong>ABN:</strong> 12 345 678 901</p>
                                                <p><strong>Incorporation No:</strong> INC2012345</p>
                                                <p><strong>Charity Status:</strong> DGR Endorsed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="contact-form-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-md-12 offset-lg-2">
                            <div className="contact-form-wrapper">
                                <div className="form-header">
                                    <h2>Send us a Message</h2>
                                    <p>Have a question or want to get involved? We'd love to hear from you!</p>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="contact-form">
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
                                                <label>Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <h3>Message Details</h3>
                                        <div className="form-row">
                                            <div className="form-group full-width">
                                                <label>Subject *</label>
                                                <select
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Select a subject...</option>
                                                    <option value="general">General Inquiry</option>
                                                    <option value="membership">Membership Information</option>
                                                    <option value="events">Events & Programs</option>
                                                    <option value="facilities">Facility Booking</option>
                                                    <option value="volunteer">Volunteer Opportunities</option>
                                                    <option value="donations">Donations & Sponsorship</option>
                                                    <option value="media">Media & Press</option>
                                                    <option value="complaints">Feedback & Complaints</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group full-width">
                                                <label>Message *</label>
                                                <textarea
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleInputChange}
                                                    rows="6"
                                                    placeholder="Please provide details about your inquiry..."
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-submit">
                                        <button type="submit" className="theme-btn submit-btn">
                                            <i className="fa fa-paper-plane"></i>
                                            Send Message
                                        </button>
                                        <p className="form-note">
                                            We'll get back to you within 24 hours during business days.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="map-section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="contact-map">
                                <iframe 
                                    title='anmc-location' 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.6283087794563!2d151.2069902153138!3d-33.87365098065089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae3f9e5c8b21%3A0x5017d681632ccc0!2sSydney%20NSW%2C%20Australia!5e0!3m2!1sen!2sau!4v1635123456789!5m2!1sen!2sau"
                                    width="100%" 
                                    height="400" 
                                    style={{border: 0}} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                                <div className="map-overlay">
                                    <div className="map-info">
                                        <h4>Visit Our Centre</h4>
                                        <p>123 Multicultural Drive, Community Hub, NSW 2000</p>
                                        <a href="https://maps.google.com/?q=Sydney+NSW+Australia" target="_blank" rel="noopener noreferrer" className="theme-btn-s3">
                                            <i className="fa fa-map-marker"></i>
                                            Get Directions
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
     )
        
}

export default Contactpage;
