# 🏠 CampusConnect Home Tab UI Framework

## 📋 **Overview**
This document defines the complete UI framework for the CampusConnect Home tab, implementing a personalized feed system with post discovery, search functionality, and multi-university support.

## 🎯 **Design Philosophy**
- **Pure Marketplace** - No gamification or competitive metrics
- **Personalized Experience** - Content tailored to user interests and location
- **Efficient Discovery** - Easy post browsing and filtering
- **University-Focused** - Content from user's university and nearby institutions
- **Mobile-First** - Responsive design optimized for mobile devices

## 🏗️ **Component Architecture**

### **1. Home Tab Container**
```typescript
interface HomeTabProps {
  userId: string;
  universityId: string;
  userPreferences: UserPreferences;
}

const HomeTab: React.FC<HomeTabProps> = ({ 
  userId, 
  universityId, 
  userPreferences 
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PostFilters>({
    postType: 'all',
    tags: [],
    university: 'all',
    distance: 50
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch personalized posts
  const fetchPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const response = await getPersonalizedPosts({
        userId,
        universityId,
        filters,
        searchQuery,
        page: pageNum,
        limit: 20
      });
      
      if (reset) {
        setPosts(response.posts);
        setFilteredPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
        setFilteredPosts(prev => [...prev, ...response.posts]);
      }
      
      setHasMore(response.posts.length === 20);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, universityId, filters, searchQuery]);
  
  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<PostFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);
  
  // Load more posts
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);
  
  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);
  
  return (
    <div className="home-tab">
      {/* Search and Filter Header */}
      <HomeHeader 
        searchQuery={searchQuery}
        onSearch={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        userPreferences={userPreferences}
      />
      
      {/* Posts Feed */}
      <PostsFeed
        posts={filteredPosts}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onPostInteraction={handlePostInteraction}
      />
      
      {/* Quick Actions */}
      <QuickActions 
        onCreatePost={() => navigateToCreatePost()}
        onViewProfile={() => navigateToProfile()}
      />
    </div>
  );
};
```

### **2. Home Header Component**
```typescript
interface HomeHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filters: PostFilters;
  onFilterChange: (filters: Partial<PostFilters>) => void;
  userPreferences: UserPreferences;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  searchQuery,
  onSearch,
  filters,
  onFilterChange,
  userPreferences
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="home-header">
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search posts, events, services..."
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search"
              onClick={() => onSearch('')}
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filters.postType === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange({ postType: 'all' })}
        >
          All Posts
        </button>
        <button
          className={`filter-tab ${filters.postType === 'offer' ? 'active' : ''}`}
          onClick={() => onFilterChange({ postType: 'offer' })}
        >
          Offers
        </button>
        <button
          className={`filter-tab ${filters.postType === 'request' ? 'active' : ''}`}
          onClick={() => onFilterChange({ postType: 'request' })}
        >
          Requests
        </button>
        <button
          className={`filter-tab ${filters.postType === 'event' ? 'active' : ''}`}
          onClick={() => onFilterChange({ postType: 'event' })}
        >
          Events
        </button>
      </div>
      
      {/* Advanced Filters */}
      <div className="advanced-filters">
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {showFilters ? '▼' : '▶'}
        </button>
        
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Tags</label>
              <TagSelector
                selectedTags={filters.tags}
                onTagsChange={(tags) => onFilterChange({ tags })}
                userPreferences={userPreferences}
              />
            </div>
            
            <div className="filter-group">
              <label>University</label>
              <select
                value={filters.university}
                onChange={(e) => onFilterChange({ university: e.target.value })}
              >
                <option value="all">All Universities</option>
                <option value="current">Current University</option>
                <option value="nearby">Nearby Universities</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Distance</label>
              <input
                type="range"
                min="5"
                max="100"
                value={filters.distance}
                onChange={(e) => onFilterChange({ distance: parseInt(e.target.value) })}
              />
              <span>{filters.distance} miles</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **3. Posts Feed Component**
```typescript
interface PostsFeedProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onPostInteraction: (postId: string, action: string) => void;
}

