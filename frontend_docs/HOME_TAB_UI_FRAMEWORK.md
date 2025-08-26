# 🏠 CampusConnect Home Tab UI Framework

## 📋 **Overview**
This document defines the complete UI framework for the CampusConnect Home tab, implementing a personalized feed system with a 3-tab structure: Goods/Services (left), All (center), and Events (right), featuring side pullout panels for advanced filtering.

## 🎯 **Design Philosophy**
- **Pure Marketplace** - No gamification or competitive metrics
- **Personalized Experience** - Content tailored to user interests and location
- **Efficient Discovery** - Easy post browsing and filtering
- **University-Focused** - Content from user's university and nearby institutions
- **Mobile-First** - Responsive design optimized for mobile devices
- **Intuitive Navigation** - Clear tab system with side pullout panels

## 🏗️ **Component Architecture**

### **1. Type Definitions**
```typescript
interface PostFilters {
  mainTab: 'goods-services' | 'all' | 'events';
  offerRequest?: 'offer' | 'request' | 'all';
  tags: Tag[];
  university: 'all' | 'current' | 'nearby';
  distance: number;
}

interface Tag {
  id: string;
  name: string;
  category: string;
}

interface UserPreferences {
  interests: string[];
  location: string;
  university: string;
}

interface PulloutPanel {
  isOpen: boolean;
  side: 'left' | 'right' | null;
  activeFilters: string[];
}
```

