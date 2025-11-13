import React, { useState } from 'react';
import API_CONFIG from '../../config/api';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (error[name]) {
            setError(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Please enter your name";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Please enter your email";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.subject.trim()) {
            newErrors.subject = "Please enter a subject";
        }
        if (!formData.message.trim()) {
            newErrors.message = "Please enter your message";
        }

        return newErrors;
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
        }

        setLoading(true);
        setSuccessMessage('');

        try {
            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.messagesContact), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Thank you! Your message has been sent successfully. We will get back to you soon.');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
                setError({});
            } else {
                setError({ submit: data.error || 'Failed to send message. Please try again.' });
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setError({ submit: 'Failed to send message. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return(
        <form onSubmit={submitHandler} className="form">
            <div className="row">
                <div className="col-lg-6 col-md-12">
                    <div className="form-field">
                        <input
                            value={formData.name}
                            onChange={changeHandler}
                            type="text"
                            name="name"
                            placeholder="Name"
                            disabled={loading}
                        />
                        <p style={{ color: 'red', fontSize: '14px' }}>{error.name || ''}</p>
                    </div>
                </div>
                <div className="col-lg-6 col-md-12">
                    <div className="form-field">
                        <input
                            value={formData.phone}
                            onChange={changeHandler}
                            type="text"
                            name="phone"
                            placeholder="Phone (Optional)"
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="form-field">
                        <input
                            onChange={changeHandler}
                            value={formData.email}
                            type="email"
                            name="email"
                            placeholder="Email"
                            disabled={loading}
                        />
                        <p style={{ color: 'red', fontSize: '14px' }}>{error.email || ''}</p>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="form-field">
                        <input
                            onChange={changeHandler}
                            value={formData.subject}
                            type="text"
                            name="subject"
                            placeholder="Subject"
                            disabled={loading}
                        />
                        <p style={{ color: 'red', fontSize: '14px' }}>{error.subject || ''}</p>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="form-field">
                        <textarea
                            name="message"
                            placeholder="Message"
                            value={formData.message}
                            onChange={changeHandler}
                            rows="5"
                            disabled={loading}
                        />
                        <p style={{ color: 'red', fontSize: '14px' }}>{error.message || ''}</p>
                    </div>
                </div>
                {error.submit && (
                    <div className="col-lg-12">
                        <p style={{ color: 'red', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                            {error.submit}
                        </p>
                    </div>
                )}
                {successMessage && (
                    <div className="col-lg-12">
                        <p style={{ color: '#155724', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                            {successMessage}
                        </p>
                    </div>
                )}
                <div className="col-lg-12">
                    <div className="form-submit">
                        <button type="submit" className="theme-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ContactForm;