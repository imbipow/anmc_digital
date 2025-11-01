import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'
import contentService from '../../services/contentService'
import './style.css'
import blog1 from '../../images/blog/img-1.jpg'
import blog2 from '../../images/blog/img-2.jpg'
import blog3 from '../../images/blog/img-3.jpg'
import blog4 from '../../images/blog/img-4.jpg'
import blog5 from '../../images/blog/img-5.jpg'
import blog6 from '../../images/blog/img-6.jpg'

const BlogList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [articlesPerPage] = useState(10);
    const [newsArticles, setNewsArticles] = useState([]);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    useEffect(() => {
        const loadNews = async () => {
            try {
                const news = await contentService.getNews();
                if (news && news.length > 0) {
                    const images = [blog1, blog2, blog3, blog4, blog5, blog6];
                    const formattedNews = news.map((article, index) => ({
                        id: article.id,
                        title: article.title,
                        excerpt: article.excerpt,
                        image: article.featuredImage || images[index % images.length],
                        category: article.category || 'News',
                        author: article.authorName,
                        date: new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        featured: article.featured === true || article.featured === 'true',
                        slug: article.slug
                    }));
                    setNewsArticles(formattedNews);
                } else {
                    // Fallback to default data if API fails
                    setNewsArticles([
                        {
                            id: 1,
                            title: "ANMC Celebrates Dashain Festival with Community Gathering",
                            excerpt: "The Australian Nepalese Multicultural Centre hosted a vibrant Dashain celebration, bringing together over 200 community members to celebrate Nepal's biggest festival.",
                            image: blog1,
                            category: "Events",
                            author: "ANMC Admin",
                            date: "March 15, 2024",
                            featured: true
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error loading news:', error);
            }
        };
        loadNews();
    }, []);

    // Get the most recent featured article (if multiple are featured)
    const featuredArticles = newsArticles.filter(article => article.featured);
    const featuredArticle = featuredArticles.length > 0
        ? featuredArticles.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

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
                                        <h2><Link onClick={ClickHandler} to={`/news/${featuredArticle.slug || 'details'}`}>{featuredArticle.title}</Link></h2>
                                        <p>{featuredArticle.excerpt}</p>
                                        <div className="article-author">
                                            <span><i className="fa fa-user"></i> By {featuredArticle.author}</span>
                                        </div>
                                        <Link onClick={ClickHandler} to={`/news/${featuredArticle.slug || 'details'}`} className="read-more-btn">
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
                            <div key={article.id} className="col-lg-6 col-md-6 col-sm-12 card-item">
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
                                        <h3><Link onClick={ClickHandler} to={`/news/${article.slug || 'details'}`}>{article.title}</Link></h3>
                                        <p>{article.excerpt}</p>
                                        <div className="article-footer">
                                            <div className="author-info">
                                                <i className="fa fa-user"></i>
                                                <span>By {article.author}</span>
                                            </div>
                                            <Link onClick={ClickHandler} to={`/news/${article.slug || 'details'}`} className="read-more-link">
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