const PostsFeed: React.FC<PostsFeedProps> = ({
  posts,
  loading,
  error,
  hasMore,
  onLoadMore,
  onPostInteraction
}) => {
  const observer = useRef<IntersectionObserver>();
  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, onLoadMore]);
  
  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }
  
  if (posts.length === 0 && !loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No posts found</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
    );
  }
  
  return (
    <div className="posts-feed">
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostRef : null}
        >
          <PostCard
            post={post}
            onInteraction={onPostInteraction}
            showActions={true}
          />
        </div>
      ))}
      
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading more posts...</p>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="end-state">
          <p>You've reached the end of your feed</p>
        </div>
      )}
    </div>
  );
};
```

### **4. Post Card Component**
```typescript
interface PostCardProps {
  post: Post;
  onInteraction: (postId: string, action: string) => void;
  showActions: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onInteraction,
  showActions
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  const handleInteraction = (action: string) => {
    onInteraction(post.id, action);
    
    if (action === 'contact') {
      setShowContact(true);
    }
  };
  
  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="user-info">
          <img
            src={post.user.profilePicture || '/default-avatar.png'}
            alt={`${post.user.displayName}'s profile`}
            className="user-avatar"
            onClick={() => navigateToUserProfile(post.user.id)}
          />
          <div className="user-details">
            <h4 className="user-name">{post.user.displayName}</h4>
            <span className="post-meta">
              {post.university.name} • {formatRelativeTime(post.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="post-type-badge">
          {post.postType === 'offer' && <span className="badge offer">Offer</span>}
          {post.postType === 'request' && <span className="badge request">Request</span>}
          {post.postType === 'event' && <span className="badge event">Event</span>}
        </div>
      </div>
      
      {/* Post Content */}
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">
          {expanded ? post.description : `${post.description.substring(0, 150)}...`}
        </p>
        
        {post.description.length > 150 && (
          <button
            className="expand-button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}
        
        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Post image ${index + 1}`}
                className="post-image"
                onClick={() => openImageGallery(post.images, index)}
              />
            ))}
            {post.images.length > 3 && (
              <div className="image-overlay">
                +{post.images.length - 3} more
              </div>
            )}
          </div>
        )}
        
        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag.id} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        {/* Event Details */}
        {post.postType === 'event' && post.eventStart && (
          <div className="event-details">
            <div className="event-time">
              <span className="icon">📅</span>
              {formatEventTime(post.eventStart, post.eventEnd)}
            </div>
            {post.location && (
              <div className="event-location">
                <span className="icon">📍</span>
                {post.location}
              </div>
            )}
          </div>
        )}
        
        {/* Post Duration */}
        {post.expiresAt && (
          <div className="post-duration">
            <span className="icon">⏰</span>
            Expires {formatRelativeTime(post.expiresAt)}
          </div>
        )}
      </div>
      
      {/* Post Actions */}
      {showActions && (
        <div className="post-actions">
          <button
            className="action-button contact"
            onClick={() => handleInteraction('contact')}
          >
            💬 Contact
          </button>
          
          <button
            className="action-button save"
            onClick={() => handleInteraction('save')}
          >
            🔖 Save
          </button>
          
          <button
            className="action-button share"
            onClick={() => handleInteraction('share')}
          >
            📤 Share
          </button>
        </div>
      )}
      
      {/* Contact Modal */}
      {showContact && (
        <ContactModal
          post={post}
          onClose={() => setShowContact(false)}
          onSendMessage={(message) => {
            handleInteraction('message');
            setShowContact(false);
          }}
        />
      )}
    </div>
  );
};
```

### **5. Tag Selector Component**
```typescript
interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  userPreferences: UserPreferences;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  userPreferences
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  
  useEffect(() => {
    // Fetch available tags based on user preferences
    fetchAvailableTags(userPreferences).then(setAvailableTags);
  }, [userPreferences]);
  
  const toggleTag = (tag: Tag) => {
    if (selectedTags.find(t => t.id === tag.id)) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };
  
  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="tag selected"
            onClick={() => toggleTag(tag)}
          >
            {tag.name} ×
          </span>
        ))}
      </div>
      
      <button
        className="add-tags-button"
        onClick={() => setShowTagModal(true)}
      >
        + Add Tags
      </button>
      
      {showTagModal && (
        <TagSelectionModal
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
          onClose={() => setShowTagModal(false)}
        />
      )}
    </div>
  );
};
```

### **6. Quick Actions Component**
```typescript
interface QuickActionsProps {
  onCreatePost: () => void;
  onViewProfile: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreatePost,
  onViewProfile
}) => {
  return (
    <div className="quick-actions">
      <button
        className="quick-action create-post"
        onClick={onCreatePost}
      >
        <span className="icon">✏️</span>
        <span className="label">Create Post</span>
      </button>
      
      <button
        className="quick-action view-profile"
        onClick={onViewProfile}
      >
        <span className="icon">👤</span>
        <span className="label">My Profile</span>
      </button>
    </div>
  );
};
```

## 🎨 **CSS Implementation**

### **Home Tab Container Styles**
```css
.home-tab {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-secondary);
}

.home-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--bg-tertiary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-section {
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-tertiary);
}

.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-10);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background-color: var(--bg-secondary);
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background-color: var(--bg-primary);
}

.clear-search {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: var(--text-lg);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-md);
}

.clear-search:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
```

### **Filter Tabs Styles**
```css
.filter-tabs {
  display: flex;
  padding: var(--space-4);
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  background: none;
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.filter-tab.active {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
  color: var(--bg-primary);
}
```

### **Post Card Styles**
```css
.post-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  margin: var(--space-4);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.post-card:hover {
  box-shadow: var(--shadow-md);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-tertiary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.user-avatar:hover {
  opacity: 0.8;
}

.user-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  margin: 0;
  color: var(--text-primary);
}

.post-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.post-type-badge .badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge.offer {
  background-color: var(--success-green);
  color: var(--bg-primary);
}

.badge.request {
  background-color: var(--warning-orange);
  color: var(--bg-primary);
}

.badge.event {
  background-color: var(--primary-blue);
  color: var(--bg-primary);
}
```

### **Post Content Styles**
```css
.post-content {
  padding: var(--space-4);
}

.post-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-3) 0;
  color: var(--text-primary);
}

.post-description {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.expand-button {
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.expand-button:hover {
  color: var(--primary-blue-dark);
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-2);
  margin: var(--space-3) 0;
}

.post-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.post-image:hover {
  opacity: 0.8;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}
```

### **Post Actions Styles**
```css
.post-actions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--bg-tertiary);
}

.action-button {
  flex: 1;
  padding: var(--space-3);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--bg-secondary);
  border-color: var(--primary-blue);
}

.action-button.contact {
  background-color: var(--primary-blue);
  color: var(--bg-primary);
  border-color: var(--primary-blue);
}

.action-button.contact:hover {
  background-color: var(--primary-blue-dark);
}
```

## 📱 **Responsive Design**

### **Mobile-First Approach**
- **Touch-friendly inputs** - Minimum 44px height
- **Simplified layouts** - Single-column on mobile
- **Optimized spacing** - Appropriate margins for mobile
- **Gesture support** - Swipe and touch interactions

### **Desktop Enhancements**
- **Multi-column layouts** - Side-by-side elements
- **Hover effects** - Interactive feedback
- **Keyboard navigation** - Tab order and shortcuts
- **Larger touch targets** - Better desktop experience

## 🔄 **State Management**

### **Feed State**
- **Posts array** - Current feed posts
- **Loading states** - Fetching and pagination
- **Error handling** - Network and validation errors
- **Filter state** - Current active filters

### **User Interactions**
- **Post interactions** - Contact, save, share
- **Search queries** - Current search term
- **Filter preferences** - User filter selections
- **Navigation state** - Current page and view

## 🎯 **Performance Features**

### **Optimization Strategies**
- **Virtual scrolling** - Large post lists
- **Image lazy loading** - Optimized image loading
- **Infinite scroll** - Efficient pagination
- **Caching** - Redis integration for performance

### **User Experience**
- **Smooth animations** - Transitions and feedback
- **Loading states** - Clear progress indicators
- **Error boundaries** - Graceful error handling
- **Offline support** - Basic offline functionality

This UI framework provides a complete, responsive, and performant Home tab implementation that delivers a personalized marketplace experience for university students. 