### **2. Home Tab Container**
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
    mainTab: 'all',
    tags: [],
    university: 'all',
    distance: 50
  });
  const [pulloutPanel, setPulloutPanel] = useState<PulloutPanel>({
    isOpen: false,
    side: null,
    activeFilters: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch personalized posts
  const fetchPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      
      // Convert mainTab filter to post type filters
      let postTypeFilter = 'all';
      if (filters.mainTab === 'goods-services') {
        postTypeFilter = 'goods-services'; // Will include both offers and requests
      } else if (filters.mainTab === 'events') {
        postTypeFilter = 'event';
      }
      
      const response = await getPersonalizedPosts({
        userId,
        universityId,
        filters: {
          ...filters,
          postType: postTypeFilter
        },
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
  
  // Handle tab changes
  const handleTabChange = useCallback((newTab: 'goods-services' | 'all' | 'events') => {
    setFilters(prev => ({ ...prev, mainTab: newTab }));
    setPage(1);
    
    // Open appropriate pullout panel
    if (newTab === 'goods-services') {
      setPulloutPanel({
        isOpen: true,
        side: 'left',
        activeFilters: []
      });
    } else if (newTab === 'events') {
      setPulloutPanel({
        isOpen: true,
        side: 'right',
        activeFilters: []
      });
    } else {
      // All tab - close pullout
      setPulloutPanel({
        isOpen: false,
        side: null,
        activeFilters: []
      });
    }
    
    fetchPosts(1, true);
  }, [fetchPosts]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<PostFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);
  
  // Handle pullout panel close
  const handlePulloutClose = useCallback(() => {
    setPulloutPanel({
      isOpen: false,
      side: null,
      activeFilters: []
    });
  }, []);
  
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
      {/* Search and Tab Header */}
      <HomeHeader 
        searchQuery={searchQuery}
        onSearch={handleSearch}
        activeTab={filters.mainTab}
        onTabChange={handleTabChange}
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
      
      {/* Side Pullout Panels */}
      {pulloutPanel.isOpen && (
        <PulloutPanel
          side={pulloutPanel.side!}
          isOpen={pulloutPanel.isOpen}
          onClose={handlePulloutClose}
          filters={filters}
          onFilterChange={handleFilterChange}
          activeFilters={pulloutPanel.activeFilters}
        />
      )}
      
      {/* Quick Actions */}
      <QuickActions 
        onCreatePost={() => navigateToCreatePost()}
        onViewProfile={() => navigateToProfile()}
      />
    </div>
  );
};
```

### **3. Home Header Component**
```typescript
interface HomeHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  activeTab: 'goods-services' | 'all' | 'events';
  onTabChange: (tab: 'goods-services' | 'all' | 'events') => void;
  userPreferences: UserPreferences;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  searchQuery,
  onSearch,
  activeTab,
  onTabChange,
  userPreferences
}) => {
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
      
      {/* Three-Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'goods-services' ? 'active' : ''}`}
          onClick={() => onTabChange('goods-services')}
        >
          🏷️ Goods/Services
        </button>
        
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onTabChange('all')}
        >
          🏠 All
        </button>
        
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => onTabChange('events')}
        >
          🎉 Events
        </button>
      </div>
    </div>
  );
};
```

### **4. Pullout Panel Component**
```typescript
interface PulloutPanelProps {
  side: 'left' | 'right';
  isOpen: boolean;
  onClose: () => void;
  filters: PostFilters;
  onFilterChange: (filters: Partial<PostFilters>) => void;
  activeFilters: string[];
}

const PulloutPanel: React.FC<PulloutPanelProps> = ({
  side,
  isOpen,
  onClose,
  filters,
  onFilterChange,
  activeFilters
}) => {
  const [localFilters, setLocalFilters] = useState<string[]>(activeFilters);
  
  const handleFilterToggle = (filterId: string) => {
    setLocalFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };
  
  const handleApplyFilters = () => {
    onFilterChange({ tags: localFilters });
    onClose();
  };
  
  const handleClearFilters = () => {
    setLocalFilters([]);
    onFilterChange({ tags: [] });
  };
  
  const isGoodsServices = side === 'left';
  
  return (
    <div className={`pullout-panel ${side} ${isOpen ? 'open' : ''}`}>
      <div className="pullout-header">
        <h3>
          {isGoodsServices ? '🏷️ Goods/Services Filters' : '🎉 Events Filters'}
        </h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="pullout-content">
        {/* Offer/Request Toggle - Only for Goods/Services */}
        {isGoodsServices && (
          <div className="offer-request-toggle">
            <button
              className={`toggle-button ${filters.offerRequest === 'offer' ? 'active' : ''}`}
              onClick={() => onFilterChange({ offerRequest: 'offer' })}
            >
              Offer
            </button>
            <button
              className={`toggle-button ${filters.offerRequest === 'request' ? 'active' : ''}`}
              onClick={() => onFilterChange({ offerRequest: 'request' })}
            >
              Request
            </button>
            <button
              className={`toggle-button ${filters.offerRequest === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange({ offerRequest: 'all' })}
            >
              All
            </button>
          </div>
        )}
        
        {/* Category Filters */}
        <div className="filter-categories">
          {isGoodsServices ? (
            <>
              <FilterCategory
                title="📚 Academic"
                filters={['tutoring', 'study-groups', 'textbooks', 'notes']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
              
              <FilterCategory
                title="🏠 Housing"
                filters={['subleases', 'roommates', 'furniture', 'moving-help']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
              
              <FilterCategory
                title="🚗 Transportation"
                filters={['ride-shares', 'carpooling', 'bike-sales', 'parking-spots']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
              
              <FilterCategory
                title="💰 Financial"
                filters={['paid-services', 'free-services', 'budget-options', 'payment-plans']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
            </>
          ) : (
            <>
              <FilterCategory
                title="📚 Academic"
                filters={['study-groups', 'workshops', 'seminars', 'academic-events']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
              
              <FilterCategory
                title="🎭 Arts & Culture"
                filters={['film-screenings', 'art-exhibitions', 'music-performances', 'cultural-events']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
              
              <FilterCategory
                title="🏃 Sports & Recreation"
                filters={['intramural-sports', 'fitness-classes', 'outdoor-activities', 'sports-events']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
              
              <FilterCategory
                title="📅 Timing"
                filters={['one-time-events', 'weekly-events', 'monthly-events', 'special-occasions']}
                selectedFilters={localFilters}
                onFilterToggle={handleFilterToggle}
              />
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="filter-actions">
          <button className="btn-secondary" onClick={handleClearFilters}>
            Clear All
          </button>
          <button className="btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
```

### **5. Filter Category Component**
```typescript
interface FilterCategoryProps {
  title: string;
  filters: string[];
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
}

const FilterCategory: React.FC<FilterCategoryProps> = ({
  title,
  filters,
  selectedFilters,
  onFilterToggle
}) => {
  return (
    <div className="filter-category">
      <h4 className="category-title">{title}</h4>
      <div className="filter-options">
        {filters.map(filter => (
          <label key={filter} className="filter-option">
            <input
              type="checkbox"
              checked={selectedFilters.includes(filter)}
              onChange={() => onFilterToggle(filter)}
              className="filter-checkbox"
            />
            <span className="filter-label">{filter.replace('-', ' ')}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
```

### **6. Posts Feed Component**
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

### **7. Post Card Component**
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

### **8. Quick Actions Component**
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
  position: relative;
  overflow: hidden;
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

### **Tab Navigation Styles**
```css
.tab-navigation {
  display: flex;
  padding: var(--space-4);
  gap: var(--space-2);
  justify-content: center;
}

.tab-button {
  background: none;
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-base);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  min-width: 120px;
}

.tab-button:hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.tab-button.active {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
  color: var(--bg-primary);
}
```

### **Pullout Panel Styles**
```css
.pullout-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 320px;
  background-color: var(--bg-primary);
  border: 1px solid var(--bg-tertiary);
  box-shadow: var(--shadow-2xl);
  z-index: 100;
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
}

.pullout-panel.left {
  left: 0;
  transform: translateX(-100%);
}

.pullout-panel.right {
  right: 0;
  transform: translateX(100%);
}

.pullout-panel.left.open {
  transform: translateX(0);
}

.pullout-panel.right.open {
  transform: translateX(0);
}

.pullout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-tertiary);
  background-color: var(--bg-secondary);
}

.pullout-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: var(--text-xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-md);
}

.close-button:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.pullout-content {
  padding: var(--space-4);
}

.offer-request-toggle {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.toggle-button {
  flex: 1;
  padding: var(--space-2);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-button:hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.toggle-button.active {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
  color: var(--bg-primary);
}
```

### **Filter Category Styles**
```css
.filter-categories {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.filter-category {
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.category-title {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.filter-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-blue);
}

.filter-label {
  cursor: pointer;
}

.filter-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--bg-tertiary);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--primary-blue);
  color: var(--bg-primary);
}

.btn-primary:hover {
  background-color: var(--primary-blue-dark);
}

.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background-color: var(--bg-secondary);
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
  background-color: var(--info-blue);
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
- **Touch-friendly tabs** - Minimum 44px height
- **Swipe gestures** - Swipe left/right to open pullouts
- **Simplified layouts** - Single-column on mobile
- **Optimized spacing** - Appropriate margins for mobile

### **Desktop Enhancements**
- **Hover effects** - Interactive feedback on tabs
- **Keyboard navigation** - Tab order and shortcuts
- **Mouse interactions** - Click to open pullouts
- **Larger touch targets** - Better desktop experience

## 🔄 **State Management**

### **Feed State**
- **Posts array** - Current feed posts
- **Loading states** - Fetching and pagination
- **Error handling** - Network and validation errors
- **Filter state** - Current active filters

### **Tab State**
- **Active tab** - Currently selected tab (goods-services, all, events)
- **Pullout panels** - Open/closed state and side
- **Filter persistence** - User's filter selections maintained

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
- **Smooth animations** - Tab transitions and pullout animations
- **Loading states** - Clear progress indicators
- **Error boundaries** - Graceful error handling
- **Offline support** - Basic offline functionality

## 🏷️ **Tab Scheme Implementation**

### **Goods/Services Tab (Left)**
- **Content**: Includes both Offers and Requests
- **Pullout**: Left-side panel with Offer/Request toggle + category filters
- **Filtering**: Shows marketplace posts (tutoring, housing, transportation, etc.)
- **User Experience**: Students can browse available services and requests with advanced filtering
- **Implementation**: Backend filters posts by `post_type` in ['offer', 'request']

### **All Tab (Center)**
- **Content**: All post types mixed together
- **Pullout**: None - shows unfiltered content
- **Filtering**: No specific filtering applied
- **User Experience**: Students see the complete feed as default
- **Implementation**: Backend shows all posts without type filtering

### **Events Tab (Right)**
- **Content**: Event-specific posts only
- **Pullout**: Right-side panel with event-specific category filters
- **Filtering**: Shows gatherings, study groups, activities, etc.
- **User Experience**: Students can discover campus events with targeted filtering
- **Implementation**: Backend filters posts by `post_type` = 'event'

### **Tab Switching Logic**
- **State Management**: `filters.mainTab` controls active tab
- **Pullout Behavior**: Automatic opening/closing based on tab selection
- **Content Filtering**: Automatic filtering based on selected tab
- **Search Integration**: Search works within the context of selected tab
- **Filter Persistence**: User's filter selections maintained during session

This UI framework provides a complete, responsive, and performant Home tab implementation that delivers a personalized marketplace experience for university students with the correct 3-tab system and side pullout panels for advanced filtering. 