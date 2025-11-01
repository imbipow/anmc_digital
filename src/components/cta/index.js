import React, { useState } from 'react'
import {Link} from 'react-router-dom'
import DonationForm from '../DonationForm'
import './style.css'

const CtaSection = (props) => {
    const [showDonationForm, setShowDonationForm] = useState(false);

    const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

    const handleDonateClick = (e) => {
        e.preventDefault();
        setShowDonationForm(true);
    }

    const handleDonationSuccess = () => {
        setShowDonationForm(false);
        // You can add success notification here
    }

    return(
        <>
            <div className={`wpo-cta-area ${props.ctaclass}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wpo-cta-text">
                                <h2>Support ANMC's Mission</h2>
                                <p>Your donation helps us continue our work in fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.</p>
                                <div className="btns">
                                    <button onClick={handleDonateClick} className="theme-btn">Donate Now</button>
                                    <Link onClick={ClickHandler} to="/home" className="theme-btn-s2">Join Us Now</Link>
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
        </>
    )
}

export default CtaSection;