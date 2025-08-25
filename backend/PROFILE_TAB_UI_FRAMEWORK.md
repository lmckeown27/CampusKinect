# 👤 CampusConnect Profile Tab UI Framework

## 📋 **Overview**
This document defines the complete UI framework for the CampusConnect Profile tab, implementing profile management, post history with selection capabilities, and bulk fulfillment functionality.

## 🎯 **Design Philosophy**
- **Pure Marketplace** - No gamification or competitive metrics
- **Practical Management** - Tools for managing marketplace presence
- **Efficient Post Management** - Bulk operations for post cleanup
- **Clean Interface** - Focus on functionality over statistics
- **Mobile-First** - Responsive design optimized for mobile devices

## 🏗️ **Component Architecture**

### **1. Profile Tab Container**
```typescript
interface ProfileTabProps {
  userId: string;
  universityId: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ userId, universityId }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  
  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserProfile(userId);
      setProfile(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Fetch user posts
  const fetchPosts = useCallback(async () => {
    try {
      const response = await getUserPosts(userId);
      setPosts(response.posts);
    } catch (err) {
      setError(err.message);
    }
  }, [userId]);
  
  // Handle post selection
  const handlePostSelection = useCallback((postId: string, selected: boolean) => {
    if (selected) {
      setSelectedPosts(prev => [...prev, postId]);
    } else {
      setSelectedPosts(prev => prev.filter(id => id !== postId));
    }
  }, []);
  
  // Handle bulk fulfillment
  const handleBulkFulfillment = useCallback(async () => {
    if (selectedPosts.length === 0) return;
    
    try {
      await bulkFulfillPosts(selectedPosts);
      setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)));
      setSelectedPosts([]);
      setShowFulfillmentModal(false);
    } catch (err) {
      setError(err.message);
    }
  }, [selectedPosts]);
  
  // Initial load
  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);
  
  if (loading) {
    return <ProfileLoadingState />;
  }
  
  if (error) {
    return <ProfileErrorState error={error} onRetry={fetchProfile} />;
  }
  
  if (!profile) {
    return <ProfileNotFoundState />;
  }
  
  return (
    <div className="profile-tab">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        editMode={editMode}
        onEditToggle={() => setEditMode(!editMode)}
        onProfileUpdate={fetchProfile}
      />
      
      {/* Profile Actions */}
      <ProfileActions
        onCreatePost={() => navigateToCreatePost()}
        onPrivacySettings={() => navigateToPrivacy()}
        onAccountSettings={() => navigateToSettings()}
      />
      
      {/* Posts Section */}
      <PostsSection
        posts={posts}
        selectedPosts={selectedPosts}
        onPostSelection={handlePostSelection}
        onBulkFulfill={() => setShowFulfillmentModal(true)}
        onPostEdit={(postId) => navigateToEditPost(postId)}
        onPostDelete={(postId) => handlePostDelete(postId)}
      />
      
      {/* Fulfillment Confirmation Modal */}
      {showFulfillmentModal && (
        <FulfillmentConfirmationModal
          selectedCount={selectedPosts.length}
          onConfirm={handleBulkFulfillment}
          onCancel={() => setShowFulfillmentModal(false)}
        />
      )}
    </div>
  );
};
```

