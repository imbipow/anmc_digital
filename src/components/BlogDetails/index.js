import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import contentService from '../../services/contentService';
import API_CONFIG from '../../config/api';
import SEO from '../SEO';
import { stripHtmlTags } from '../../utils/htmlUtils';
import './style.css';
import blog1 from '../../images/blog/img-1.jpg';
import blog2 from '../../images/blog/img-2.jpg';
import blog3 from '../../images/blog/img-3.jpg';

const BlogSingle = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const ClickHandler = () => {
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        const loadArticle = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!slug) {
                    setError('Article not found');
                    setLoading(false);
                    return;
                }

                // Fetch article by slug
                const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.newsBySlug(slug)));

                if (!response.ok) {
                    throw new Error('Article not found');
                }

                const articleData = await response.json();
                setArticle(articleData);

                // Fetch related articles (same category)
                const allNews = await contentService.getNews();
                const related = allNews
                    .filter(item =>
                        item.category === articleData.category &&
                        item.slug !== articleData.slug &&
                        item.status === 'published'
                    )
                    .slice(0, 3);
                setRelatedArticles(related);

                setLoading(false);
            } catch (error) {
                console.error('Error loading article:', error);
                setError('Failed to load article. Please try again.');
                setLoading(false);
            }
        };

        loadArticle();
    }, [slug]);

    if (loading) {
        return (
            <section className="wpo-blog-single-section section-padding">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading article...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !article) {
        return (
            <section className="wpo-blog-single-section section-padding">
                <div className="container">
                    <div className="error-state">
                        <h2>Article Not Found</h2>
                        <p>{error || 'The article you are looking for does not exist.'}</p>
                        <Link to="/news" className="theme-btn" onClick={ClickHandler}>
                            <i className="fa fa-arrow-left"></i> Back to News
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = encodeURIComponent(article.title);

    return (
        <>
            {article && !loading && (
                <SEO
                    title={article.title}
                    description={article.excerpt || (article.content ? article.content.substring(0, 160) : '')}
                    keywords={article.tags ? article.tags.join(', ') : `${article.category}, ANMC News, Community News`}
                    author={article.authorName || 'ANMC'}
                    type="article"
                    image={article.featuredImage || ''}
                    publishedTime={article.date || ''}
                    modifiedTime={article.updatedAt || article.date || ''}
                    category={article.category || ''}
                    tags={article.tags || []}
                />
            )}
            <section className="wpo-blog-single-section section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col col-lg-10 offset-lg-1 col-12">
                            <div className="wpo-blog-content">
                            {/* Breadcrumb */}
                            <div className="breadcrumb-section">
                                <Link to="/news" onClick={ClickHandler}>
                                    <i className="fa fa-arrow-left"></i> Back to News
                                </Link>
                            </div>

                            {/* Article Header */}
                            <div className="article-header">
                                <div className="article-category">
                                    <span className="category-badge">{article.category}</span>
                                </div>
                                <h1 className="article-title">{article.title}</h1>

                                <div className="article-meta">
                                    <div className="meta-item">
                                        <i className="fa fa-user"></i>
                                        <span>By {article.authorName}</span>
                                    </div>
                                    <div className="meta-item">
                                        <i className="fa fa-calendar"></i>
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="article-featured-image">
                                <img src={article.featuredImage} alt={article.title} />
                            </div>

                            {/* Article Content */}
                            <div className="article-content">
                                <div className="article-excerpt">
                                    <p><strong>{stripHtmlTags(article.excerpt)}</strong></p>
                                </div>

                                <div className="article-body">
                                    {stripHtmlTags(article.content).split('\n\n').map((paragraph, index) => (
                                        paragraph.trim() && <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            {article.tags && article.tags.length > 0 && (
                                <div className="article-tags">
                                    <h4>Tags:</h4>
                                    <div className="tags-list">
                                        {article.tags.map((tag, index) => (
                                            <span key={index} className="tag-item">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share Section */}
                            <div className="article-share">
                                <h4>Share this article:</h4>
                                <div className="share-buttons">
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-btn facebook"
                                    >
                                        <i className="fa fa-facebook"></i>
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-btn twitter"
                                    >
                                        <i className="fa fa-twitter"></i>
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-btn linkedin"
                                    >
                                        <i className="fa fa-linkedin"></i>
                                    </a>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(shareUrl);
                                            alert('Link copied to clipboard!');
                                        }}
                                        className="share-btn copy"
                                    >
                                        <i className="fa fa-link"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Related Articles */}
                            {relatedArticles.length > 0 && (
                                <div className="related-articles">
                                    <h3>Related Articles</h3>
                                    <div className="row">
                                        {relatedArticles.map((related) => (
                                            <div key={related.id} className="col-lg-4 col-md-6 col-12">
                                                <div className="related-article-card">
                                                    <Link to={`/news/${related.slug}`} onClick={ClickHandler}>
                                                        <div className="related-article-image">
                                                            <img
                                                                src={related.featuredImage || blog1}
                                                                alt={related.title}
                                                            />
                                                            <div className="category-badge">{related.category}</div>
                                                        </div>
                                                        <div className="related-article-content">
                                                            <h4>{related.title}</h4>
                                                            <p className="article-date">
                                                                <i className="fa fa-calendar"></i>
                                                                {new Date(related.date).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};

export default BlogSingle;
