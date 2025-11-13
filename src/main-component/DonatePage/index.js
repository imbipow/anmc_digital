import React, { Fragment, useState } from 'react';
import Navbar from '../../components/Navbar';
// import SEO from '../../components/SEO';
import PageTitle from '../../components/pagetitle';
import DonationForm from '../../components/DonationForm';
import Footer from '../../components/footer';
import Scrollbar from '../../components/scrollbar';
import './style.css';

const DonatePage = () => {
    const [showDonationForm, setShowDonationForm] = useState(false);

    const handleDonationSuccess = () => {
        setShowDonationForm(false);
    };

    return (
        <Fragment>
            {/* <SEO
                title="Donate - Support Our Community"
                description="Support the Australian Nepalese Multicultural Centre with your donation. Help us build our community center, provide support programs, and serve the Nepalese and multicultural community in Australia. Every contribution makes a difference."
                keywords="Donate ANMC, Support Nepalese Community, Community Donations, Tax Deductible, Charity Donations Australia, Help Multicultural Centre"
            /> */}
            <Navbar />
            <PageTitle pageTitle={'Donate'} pagesub={'Support ANMC'} />

            <div className="wpo-donation-page-area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 offset-lg-2">
                            <div className="donation-intro">
                                <h2>Support ANMC's Mission</h2>
                                <p>
                                    Your generous donation helps us continue our work in fostering cultural diversity,
                                    community engagement, and supporting our members through various programs and initiatives.
                                </p>
                                <p>
                                    We are working to pay off our $450,000 bank loan for the Australian Nepalese Multicultural
                                    Centre. Every contribution, big or small, brings us closer to this goal.
                                </p>

                                <div className="donation-highlights">
                                    <div className="highlight-item">
                                        <i className="fa fa-home"></i>
                                        <h4>Community Center</h4>
                                        <p>Building a space for cultural events and gatherings</p>
                                    </div>
                                    <div className="highlight-item">
                                        <i className="fa fa-users"></i>
                                        <h4>Support Programs</h4>
                                        <p>Helping families settle and thrive in Australia</p>
                                    </div>
                                    <div className="highlight-item">
                                        <i className="fa fa-graduation-cap"></i>
                                        <h4>Education</h4>
                                        <p>Language classes and cultural education programs</p>
                                    </div>
                                </div>

                                <div className="donate-button-section">
                                    <button
                                        onClick={() => setShowDonationForm(true)}
                                        className="theme-btn donate-btn-large"
                                    >
                                        Donate Now
                                    </button>
                                    <p className="tax-deductible-note">
                                        <i className="fa fa-check-circle"></i> Tax deductible donations
                                    </p>
                                </div>

                                <div className="payment-security-info">
                                    <h4>Secure Payment</h4>
                                    <p>
                                        All donations are processed securely through Stripe. We accept Visa, Mastercard,
                                        American Express, and other major credit cards. Your payment information is encrypted
                                        and we never store your card details.
                                    </p>
                                    <div className="security-badges">
                                        <span><i className="fa fa-lock"></i> SSL Secured</span>
                                        <span><i className="fa fa-shield-alt"></i> 256-bit Encryption</span>
                                        <span><i className="fa fa-credit-card"></i> PCI Compliant</span>
                                    </div>
                                </div>

                                <div className="contact-for-questions">
                                    <h4>Questions?</h4>
                                    <p>
                                        If you have any questions about donations or would like to discuss other ways to support ANMC,
                                        please <a href="/contact">contact us</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDonationForm && (
                <DonationForm
                    onClose={() => setShowDonationForm(false)}
                    onSuccess={handleDonationSuccess}
                />
            )}

            <Footer footerClass={'wpo-ne-footer-2'} />
            <Scrollbar />
        </Fragment>
    );
};

export default DonatePage;
