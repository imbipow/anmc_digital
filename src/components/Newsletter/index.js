import React, { useState } from 'react'
import API_CONFIG from '../../config/api'
import './style.css'

const Newsletter = (props) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const SubmitHandler = async (e) => {
        e.preventDefault();

        // Validate email
        if (!email || !email.includes('@')) {
            setMessage({ text: 'Please enter a valid email address', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.subscribers), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name: name || null })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    text: 'Successfully subscribed to our newsletter!',
                    type: 'success'
                });
                setEmail('');
                setName('');
            } else {
                setMessage({
                    text: data.error || 'Failed to subscribe. Please try again.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            setMessage({
                text: 'Failed to subscribe. Please try again later.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    }

    return(
        <section className="wpo-news-letter-section">
            <div className="container">
                <div className="wpo-news-letter-wrap">
                    <div className="row">
                        <div className="col col-lg-10 offset-lg-1 col-md-8 offset-md-2">
                            <div className="wpo-newsletter">
                                <h3>Follow us For further information</h3>
                                <p>Stay updated with our latest news, events, and community activities.</p>
                                <div className="wpo-newsletter-form">
                                    <form onSubmit={SubmitHandler}>
                                        <div>
                                            <input
                                                type="email"
                                                placeholder="Enter Your Email"
                                                className="form-control"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                            <button type="submit" disabled={loading}>
                                                {loading ? 'Subscribing...' : 'Subscribe'}
                                            </button>
                                        </div>
                                        {message.text && (
                                            <div
                                                className={`newsletter-message ${message.type}`}
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '10px',
                                                    borderRadius: '4px',
                                                    textAlign: 'center',
                                                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                                                    color: message.type === 'success' ? '#155724' : '#721c24',
                                                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                                                }}
                                            >
                                                {message.text}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Newsletter;