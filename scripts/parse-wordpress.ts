import * as fs from 'fs';
import * as path from 'path';
import { parseString } from 'xml2js';

interface WPPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  categoryName: string;
  categories: { slug: string; name: string }[];
  date: string;
  modified: string;
  content: string;
  excerpt: string;
  featuredImageId: number | null;
  featuredImageUrl: string;
  type: 'post' | 'page';
  status: string;
}

interface WPCategory {
  id: number;
  slug: string;
  name: string;
  parent: string;
  description: string;
  count: number;
}

interface WPAttachment {
  id: number;
  url: string;
  title: string;
  parentId: number;
}

function extractCDATA(val: any): string {
  if (!val) return '';
  if (Array.isArray(val)) val = val[0];
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val._) return val._;
  if (typeof val === 'object' && val['_']) return val['_'];
  return String(val || '');
}

function cleanContent(html: string): string {
  if (!html) return '';
  
  // Remove WordPress Gutenberg block comments
  html = html.replace(/<!-- \/?wp:[^>]*-->/g, '');
  
  // Remove [aib_post_related ...] shortcodes
  html = html.replace(/\[aib_post_related[^\]]*\]/g, '');
  
  // Remove other common WordPress shortcodes
  html = html.replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gs, '$1');
  html = html.replace(/\[gallery[^\]]*\]/g, '');
  html = html.replace(/\[embed\](.*?)\[\/embed\]/g, '$1');
  
  // Remove empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  // Clean up excessive whitespace
  html = html.replace(/\n{3,}/g, '\n\n');
  
  return html.trim();
}

