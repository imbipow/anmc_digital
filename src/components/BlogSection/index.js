import React, { useState, useEffect } from 'react'
import author from '../../images/blog/admin.jpg'
import {Link} from 'react-router-dom'

import contentService from '../../services/contentService'

import './style.css'

const BlogSection = (props) => {
    const [sectionContent, setSectionContent] = useState({
        sectionTitle: "Recent Updates",
        sectionHeading: "Latest News & Events"
    });
    
    const [blogPosts, setBlogPosts] = useState([
        {
          id: 1,
          blogImg: props.blogImg1,
          title: "ANMC Annual Dashain Celebration 2024",
          authorName: 'ANMC Admin',
          date: '15 Oct 2024',
          link: "/news-details"
        },
        {
          id: 2,
          blogImg: props.blogImg2,
          title: "New Community Center Opening Soon",
          authorName: 'ANMC Admin',
          date: '8 Dec 2024',
          link: "/news-details"
        },
        {
          id: 3,
          blogImg: props.blogImg3,
          title: "Youth Program Registration Now Open",
          authorName: 'ANMC Admin',
          date: '3 Jan 2025',
          link: "/news-details"
        },
    ]);
    
    const ClickHandler = () =>{
        window.scrollTo(10, 0);
     }

    useEffect(() => {
        const loadContent = async () => {
            try {
                const blogSectionData = await contentService.getBlogSectionContent();
                if (blogSectionData && Object.keys(blogSectionData).length > 0) {
                    setSectionContent(blogSectionData);
                }

                // Get featured content (news and events combined)
                const featuredContent = await contentService.getFeaturedContent();
            
                // Combine featured news and events, limit to 3 items
                const combinedPosts = [];
                
                // Add featured news
                if (featuredContent.news && featuredContent.news.length > 0) {
                    featuredContent.news.forEach(item => {
                        combinedPosts.push({
                            id: `news-${item.id}`,
                            title: item.title,
                            authorName: item.authorName,
                            date: item.date,
                            blogImg: item.featuredImage || props.blogImg1,
                            link: `/news/${item.slug}`,
                            type: 'news'
                        });
                    });
                }
                
                // Add featured events
                if (featuredContent.events && featuredContent.events.length > 0) {
                    featuredContent.events.forEach(item => {
                        combinedPosts.push({
                            id: `event-${item.id}`,
                            title: item.title,
                            authorName: 'ANMC Admin',
                            date: item.startDate,
                            blogImg: item.featuredImage || props.blogImg2,
                            link: `/events/${item.slug}`,
                            type: 'event'
                        });
                    });
                }
                
                // If we have featured content, use it; otherwise fall back to legacy data
                if (combinedPosts.length > 0) {
                    setBlogPosts(combinedPosts.slice(0, 3));
                } else {
                    // Fallback to legacy blog posts
                    const blogPostsData = await contentService.getBlogPosts();
                    if (blogPostsData && blogPostsData.length > 0) {
                        const updatedPosts = blogPostsData.map((post, index) => ({
                            ...post,
                            blogImg: post.blogImg || (index === 0 ? props.blogImg1 : index === 1 ? props.blogImg2 : props.blogImg3),
                            type: 'blog'
                        }));
                        setBlogPosts(updatedPosts);
                    }
                }
            } catch (error) {
                console.error('Error loading blog section content:', error);
            }
        };
        loadContent();
    }, [props.blogImg1, props.blogImg2, props.blogImg3]);
    return(
        <div className="blog-area section-padding">
            <div className="container">
                <div className="col-l2">
                    <div className="wpo-section-title">
                        <span>{sectionContent.sectionTitle}</span>
                        <h2>{sectionContent.sectionHeading}</h2>
                    </div>
                </div>
                <div className="row">
                    {blogPosts.map((blog, bl) => (
                        <div className="col-lg-4 col-md-6 col-12 custom-grid" key={blog.id || bl}>
                            <div className="blog-item">
                                <div className="blog-img">
                                <img src={blog.blogImg} alt="" />
                                </div>
                                <div className="blog-content">
                                    <h3>
                                        {blog.link ? (
                                            <Link onClick={ClickHandler} to={blog.link}>{blog.title}</Link>
                                        ) : (
                                            <span>{blog.title}</span>
                                        )}
                                    </h3>
                                    <ul className="post-meta">
                                        <li><img src={author} alt="" /></li>
                                        <li>
                                            {blog.link ? (
                                                <Link onClick={ClickHandler} to={blog.link}>{blog.authorName}</Link>
                                            ) : (
                                                <span>{blog.authorName}</span>
                                            )}
                                        </li>
                                        <li><i className="fa fa-clock-o" aria-hidden="true"></i> {blog.date}</li>
                                        {blog.type && blog.type !== 'blog' && (
                                            <li><span className={`content-badge ${blog.type}`}>
                                                {blog.type === 'news' ? 'News' : 'Event'}
                                            </span></li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default BlogSection;