### **2. Profile Header Component**
```typescript
interface ProfileHeaderProps {
  profile: UserProfile;
  editMode: boolean;
  onEditToggle: () => void;
  onProfileUpdate: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  editMode,
  onEditToggle,
  onProfileUpdate
}) => {
  const [editForm, setEditForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    year: profile.year,
    major: profile.major,
    hometown: profile.hometown
  });
  
  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      onProfileUpdate();
      onEditToggle();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };
  
  const handleCancel = () => {
    setEditForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      year: profile.year,
      major: profile.major,
      hometown: profile.hometown
    });
    onEditToggle();
  };
  
  return (
    <div className="profile-header">
      <div className="profile-info">
        <div className="profile-picture-section">
          <img
            src={profile.profilePicture || '/default-avatar.png'}
            alt="Profile picture"
            className="profile-picture"
          />
          {editMode && (
            <button className="change-picture-button">
              📷
            </button>
          )}
        </div>
        
        <div className="profile-details">
          {editMode ? (
            <div className="edit-form">
              <div className="name-row">
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="edit-input"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="edit-input"
                  placeholder="Last Name"
                />
              </div>
              
              <input
                type="text"
                value={editForm.major}
                onChange={(e) => setEditForm(prev => ({ ...prev, major: e.target.value }))}
                className="edit-input"
                placeholder="Major/Field of Study"
              />
              
              <input
                type="text"
                value={editForm.hometown}
                onChange={(e) => setEditForm(prev => ({ ...prev, hometown: e.target.value }))}
                className="edit-input"
                placeholder="Hometown"
              />
              
              <select
                value={editForm.year}
                onChange={(e) => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                className="edit-select"
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5">Fifth Year+</option>
              </select>
            </div>
          ) : (
            <div className="profile-text">
              <h1 className="profile-name">{profile.displayName}</h1>
              <p className="profile-major">{profile.major}</p>
              <p className="profile-year">Year {profile.year}</p>
              <p className="profile-hometown">{profile.hometown}</p>
            </div>
          )}
          
          <div className="profile-university">
            <span className="university-icon">🏫</span>
            <span>{profile.university.name}</span>
          </div>
          
          <div className="profile-member-since">
            <span className="member-icon">📅</span>
            <span>Member since {formatDate(profile.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        {editMode ? (
          <div className="edit-actions">
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onEditToggle}>
            ✏️ Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};
```

### **3. Profile Actions Component**
```typescript
interface ProfileActionsProps {
  onCreatePost: () => void;
  onPrivacySettings: () => void;
  onAccountSettings: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  onCreatePost,
  onPrivacySettings,
  onAccountSettings
}) => {
  return (
    <div className="profile-actions">
      <button className="action-button create-post" onClick={onCreatePost}>
        <span className="icon">✏️</span>
        <span className="label">Create Post</span>
      </button>
      
      <button className="action-button privacy" onClick={onPrivacySettings}>
        <span className="icon">🔒</span>
        <span className="label">Privacy</span>
      </button>
      
      <button className="action-button settings" onClick={onAccountSettings}>
        <span className="icon">⚙️</span>
        <span className="label">Settings</span>
      </button>
    </div>
  );
};
```

