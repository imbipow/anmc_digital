/**
 * Strip HTML tags from a string
 * @param {string} html - HTML string to strip
 * @returns {string} - Plain text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html) return '';

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#039;/g, "'");
  text = text.replace(/&apos;/g, "'");

  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 200) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Strip HTML and truncate in one operation
 * @param {string} html - HTML string
 * @param {number} maxLength - Maximum length
 * @returns {string} - Plain text, truncated
 */
export const stripAndTruncate = (html, maxLength = 200) => {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
};

/**
 * Convert WordPress shortcodes to HTML equivalents
 * @param {string} content - Content with WordPress shortcodes
 * @returns {string} - Content with WordPress shortcodes converted to HTML
 */
export const convertWordPressToHTML = (content) => {
  if (!content) return '';

  let converted = content;

  // Convert [caption] shortcode to HTML figure with figcaption
  // Example: [caption id="attachment_123" align="aligncenter" width="300"]Image caption text[/caption]
  converted = converted.replace(
    /\[caption[^\]]*\](.*?)\[\/caption\]/gs,
    (_match, captionContent) => {
      // Extract image tag if present
      const imgMatch = captionContent.match(/<img[^>]*>/);
      const img = imgMatch ? imgMatch[0] : '';
      // Extract caption text (everything after the img tag)
      const caption = captionContent.replace(/<img[^>]*>/, '').trim();

      if (img && caption) {
        return `<figure class="wp-caption">${img}<figcaption>${caption}</figcaption></figure>`;
      } else if (img) {
        return img;
      }
      return caption;
    }
  );

  // Convert [gallery] shortcode to a placeholder or remove
  // Gallery shortcodes typically need special handling with image IDs
  converted = converted.replace(/\[gallery[^\]]*\]/g, '<div class="gallery-placeholder"><em>Gallery</em></div>');

  // Convert [audio] shortcode to HTML5 audio tag
  // Example: [audio src="file.mp3"]
  converted = converted.replace(
    /\[audio[^\]]*src=["']([^"']+)["'][^\]]*\]/g,
    '<audio controls><source src="$1" type="audio/mpeg">Your browser does not support the audio element.</audio>'
  );

  // Convert [video] shortcode to HTML5 video tag
  // Example: [video src="file.mp4"]
  converted = converted.replace(
    /\[video[^\]]*src=["']([^"']+)["'][^\]]*\]/g,
    '<video controls><source src="$1" type="video/mp4">Your browser does not support the video element.</video>'
  );

  // Convert [embed] or embedded URLs to iframe (for YouTube, Vimeo, etc.)
  // Example: [embed]https://www.youtube.com/watch?v=xxxxx[/embed]
  converted = converted.replace(
    /\[embed\](.*?)\[\/embed\]/gs,
    (_match, url) => {
      // YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (videoId) {
          return `<div class="video-embed"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId[1]}" frameborder="0" allowfullscreen></iframe></div>`;
        }
      }
      // Vimeo
      if (url.includes('vimeo.com')) {
        const videoId = url.match(/vimeo\.com\/(\d+)/);
        if (videoId) {
          return `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${videoId[1]}" width="640" height="360" frameborder="0" allowfullscreen></iframe></div>`;
        }
      }
      // Default: just return the URL as a link
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
  );

  // Convert [quote] or [blockquote] to HTML blockquote
  converted = converted.replace(/\[(?:block)?quote[^\]]*\](.*?)\[\/(?:block)?quote\]/gs, '<blockquote>$1</blockquote>');

  // Convert [code] to HTML code/pre tags
  converted = converted.replace(/\[code[^\]]*\](.*?)\[\/code\]/gs, '<pre><code>$1</code></pre>');

  // Convert [button] shortcode to HTML button/link
  // Example: [button url="http://example.com"]Click Me[/button]
  converted = converted.replace(
    /\[button[^\]]*url=["']([^"']+)["'][^\]]*\](.*?)\[\/button\]/gs,
    '<a href="$1" class="wp-button">$2</a>'
  );

  // Remove any remaining unknown shortcodes but keep their content
  converted = converted.replace(/\[([a-zA-Z_]+)[^\]]*\](.*?)\[\/\1\]/gs, '$2');
  converted = converted.replace(/\[([a-zA-Z_]+)[^\]]*\]/g, '');

  return converted;
};

/**
 * Strip WordPress shortcodes and specific WordPress tags while preserving HTML
 * @param {string} content - Content with WordPress shortcodes
 * @returns {string} - Content without WordPress shortcodes but with HTML preserved
 */
export const stripWordPressTags = (content) => {
  if (!content) return '';

  let cleaned = content;

  // First convert WordPress shortcodes to HTML
  cleaned = convertWordPressToHTML(cleaned);

  // Remove WordPress-specific HTML comments
  cleaned = cleaned.replace(/<!--\s*wp:(.*?)-->/gs, '');
  cleaned = cleaned.replace(/<!--\s*\/wp:(.*?)-->/gs, '');

  // Remove Gutenberg block markers
  cleaned = cleaned.replace(/<!--\s*wp:.*?-->/gs, '');

  // Remove empty paragraph tags often left by WordPress
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');

  return cleaned.trim();
};

/**
 * Clean WordPress content for display (strips WP tags but keeps HTML)
 * @param {string} content - WordPress content
 * @returns {string} - Cleaned content with HTML preserved
 */
export const cleanWordPressContent = (content) => {
  if (!content) return '';

  // First strip WordPress-specific tags
  let cleaned = stripWordPressTags(content);

  // Decode HTML entities
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#039;/g, "'");
  cleaned = cleaned.replace(/&apos;/g, "'");

  return cleaned.trim();
};
