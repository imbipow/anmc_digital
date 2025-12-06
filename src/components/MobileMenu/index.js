import React, { Component } from 'react'
import { Collapse, CardBody, Card } from 'reactstrap';
import { Link, useLocation } from 'react-router-dom'
import './style.css';

const menus = [
    {
        id: 1,
        title: 'Home',
        link: '/home',
    },
    {
        id: 2,
        title: 'About',
        link: '/about',
    },
    {
        id: 3,
        title: 'News',
        link: '/news',
    },
    {
        id: 4,
        title: 'Projects',
        link: '/projects',
    },
    {
        id: 5,
        title: 'Events',
        link: '/event',
    },
    {
        id: 6,
        title: 'Facilities',
        link: '/facilities',
    },
    {
        id: 7,
        title: 'FAQ',
        link: '/faq',
    },
    {
        id: 8,
        title: 'Contact',
        link: '/contact',
    }
]

// Wrapper component to use hooks with class component
function MobileMenuWrapper() {
    const location = useLocation();
    return <MobileMenu location={location} />;
}

class MobileMenu extends Component {

    state = {
        isMenuShow: false,
        isOpen: 0,
    }

    menuHandler = () => {
        this.setState({
            isMenuShow: !this.state.isMenuShow
        })
    }

    setIsOpen = id => () => {
        this.setState({
            isOpen: id === this.state.isOpen ? 0 : id
        })
    }

    isActive = (path) => {
        // For home, match both /home and / (base URL)
        if (path === '/home') {
            return (this.props.location.pathname === '/home' || this.props.location.pathname === '/') ? 'active' : '';
        }
        return this.props.location.pathname === path ? 'active' : '';
    }

    render() {

        const { isMenuShow, isOpen } = this.state;

        const ClickHandler = () =>{
            window.scrollTo(10, 0);
         }

        return (
            <div>
                <div className={`mobileMenu ${isMenuShow ? 'show' : ''}`}>
                    {/* <div className="clox" onClick={this.menuHandler}>Close Me</div> */}

                    <ul className="responsivemenu">
                        {menus.map(item => {
                            return (
                                <li key={item.id}>
                                    {item.submenu ? <p onClick={this.setIsOpen(item.id)}>
                                        {item.title}
                                        {item.submenu ? <i className="fa fa-angle-right" aria-hidden="true"></i> : ''}
                                    </p> : <Link onClick={ClickHandler} className={this.isActive(item.link)} to={item.link}>{item.title}</Link>}
                                    {item.submenu ?
                                    <Collapse isOpen={item.id === isOpen}>
                                        <Card>
                                            <CardBody>
                                                <ul>
                                                    {item.submenu.map(submenu => (
                                                        <li key={submenu.id}><Link onClick={ClickHandler} className={this.isActive(submenu.link)} to={submenu.link}>{submenu.title}</Link></li>
                                                    ))}
                                                </ul>
                                            </CardBody>
                                        </Card>
                                    </Collapse>
                                    : ''}
                                </li>
                            )
                        })}
                    </ul>

                </div>

                <div className="showmenu" onClick={this.menuHandler}><i className="fa fa-bars" aria-hidden="true"></i></div>
            </div>
        )
    }
}

export default MobileMenuWrapper;