### **4. Posts Section Component**
```typescript
interface PostsSectionProps {
  posts: Post[];
  selectedPosts: string[];
  onPostSelection: (postId: string, selected: boolean) => void;
  onBulkFulfill: () => void;
  onPostEdit: (postId: string) => void;
  onPostDelete: (postId: string) => void;
}

const PostsSection: React.FC<PostsSectionProps> = ({
  posts,
  selectedPosts,
  onPostSelection,
  onBulkFulfill,
  onPostEdit,
  onPostDelete
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  
  const filteredPosts = posts.filter(post => {
    if (filter === 'active') return !post.expiresAt || new Date(post.expiresAt) > new Date();
    if (filter === 'expired') return post.expiresAt && new Date(post.expiresAt) <= new Date();
    return true;
  });
  
  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      onPostSelection('', false); // Clear all
    } else {
      filteredPosts.forEach(post => onPostSelection(post.id, true));
    }
  };
  
  return (
    <div className="posts-section">
      <div className="posts-header">
        <h2>My Posts</h2>
        
        <div className="posts-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({posts.length})
          </button>
          <button
            className={`filter-button ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({posts.filter(p => !p.expiresAt || new Date(p.expiresAt) > new Date()).length})
          </button>
          <button
            className={`filter-button ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Expired ({posts.filter(p => p.expiresAt && new Date(p.expiresAt) <= new Date()).length})
          </button>
        </div>
      </div>
      
      {selectedPosts.length > 0 && (
        <div className="bulk-actions">
          <div className="selection-info">
            {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
          </div>
          <button className="btn-primary" onClick={onBulkFulfill}>
            Fulfill Selected Posts ({selectedPosts.length})
          </button>
        </div>
      )}
      
      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <div className="empty-posts">
            <div className="empty-icon">📝</div>
            <h3>No posts found</h3>
            <p>You haven't created any posts yet, or no posts match your current filter.</p>
            <button className="btn-primary" onClick={() => navigateToCreatePost()}>
              Create Your First Post
            </button>
          </div>
        ) : (
          <>
            <div className="posts-header-row">
              <div className="select-all">
                <input
                  type="checkbox"
                  checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                  onChange={handleSelectAll}
                  className="select-checkbox"
                />
                <span>Select All</span>
              </div>
            </div>
            
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                selected={selectedPosts.includes(post.id)}
                onSelectionChange={(selected) => onPostSelection(post.id, selected)}
                onEdit={() => onPostEdit(post.id)}
                onDelete={() => onPostDelete(post.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
```

### **5. Post Card Component**
```typescript
interface PostCardProps {
  post: Post;
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  selected,
  onSelectionChange,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="post-card">
      <div className="post-selection">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectionChange(e.target.checked)}
          className="post-checkbox"
        />
      </div>
      
      <div className="post-content">
        <div className="post-header">
          <div className="post-type-badge">
            {post.postType === 'offer' && <span className="badge offer">Offer</span>}
            {post.postType === 'request' && <span className="badge request">Request</span>}
            {post.postType === 'event' && <span className="badge event">Event</span>}
          </div>
          
          <div className="post-actions">
            <button
              className="action-button"
              onClick={() => setShowActions(!showActions)}
            >
              ⋯
            </button>
            
            {showActions && (
              <div className="actions-dropdown">
                <button onClick={onEdit}>✏️ Edit</button>
                <button onClick={onDelete}>🗑️ Delete</button>
              </div>
            )}
          </div>
        </div>
        
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag.id} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="post-meta">
          <span className="post-date">
            Created {formatRelativeTime(post.createdAt)}
          </span>
          
          {post.expiresAt && (
            <span className="post-expiry">
              Expires {formatRelativeTime(post.expiresAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

### **6. Fulfillment Confirmation Modal**
```typescript
interface FulfillmentConfirmationModalProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const FulfillmentConfirmationModal: React.FC<FulfillmentConfirmationModalProps> = ({
  selectedCount,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="modal-overlay">
      <div className="fulfillment-modal">
        <div className="modal-header">
          <h2>⚠️ Fulfill Posts</h2>
        </div>
        
        <div className="modal-content">
          <p>You are about to fulfill {selectedCount} selected post{selectedCount !== 1 ? 's' : ''}.</p>
          
          <div className="warning-section">
            <h3>⚠️ IMPORTANT:</h3>
            <p>When a post is fulfilled, it is <strong>PERMANENTLY DELETED</strong> and cannot be recovered.</p>
            
            <div className="consequences">
              <p>This action will:</p>
              <ul>
                <li>Remove the posts from your profile</li>
                <li>Delete all associated images and tags</li>
                <li>Remove the posts from search results</li>
                <li>Cannot be undone</li>
              </ul>
            </div>
          </div>
          
          <p className="confirmation-text">
            Are you sure you want to permanently delete these posts?
          </p>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Fulfill & Delete ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 🎨 **CSS Implementation**

### **Profile Tab Container Styles**
```css
.profile-tab {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-secondary);
}

.profile-header {
  background-color: var(--bg-primary);
  padding: var(--space-6);
  border-bottom: 1px solid var(--bg-tertiary);
}

.profile-info {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
}

.profile-picture-section {
  position: relative;
  flex-shrink: 0;
}

.profile-picture {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--bg-tertiary);
}

.change-picture-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background-color: var(--primary-blue);
  color: var(--bg-primary);
  border: 2px solid var(--bg-primary);
  font-size: var(--text-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-details {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
}

.profile-major,
.profile-year,
.profile-hometown {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0 0 var(--space-1) 0;
}

.profile-university,
.profile-member-since {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-2) 0;
}

.university-icon,
.member-icon {
  font-size: var(--text-lg);
}
```

### **Edit Form Styles**
```css
.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.edit-input,
.edit-select {
  padding: var(--space-3);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background-color: var(--bg-primary);
  transition: border-color 0.2s ease;
}

.edit-input:focus,
.edit-select:focus {
  outline: none;
  border-color: var(--primary-blue);
}

.profile-actions {
  margin-top: var(--space-4);
  display: flex;
  gap: var(--space-3);
}

.btn-primary,
.btn-secondary {
  padding: var(--space-3) var(--space-5);
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

### **Profile Actions Styles**
```css
.profile-actions {
  background-color: var(--bg-primary);
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-tertiary);
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.action-button:hover {
  border-color: var(--primary-blue);
  background-color: var(--bg-secondary);
}

.action-button .icon {
  font-size: var(--text-2xl);
}

.action-button .label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}
```

### **Posts Section Styles**
```css
.posts-section {
  flex: 1;
  padding: var(--space-4);
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.posts-header h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0;
  color: var(--text-primary);
}

.posts-filters {
  display: flex;
  gap: var(--space-2);
}

.filter-button {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-full);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.filter-button.active {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
  color: var(--bg-primary);
}

.bulk-actions {
  background-color: var(--bg-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid var(--primary-blue);
}

.selection-info {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}
```

### **Post Card Styles**
```css
.post-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  padding: var(--space-4);
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  border: 1px solid var(--bg-tertiary);
  transition: all 0.2s ease;
}

.post-card:hover {
  border-color: var(--primary-blue);
  box-shadow: var(--shadow-sm);
}

.post-selection {
  flex-shrink: 0;
  padding-top: var(--space-1);
}

.post-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-blue);
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
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

.post-actions {
  position: relative;
}

.action-button {
  background: none;
  border: none;
  font-size: var(--text-lg);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-md);
}

