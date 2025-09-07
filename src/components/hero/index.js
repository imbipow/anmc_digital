import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import contentService from '../../services/contentService'
import './style.css'

const Hero = (props) => {
    const [content, setContent] = useState({
        welcomeText: "Welcome to ANMC",
        title: "Building Bridges, Strengthening Communities",
        subtitle: "The Australian Nepalese Multicultural Centre is dedicated to fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.",
        learnMoreText: "Learn More",
        memberButtonText: "Become a Member"
    });

    useEffect(() => {
        const loadContent = async () => {
            try {
                const homepageData = await contentService.getHomepageContent();
                if (homepageData.hero && Object.keys(homepageData.hero).length > 0) {
                    setContent(homepageData.hero);
                }
            } catch (error) {
                console.error('Error loading hero content:', error);
            }
        };
        loadContent();
    }, []);

    return(
        <section  className={`hero ${props.HeroStyleClass}`}>
            <div className="hero-slider">
                <div className="slide">
                    <div className="container">
                        <div className="row">
                            <div className="col col-lg-7 slide-caption">
                                <div className="slide-top">
                                    <span>{content.welcomeText}</span>
                                </div>
                                <div className="slide-title">
                                    <h2>{content.title}</h2>
                                </div>
                                <div className="slide-subtitle">
                                    <p>{content.subtitle}</p>
                                </div>
                                <div className="btns">
                                    <Link to="/about" className="theme-btn">{content.learnMoreText}</Link>
                                    <Link to="/donate" className="theme-btn-2">{content.memberButtonText}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right-vec">
                        <img src={props.heroImg} alt=""/>
                        <div className="right-border">
                            <div className="right-icon"><i className="fa fa-newspaper-o"></i></div>
                            <div className="right-icon"><i className="fa fa-calendar-check-o"></i></div>
                            <div className="right-icon"><i className="fa fa-camera"></i></div>
                            <div className="right-icon"><i className="fa fa-heart"></i></div>
                            <div className="right-icon"><i className="fa fa-thumbs-up"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero;