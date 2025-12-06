import React from 'react'
import Logo from '../../images/logo.png'
import {Link, useLocation}  from 'react-router-dom'
import HeaderTopbar from '../HeaderTopbar'
import MobileMenu from '../../components/MobileMenu'
import min1 from '../../images/shop/mini-cart/img-1.jpg'
import min2 from '../../images/shop/mini-cart/img-2.jpg'
import './style.css'

const Header = () => {
    const location = useLocation();

    const SubmitHandler = (e) =>{
        e.preventDefault()
     }

     const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

     const isActive = (path) => {
        // For home, match both /home and / (base URL)
        if (path === '/home') {
            return (location.pathname === '/home' || location.pathname === '/') ? 'active' : '';
        }
        return location.pathname === path ? 'active' : '';
     }

    return(
        <div className="middle-header">
            <HeaderTopbar/>
            <div className="header-style-3">
                <div className="container">
                    <div className="header-content">
                    <div className="row">
                        <div className="col-lg-3 col-md-4 col-sm-4 col-4">
                            <div className="logo">
                                <Link onClick={ClickHandler} to="/home" title=""><img src={Logo} alt=""/></Link>
                            </div>
                        </div>
                        <div className="col-lg-9 d-lg-block d-none">
                            <nav>
                                <ul>
                                    <li><Link onClick={ClickHandler} className={isActive('/home')} to="/home" title="">Home</Link></li>
                                    <li><Link onClick={ClickHandler} className={isActive('/about')} to="/about" title="">About</Link></li>
                                    <li><Link onClick={ClickHandler} className={isActive('/news')} to="/news" title="">News</Link></li>
                                    <li><Link onClick={ClickHandler} className={isActive('/projects')} to="/projects" title="">Projects</Link></li>
                                    <li><Link onClick={ClickHandler} className={isActive('/event')} to="/event" title="">Events</Link></li>
                                    <li><Link onClick={ClickHandler} className={isActive('/facilities')} to="/facilities" title="">Facilities</Link></li>
                                    <li><Link onClick={ClickHandler} className={isActive('/faq')} to="/faq" title="">FAQ</Link></li>
                                    <li><Link onClick={ClickHandler} className={isActive('/contact')} to="/contact" title="">Contact</Link></li>
                                </ul>
                            </nav>
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

export default Header;