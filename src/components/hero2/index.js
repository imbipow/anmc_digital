import React, { Component } from "react";
import Slider from "react-slick";
import {Link} from 'react-router-dom'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import './style.css'

class Hero2 extends Component {
    render() {
        var settings = {
            dots: true,
            arrows: true,
            speed: 1200,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2500,
            fade: true
        };
        return (
            <section className="hero hero-style-1">
                <div className="hero-slider">
                    <Slider {...settings}>
                        <div className="slide s1">
                            <div className="container">
                                <div className="row">
                                    <div className="col col-lg-8 offset-lg-2 col-md-12 slide-caption">
                                        <div className="slide-top">
                                            <span>Let’s Know Islam</span>
                                        </div>
                                        <div className="slide-title">
                                            <h2>Read! In the Name of your Lord, Who has created</h2>
                                        </div>
                                        <div className="btns">
                                            <Link to="/about" className="theme-btn">Discover More</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slide s2">
                            <div className="container">
                                <div className="row">
                                    <div className="col col-lg-8 offset-lg-2 col-md-12 slide-caption">
                                        <div className="slide-top">
                                            <span>Let’s Know Islam</span>
                                        </div>
                                        <div className="slide-title">
                                            <h2>Read! In the Name of your Lord, Who has created</h2>
                                        </div>
                                        <div className="btns">
                                            <Link to="/about" className="theme-btn">Discover More</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slide s3">
                            <div className="container">
                                <div className="row">
                                    <div className="col col-lg-8 offset-lg-2 col-md-12 slide-caption">
                                        <div className="slide-top">
                                            <span>Let’s Know Islam</span>
                                        </div>
                                        <div className="slide-title">
                                            <h2>Read! In the Name of your Lord, Who has created</h2>
                                        </div>
                                        <div className="btns">
                                            <Link to="/about" className="theme-btn">Discover More</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Slider>
                </div>
            </section>
        );
    }
}
export default Hero2;