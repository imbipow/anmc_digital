import React from 'react'
import Logo from '../../images/logo-2.png'
import HeaderTopbar2 from '../HeaderTopbar2'
import {Link}  from 'react-router-dom'
import MobileMenu from '../MobileMenu'
import min1 from '../../images/shop/mini-cart/img-1.jpg'
import min2 from '../../images/shop/mini-cart/img-2.jpg'
import './style.css'

const Header2 = () => {
    const SubmitHandler = (e) =>{
        e.preventDefault()
     }

     const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

    return(	
        <div className="middle-header">
            <HeaderTopbar2/>
            <div className="header-style-2">
                <div className="container">
                    <div className="header-content">
                    <div className="row">
                        <div className="col-lg-3 col-md-4 col-sm-4 col-4">
                            <div className="logo">
                                <Link onClick={ClickHandler} to="/home" title=""><img src={Logo} alt=""/></Link>
                            </div>
                        </div>
                        <div className="col-lg-8 d-lg-block d-none">
                            <nav>
                            <ul>
                                    <li><Link onClick={ClickHandler} className="active" to="/home" title="">Home</Link>
                                        <ul>
                                            <li><Link onClick={ClickHandler} className="active" to="/home">Home style 1</Link></li>
                                            <li><Link onClick={ClickHandler} to="/home2">Home style 2</Link></li>
                                            <li><Link onClick={ClickHandler} to="/home3">Home style 3</Link></li>
                                            <li><Link onClick={ClickHandler} to="/home4">Home style 4</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link onClick={ClickHandler} to="/about" title="">About</Link></li>
                                    <li><Link onClick={ClickHandler} to="/projects" title="">Projects</Link>
                                        <ul>
                                            <li><Link onClick={ClickHandler} to="/projects" title="">Projects</Link></li>
                                            <li><Link onClick={ClickHandler} to="/projects-single" title="">Project Single</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link onClick={ClickHandler} to="/event" title="">Event</Link>
                                        <ul>
                                            <li><Link onClick={ClickHandler} to="/event" title="">Event</Link></li>
                                            <li><Link onClick={ClickHandler} to="/event-single" title="">Event Single</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link onClick={ClickHandler} to="/home" title="">Pages</Link>
                                        <ul>
                                            <li><Link onClick={ClickHandler} to="/about" title="">About</Link></li>
                                            <li><Link onClick={ClickHandler} to="/facilities" title="">Facilities</Link></li>
                                            <li><Link onClick={ClickHandler} to="/facilities-single" title="">Facility Details</Link></li>
                                            <li><Link onClick={ClickHandler} to="/donate" title="">Donate</Link></li>
                                            <li><Link onClick={ClickHandler} to="/404" title="">Error 404</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link onClick={ClickHandler} to="/news">News</Link>
                                        <ul>
                                            <li><Link onClick={ClickHandler} to="/news">News</Link></li>
                                            <li><Link onClick={ClickHandler} to="/news-left">News Left sidebar</Link></li>
                                            <li><Link onClick={ClickHandler} to="/news-fullwidth">News full width</Link></li>
                                            <li><i className="fa fa-angle-right"></i><Link onClick={ClickHandler} to="/news-details" title="">News Details</Link>
                                                <ul>
                                                    <li><Link onClick={ClickHandler} to="/news-details" title="">News single</Link></li>
                                                    <li><Link onClick={ClickHandler} to="/news-details-left" title="">News single Left sidebar</Link></li>
                                                    <li><Link onClick={ClickHandler} to="/news-details-fullwidth" title="">News single full width</Link></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                    <li><Link onClick={ClickHandler} to="/contact" title="">Contact</Link></li>
                                </ul>
                            </nav>
                        </div>
                        <div className="col-lg-1 col-md-6 col-sm-6 col-6">
                            <div className="contact">
                                <div className="cart-search-contact">
                                    <div className="header-search-form-wrapper">
                                        <button className="search-toggle-btn"><i className="fi flaticon-search"></i></button>
                                        <div className="header-search-form">
                                            <form onSubmit={SubmitHandler}>
                                                <div>
                                                    <input type="text" className="form-control" placeholder="Search here..."/>
                                                    <button type="submit"><i className="ti-search"></i></button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="mini-cart">
                                        <button className="cart-toggle-btn"> <i className="fi flaticon-shopping-cart"></i> <span className="cart-count">02</span></button>
                                        <div className="mini-cart-content">
                                            <div className="mini-cart-items">
                                                <div className="mini-cart-item clearfix">
                                                    <div className="mini-cart-item-image">
                                                        <Link onClick={ClickHandler} to="/facilities"><img src={min1} alt=""/></Link>
                                                    </div>
                                                    <div className="mini-cart-item-des">
                                                        <Link onClick={ClickHandler} to="/facilities">Hoodi with zipper</Link>
                                                        <span className="mini-cart-item-price">$20.15</span>
                                                        <span className="mini-cart-item-quantity">x 1</span>
                                                    </div>
                                                </div>
                                                <div className="mini-cart-item clearfix">
                                                    <div className="mini-cart-item-image">
                                                        <Link onClick={ClickHandler} to="/facilities"><img src={min2} alt=""/></Link>
                                                    </div>
                                                    <div className="mini-cart-item-des">
                                                        <Link onClick={ClickHandler} to="/facilities">Ninja T-shirt</Link>
                                                        <span className="mini-cart-item-price">$13.25</span>
                                                        <span className="mini-cart-item-quantity">x 2</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mini-cart-action clearfix">
                                                <span className="mini-checkout-price">$215.14</span>
                                                <Link onClick={ClickHandler} to="/facilities" className="view-cart-btn theme-btn">View Facilities</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2 col-sm-2 col-2">
                            <MobileMenu/>
                        </div>
                    </div>
                    
                        <div className="clearfix"></div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Header2;