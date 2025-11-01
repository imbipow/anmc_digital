import React, { Component } from 'react'
import { Collapse, CardBody, Card } from 'reactstrap';
import { Link } from 'react-router-dom'
import './style.css';

const menus = [
    {
        id: 1,
        title: 'Home',
        link: '/home',
        submenu: [
            {
                id: 11,
                title: 'Home style 1',
                link: '/home'
            },
            {
                id: 12,
                title: 'Home style 2',
                link: '/home2'
            },
            {
                id: 13,
                title: 'Home style 3',
                link: '/home3'
            },
            {
                id: 14,
                title: 'Home style 4',
                link: '/home4'
            },
        ]
    },

    {
        id: 2,
        title: 'About',
        link: '/about',
    },

{
    id: 3,
        title: 'Projects',
        link: '/projects',
        submenu: [
            {
                id: 31,
                title: 'Projects',
                link: '/projects'
            },
            {
                id: 32,
                title: 'Project Single',
                link: '/projects-single'
            }
        ]
    },
{
    id: 4,
        title: 'Event',
        link: '/event',
        submenu: [
            {
                id: 41,
                title: 'Event',
                link: '/event'
            },
            {
                id: 42,
                title: 'Event Single',
                link: '/event-single'
            }
        ]
    },
    {
        id: 7,
        title: 'Pages',
        link: '/',
        submenu: [
            {
                id: 71,
                title: 'About',
                link: '/about'
            },
            {
                id: 72,
                title: 'Facilities',
                link: '/facilities'
            },
            {
                id: 73,
                title: 'Facility Details',
                link: '/facilities-single'
            },
            {
                id: 75,
                title: 'Donate',
                link: '/donate'
            },
            {
                id: 79,
                title: 'Error 404',
                link: '/404'
            },
            
        ]
    },

    {
        id: 5,
        title: 'News',
        link: '/news',
        submenu: [
            {
                id: 51,
                title: 'News',
                link: '/news'
            },
            {
                id: 52,
                title: 'News Left sidebar',
                link: '/news-left'
            },
            {
                id: 53,
                title: 'News full width',
                link: '/news-fullwidth'
            },
            {
                id: 54,
                title: 'News single',
                link: '/news-details'
            },
            {
                id: 55,
                title: 'News single Left sidebar',
                link: '/news-details-left'
            },
            {
                id: 56,
                title: 'News single full width',
                link: '/news-details-fullwidth'
            },
        ]
    },
    {
        id: 6,
        title: 'FAQ',
        link: '/faq',
    },
    {
        id: 88,
        title: 'Contact',
        link: '/contact',
    }
    
    
]


export default class MobileMenu extends Component {

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
                                    </p> : <Link to={item.link}>{item.title}</Link>}
                                    {item.submenu ?
                                    <Collapse isOpen={item.id === isOpen}>
                                        <Card>
                                            <CardBody>
                                                <ul>
                                                    {item.submenu.map(submenu => (
                                                        <li key={submenu.id}><Link onClick={ClickHandler} className="active" to={submenu.link}>{submenu.title}</Link></li>
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
