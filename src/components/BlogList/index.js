import React, { useState } from 'react';
import {Link} from 'react-router-dom'
import './style.css'
import blog1 from '../../images/blog/img-1.jpg'
import blog2 from '../../images/blog/img-2.jpg'
import blog3 from '../../images/blog/img-3.jpg'
import blog4 from '../../images/blog/img-4.jpg'
import blog5 from '../../images/blog/img-5.jpg'
import blog6 from '../../images/blog/img-6.jpg'

const BlogList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [articlesPerPage] = useState(6);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const newsArticles = [
        {
            id: 1,
            title: "ANMC Celebrates Dashain Festival with Community Gathering",
            excerpt: "The Australian Nepalese Multicultural Centre hosted a vibrant Dashain celebration, bringing together over 200 community members to celebrate Nepal's biggest festival.",
            image: blog1,
            category: "Events",
            author: "ANMC Admin",
            date: "March 15, 2024",
            featured: true
        },
        {
            id: 2,
            title: "New Cultural Education Programs Launched",
            excerpt: "ANMC introduces innovative programs to teach Nepalese language and culture to second-generation Australian-Nepalese youth.",
            image: blog2,
            category: "Education",
            author: "Program Director",
            date: "March 10, 2024",
            featured: false
        },
        {
            id: 3,
            title: "Community Support Fund Reaches $50,000 Milestone",
            excerpt: "Thanks to generous donations from members and local businesses, ANMC's emergency support fund reaches a significant milestone.",
            image: blog3,
            category: "Community",
            author: "Finance Team",
            date: "March 8, 2024",
            featured: false
        },
        {
            id: 4,
            title: "Tihar Festival Preparations Begin",
            excerpt: "ANMC announces plans for the annual Tihar celebration, featuring traditional lights festival activities and cultural performances.",
            image: blog4,
            category: "Events",
            author: "Event Coordinator",
            date: "March 5, 2024",
            featured: false
        },
        {
            id: 5,
            title: "Youth Leadership Workshop Success",
            excerpt: "Twenty young community members completed our leadership development program, gaining skills in community organizing and cultural preservation.",
            image: blog5,
            category: "Youth",
            author: "Youth Director",
            date: "March 1, 2024",
            featured: false
        },
        {
            id: 6,
            title: "Partnership with Local Schools Expands",
            excerpt: "ANMC partners with three additional schools to provide cultural awareness programs and support for Nepalese-Australian students.",
            image: blog6,
            category: "Education",
            author: "Community Liaison",
            date: "February 28, 2024",
            featured: false
        }
    ];

    const featuredArticle = newsArticles.find(article => article.featured);
    const regularArticles = newsArticles.filter(article => !article.featured);

    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = regularArticles.slice(indexOfFirstArticle, indexOfLastArticle);

    const totalPages = Math.ceil(regularArticles.length / articlesPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 400);
    };

    return(
        <section className="wpo-blog-pg-section section-padding">
            <div className="container">
                {/* Featured News Section */}
                {featuredArticle && (
                    <div className="featured-news-section">
                        <div className="featured-article-card">
                            <div className="row align-items-center">
                                <div className="col-lg-6">
                                    <div className="featured-image">
                                        <img src={featuredArticle.image} alt={featuredArticle.title} />
                                        <div className="featured-badge">
                                            <span>Featured</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="featured-content">
                                        <div className="article-meta">
                                            <span className="date-badge">
                                                <i className="fa fa-calendar"></i> {featuredArticle.date}
                                            </span>
                                            <span className="category-tag">{featuredArticle.category}</span>
                                        </div>
                                        <h2><Link onClick={ClickHandler} to="/blog-details">{featuredArticle.title}</Link></h2>
                                        <p>{featuredArticle.excerpt}</p>
                                        <div className="article-author">
                                            <span><i className="fa fa-user"></i> By {featuredArticle.author}</span>
                                        </div>
                                        <Link onClick={ClickHandler} to="/blog-details" className="read-more-btn">
                                            Read Full Story <i className="fa fa-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* News Grid Section */}
                <div className="news-grid-section">
                    <div className="row">
                        {currentArticles.map((article) => (
                            <div key={article.id} className="col-lg-6 col-md-6 col-sm-12">
                                <div className="article-card">
                                    <div className="article-image">
                                        <img src={article.image} alt={article.title} />
                                        <div className="date-badge">
                                            <span>{new Date(article.date).getDate()}</span>
                                            <small>{new Date(article.date).toLocaleDateString('en', { month: 'short' })}</small>
                                        </div>
                                        <div className="category-tag">{article.category}</div>
                                    </div>
                                    <div className="article-content">
                                        <h3><Link onClick={ClickHandler} to="/blog-details">{article.title}</Link></h3>
                                        <p>{article.excerpt}</p>
                                        <div className="article-footer">
                                            <div className="author-info">
                                                <i className="fa fa-user"></i>
                                                <span>By {article.author}</span>
                                            </div>
                                            <Link onClick={ClickHandler} to="/blog-details" className="read-more-link">
                                                Read More <i className="fa fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-wrapper">
                        <ul className="pg-pagination">
                            {currentPage > 1 && (
                                <li>
                                    <button onClick={() => paginate(currentPage - 1)} aria-label="Previous">
                                        <i className="fa fa-angle-left"></i>
                                    </button>
                                </li>
                            )}
                            {[...Array(totalPages)].map((_, index) => (
                                <li key={index + 1} className={currentPage === index + 1 ? 'active' : ''}>
                                    <button onClick={() => paginate(index + 1)}>{index + 1}</button>
                                </li>
                            ))}
                            {currentPage < totalPages && (
                                <li>
                                    <button onClick={() => paginate(currentPage + 1)} aria-label="Next">
                                        <i className="fa fa-angle-right"></i>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    )
}

export default BlogList;