function generateExcerpt(content: string, maxLength: number = 160): string {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

async function parseWordPressXML() {
  const xmlPath = '/Users/charlie/Downloads/chefexperto.WordPress.2026-09-01.xml';
  const outputDir = path.join(__dirname, '..', 'data');
  
  console.log('📖 Reading WordPress XML file...');
  const xmlData = fs.readFileSync(xmlPath, 'utf-8');
  
  console.log('🔄 Parsing XML (this may take a moment for 76MB)...');
  
  const result: any = await new Promise((resolve, reject) => {
    parseString(xmlData, {
      explicitCDATA: false,
      trim: true,
      normalizeTags: false,
      explicitArray: true,
    }, (err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
  
  const channel = result.rss.channel[0];
  
  // Extract categories
  console.log('📂 Extracting categories...');
  const categories: WPCategory[] = [];
  const wpCategories = channel['wp:category'] || [];
  
  for (const cat of wpCategories) {
    categories.push({
      id: parseInt(extractCDATA(cat['wp:term_id'])),
      slug: extractCDATA(cat['wp:category_nicename']),
      name: extractCDATA(cat['wp:cat_name']),
      parent: extractCDATA(cat['wp:category_parent']),
      description: extractCDATA(cat['wp:category_description'] || ''),
      count: 0,
    });
  }
  
  console.log(`  Found ${categories.length} categories`);
  
  // Extract items (posts, pages, attachments)
  const items = channel.item || [];
  console.log(`📄 Processing ${items.length} items...`);
  
  const posts: WPPost[] = [];
  const pages: WPPost[] = [];
  const attachments: Map<number, WPAttachment> = new Map();
  const imageUrls: Set<string> = new Set();
  
  let publishedPostCount = 0;
  let draftCount = 0;
  let attachmentCount = 0;
  
  for (const item of items) {
    const postType = extractCDATA(item['wp:post_type']);
    const status = extractCDATA(item['wp:status']);
    const postId = parseInt(extractCDATA(item['wp:post_id']));
    
    if (postType === 'attachment') {
      attachmentCount++;
      const url = extractCDATA(item['wp:attachment_url']);
      if (url) {
        attachments.set(postId, {
          id: postId,
          url: url,
          title: extractCDATA(item.title),
          parentId: parseInt(extractCDATA(item['wp:post_parent'])) || 0,
        });
      }
      continue;
    }
    
    if (postType !== 'post' && postType !== 'page') continue;
    if (status !== 'publish') {
      draftCount++;
      continue;
    }
    
    // Extract categories for this post
    const postCategories: { slug: string; name: string }[] = [];
    const cats = item.category || [];
    for (const cat of cats) {
      const domain = cat.$ && cat.$.domain;
      if (domain === 'category') {
        postCategories.push({
          slug: cat.$.nicename || '',
          name: extractCDATA(cat),
        });
      }
    }
    
    // Get primary category (first one, or use post slug path)
    const primaryCat = postCategories[0] || { slug: 'blog', name: 'Blog' };
    
    // Get featured image ID from postmeta
    let featuredImageId: number | null = null;
    const postmetas = item['wp:postmeta'] || [];
    for (const meta of postmetas) {
      const key = extractCDATA(meta['wp:meta_key']);
      if (key === '_thumbnail_id') {
        featuredImageId = parseInt(extractCDATA(meta['wp:meta_value'])) || null;
        break;
      }
    }
    
    const rawContent = extractCDATA(item['content:encoded']);
    const content = cleanContent(rawContent);
    const slug = extractCDATA(item['wp:post_name']);
    
    // Extract image URLs from content
    const imgRegex = /https?:\/\/chefexperto\.com\/wp-content\/uploads\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp)/gi;
    let match;
    while ((match = imgRegex.exec(rawContent)) !== null) {
      imageUrls.add(match[0]);
    }
    
    const postData: WPPost = {
      id: postId,
      title: extractCDATA(item.title),
      slug: slug,
      category: primaryCat.slug,
      categoryName: primaryCat.name,
      categories: postCategories,
      date: extractCDATA(item['wp:post_date']),
      modified: extractCDATA(item['wp:post_modified']),
      content: content,
      excerpt: extractCDATA(item['excerpt:encoded']) || generateExcerpt(content),
      featuredImageId: featuredImageId,
      featuredImageUrl: '',
      type: postType as 'post' | 'page',
      status: status,
    };
    
    if (postType === 'page') {
      pages.push(postData);
    } else {
      posts.push(postData);
      publishedPostCount++;
      
      // Count posts per category
      for (const cat of postCategories) {
        const catObj = categories.find(c => c.slug === cat.slug);
        if (catObj) catObj.count++;
      }
    }
  }
  
  // Resolve featured images
  console.log('🖼️  Resolving featured images...');
  let resolvedImages = 0;
  for (const post of [...posts, ...pages]) {
    if (post.featuredImageId && attachments.has(post.featuredImageId)) {
      const att = attachments.get(post.featuredImageId)!;
      post.featuredImageUrl = att.url;
      imageUrls.add(att.url);
      resolvedImages++;
    }
  }
  
  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Save outputs
  console.log('💾 Saving output files...');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save posts
  fs.writeFileSync(
    path.join(outputDir, 'posts.json'),
    JSON.stringify(posts, null, 2),
    'utf-8'
  );
  
  // Save pages
  fs.writeFileSync(
    path.join(outputDir, 'pages.json'),
    JSON.stringify(pages, null, 2),
    'utf-8'
  );
  
  // Save categories (only those with posts)
  const activeCategories = categories.filter(c => c.count > 0);
  fs.writeFileSync(
    path.join(outputDir, 'categories.json'),
    JSON.stringify(activeCategories, null, 2),
    'utf-8'
  );
  
  // Save image URLs for download script
  fs.writeFileSync(
    path.join(outputDir, 'image-urls.json'),
    JSON.stringify([...imageUrls], null, 2),
    'utf-8'
  );
  
  // Print summary
  console.log('\n✅ WordPress XML parsing complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  📄 Published posts: ${publishedPostCount}`);
  console.log(`  📃 Published pages: ${pages.length}`);
  console.log(`  📝 Drafts skipped:  ${draftCount}`);
  console.log(`  📂 Categories:      ${activeCategories.length} active / ${categories.length} total`);
  console.log(`  🖼️  Attachments:     ${attachmentCount}`);
  console.log(`  🖼️  Featured imgs:   ${resolvedImages} resolved`);
  console.log(`  🔗 Image URLs:      ${imageUrls.size} unique`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  📁 Output: ${outputDir}/`);
  console.log('    - posts.json');
  console.log('    - pages.json');
  console.log('    - categories.json');
  console.log('    - image-urls.json');
  
  // Print categories breakdown
  console.log('\n📊 Categories breakdown:');
  for (const cat of activeCategories.sort((a, b) => b.count - a.count)) {
    console.log(`    ${cat.name} (/${cat.slug}/) — ${cat.count} posts`);
  }
}

parseWordPressXML().catch(console.error);
