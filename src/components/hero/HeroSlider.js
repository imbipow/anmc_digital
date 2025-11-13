import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import API_CONFIG from '../../config/api';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './style.css';

const HeroSlider = (props) => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSlides = async () => {
            try {
                const response = await fetch(API_CONFIG.getURL('/hero-slides'));
                if (response.ok) {
                    const data = await response.json();
                    // Only show active slides, sorted by order
                    const activeSlides = data.filter(slide => slide.active !== false);
                    setSlides(activeSlides);
                }
            } catch (error) {
                console.error('Error loading hero slides:', error);
                // Fallback to default slide
                setSlides([{
                    id: 'default',
                    welcomeText: 'Welcome to ANMC',
                    title: 'Building Bridges, Strengthening Communities',
                    subtitle: 'The Australian Nepalese Multicultural Centre is dedicated to fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.',
                    buttonText: 'Learn More',
                    buttonLink: '/about',
                    secondaryButtonText: 'Become a Member',
                    secondaryButtonLink: '/donate',
                    imageUrl: props.heroImg || '',
                    active: true
                }]);
            } finally {
                setLoading(false);
            }
        };
        loadSlides();
    }, [props.heroImg]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        fade: true,
        cssEase: 'ease-in-out',
        arrows: true,
        pauseOnHover: true,
    };

    if (loading) {
        return (
            <section className={`hero ${props.HeroStyleClass}`}>
                <div className="hero-slider">
                    <div className="container">
                        <div className="row">
                            <div className="col col-lg-12 text-center">
                                <p>Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`hero ${props.HeroStyleClass}`}>
            <div className="hero-slider">
                <Slider {...sliderSettings}>
                    {slides.map((slide) => (
                        <div key={slide.id} className="slide">
                            <div className="container">
                                <div className="row">
                                    <div className="col col-lg-6 slide-caption">
                                        {slide.welcomeText && (
                                            <div className="slide-top">
                                                <span>{slide.welcomeText}</span>
                                            </div>
                                        )}
                                        {slide.title && (
                                            <div className="slide-title">
                                                <h2>{slide.title}</h2>
                                            </div>
                                        )}
                                        {slide.subtitle && (
                                            <div className="slide-subtitle">
                                                <p>{slide.subtitle}</p>
                                            </div>
                                        )}
                                        <div className="btns">
                                            {slide.buttonText && slide.buttonLink && (
                                                <Link to={slide.buttonLink} className="theme-btn">
                                                    {slide.buttonText}
                                                </Link>
                                            )}
                                            {slide.secondaryButtonText && slide.secondaryButtonLink && (
                                                <Link to={slide.secondaryButtonLink} className="theme-btn-2">
                                                    {slide.secondaryButtonText}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {(slide.imageUrl || props.heroImg) && (
                                <div className="right-vec">
                                    <img src={slide.imageUrl || props.heroImg} alt={slide.title || 'Hero'} />
                                    {/* <div className="right-border">
                                        <div className="right-icon"><i className="fa fa-newspaper-o"></i></div>
                                        <div className="right-icon"><i className="fa fa-calendar-check-o"></i></div>
                                        <div className="right-icon"><i className="fa fa-camera"></i></div>
                                        <div className="right-icon"><i className="fa fa-heart"></i></div>
                                        <div className="right-icon"><i className="fa fa-thumbs-up"></i></div>
                                    </div> */}
                                </div>
                            )}
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default HeroSlider;
