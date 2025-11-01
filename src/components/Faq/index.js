import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api';
import './style.css';

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.faqs));

            if (!response.ok) {
                throw new Error('Failed to fetch FAQs');
            }

            const data = await response.json();
            setFaqs(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching FAQs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // Get unique categories
    const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

    // Filter FAQs by category
    const filteredFaqs = selectedCategory === 'All'
        ? faqs
        : faqs.filter(faq => faq.category === selectedCategory);

    if (loading) {
        return (
            <div className="wpo-faq-area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="loading-spinner">
                                <p>Loading FAQs...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wpo-faq-area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="error-message">
                                <p>Error loading FAQs: {error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wpo-faq-area section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="wpo-section-title">
                            <span>Get Answers</span>
                            <p>Find answers to common questions about our community center and services</p>
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="row">
                    <div className="col-12">
                        <div className="faq-category-filter">
                            {categories.map((category, index) => (
                                <button
                                    key={index}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Accordion */}
                <div className="row">
                    <div className="col-lg-10 offset-lg-1">
                        <div className="faq-accordion">
                            {filteredFaqs.length === 0 ? (
                                <div className="no-faqs">
                                    <p>No FAQs found in this category.</p>
                                </div>
                            ) : (
                                filteredFaqs.map((faq, index) => (
                                    <div key={faq.id} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                                        <div
                                            className="faq-question"
                                            onClick={() => toggleAccordion(index)}
                                        >
                                            <h4>{faq.question}</h4>
                                            <span className="faq-icon">
                                                {activeIndex === index ? (
                                                    <i className="fa fa-minus"></i>
                                                ) : (
                                                    <i className="fa fa-plus"></i>
                                                )}
                                            </span>
                                        </div>
                                        <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                                            <p>{faq.answer}</p>
                                            {faq.category && (
                                                <span className="faq-category-tag">{faq.category}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="row">
                    <div className="col-12">
                        <div className="faq-contact-section">
                            <h3>Still have questions?</h3>
                            <p>Can't find the answer you're looking for? Please contact us directly.</p>
                            <a href="/contact" className="theme-btn">Contact Us</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Faq;