.action-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.actions-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
  min-width: 120px;
}

.actions-dropdown button {
  width: 100%;
  padding: var(--space-3);
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.actions-dropdown button:hover {
  background-color: var(--bg-secondary);
}

.post-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
}

.post-description {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.tag {
  padding: var(--space-1) var(--space-3);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.post-meta {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.post-date,
.post-expiry {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

### **Modal Styles**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.fulfillment-modal {
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--bg-tertiary);
  text-align: center;
}

.modal-header h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  margin: 0;
  color: var(--text-primary);
}

.modal-content {
  padding: var(--space-6);
}

.warning-section {
  background-color: #FFF3CD;
  border: 1px solid #FFEAA7;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin: var(--space-4) 0;
}

.warning-section h3 {
  color: #856404;
  margin: 0 0 var(--space-2) 0;
  font-size: var(--text-base);
}

.warning-section p {
  color: #856404;
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-sm);
}

.consequences {
  margin-top: var(--space-3);
}

.consequences p {
  margin: 0 0 var(--space-2) 0;
  font-weight: var(--font-medium);
}

.consequences ul {
  margin: 0;
  padding-left: var(--space-4);
}

.consequences li {
  margin-bottom: var(--space-1);
}

.confirmation-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  text-align: center;
  margin: var(--space-4) 0;
  font-weight: var(--font-medium);
}

.modal-actions {
  padding: var(--space-6);
  border-top: 1px solid var(--bg-tertiary);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.btn-danger {
  background-color: var(--error-red);
  color: var(--bg-primary);
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-danger:hover {
  background-color: #D32F2F;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

### **Profile State**
- **User profile data** - Personal information and preferences
- **Edit mode** - Profile editing state
- **Loading states** - Fetching and updating
- **Error handling** - Validation and network errors

### **Posts State**
- **Posts array** - User's post history
- **Selection state** - Selected posts for bulk operations
- **Filter state** - Current post filter
- **Loading states** - Fetching and operations

## 🎯 **Performance Features**

### **Optimization Strategies**
- **Efficient rendering** - Only re-render changed components
- **Lazy loading** - Load posts as needed
- **Optimistic updates** - Immediate UI feedback
- **Error boundaries** - Graceful error handling

### **User Experience**
- **Smooth animations** - Transitions and feedback
- **Loading states** - Clear progress indicators
- **Confirmation dialogs** - Prevent accidental actions
- **Responsive feedback** - Immediate user response

This UI framework provides a complete, responsive, and user-friendly Profile tab implementation that enables efficient marketplace presence management with safe bulk post fulfillment capabilities. 