import { create } from 'zustand';
import { Post, PostFilters, HomeTab } from '@/types';
import apiService from '@/services/api';

interface PostsState {
  posts: Post[];
  filteredPosts: Post[];
  currentPost: Post | null;
  filters: PostFilters;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalPosts: number;
}

interface PostsActions {
  // Fetch posts
  fetchPosts: (filters?: Partial<PostFilters>, append?: boolean) => Promise<void>;
  fetchPost: (postId: number) => Promise<void>;
  
  // Filter and search
  setFilters: (filters: Partial<PostFilters>) => void;
  setMainTab: (tab: HomeTab) => void;
  setSubTab: (tab: string) => void;
  setTags: (tags: string[]) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: PostFilters['sortBy']) => void;
  clearFilters: () => void;
  
  // Post interactions
  bookmarkPost: (postId: number) => Promise<void>;
  unbookmarkPost: (postId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  
  // Local state management
  setCurrentPost: (post: Post | null) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: number, updates: Partial<Post>) => void;
  removePost: (postId: number) => void;
  clearPosts: () => void;
  clearError: () => void;
}

type PostsStore = PostsState & PostsActions;

const initialFilters: PostFilters = {
  mainTab: 'all',
  subTab: '',
  tags: [],
  search: '',
  sortBy: 'relevance',
};

export const usePostsStore = create<PostsStore>((set, get) => ({
  // Initial state
  posts: [],
  filteredPosts: [],
  currentPost: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
  hasMore: true,
  totalPosts: 0,

  // Actions
  fetchPosts: async (filters = {}, append = false) => {
    const currentFilters = get().filters;
    const newFilters = { ...currentFilters, ...filters };
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getPosts({
        mainTab: newFilters.mainTab,
        subTab: newFilters.subTab,
        tags: newFilters.tags,
        search: newFilters.search,
        sortBy: newFilters.sortBy,
        limit: 20,
        offset: append ? get().posts.length : 0,
      });

      if (response.success && response.data) {
        const newPosts = response.data.data;
        const updatedPosts = append ? [...get().posts, ...newPosts] : newPosts;
        
        set({
          posts: updatedPosts,
          filteredPosts: updatedPosts,
          isLoading: false,
          hasMore: response.data.pagination.hasMore,
          totalPosts: response.data.pagination.total,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch posts',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch posts',
      });
    }
  },

  fetchPost: async (postId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getPost(postId);
      
      if (response.success && response.data) {
        set({
          currentPost: response.data,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch post',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch post',
      });
    }
  },

  setFilters: (filters: Partial<PostFilters>) => {
    const currentFilters = get().filters;
    const newFilters = { ...currentFilters, ...filters };
    
    set({ filters: newFilters });
    
    // Automatically fetch posts with new filters
    get().fetchPosts(newFilters, false);
  },

  setMainTab: (tab: HomeTab) => {
    get().setFilters({ mainTab: tab, subTab: '', tags: [] });
  },

  setSubTab: (tab: string) => {
    get().setFilters({ subTab: tab });
  },

  setTags: (tags: string[]) => {
    get().setFilters({ tags });
  },

  setSearch: (search: string) => {
    get().setFilters({ search });
  },

  setSortBy: (sortBy: PostFilters['sortBy']) => {
    get().setFilters({ sortBy });
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().fetchPosts(initialFilters, false);
  },

  bookmarkPost: async (postId: number) => {
    try {
      await apiService.bookmarkPost(postId);
      
      // Update local state
      const posts = get().posts.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: true }
          : post
      );
      
      set({ posts, filteredPosts: posts });
    } catch (error: any) {
      set({ error: error.message || 'Failed to bookmark post' });
    }
  },

  unbookmarkPost: async (postId: number) => {
    try {
      await apiService.unbookmarkPost(postId);
      
      // Update local state
      const posts = get().posts.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: false }
          : post
      );
      
      set({ posts, filteredPosts: posts });
    } catch (error: any) {
      set({ error: error.message || 'Failed to unbookmark post' });
    }
  },

  deletePost: async (postId: number) => {
    try {
      await apiService.deletePost(postId);
      
      // Remove from local state
      const posts = get().posts.filter(post => post.id !== postId);
      const filteredPosts = get().filteredPosts.filter(post => post.id !== postId);
      
      set({ posts, filteredPosts });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete post' });
    }
  },

  setCurrentPost: (post: Post | null) => {
    set({ currentPost: post });
  },

  addPost: (post: Post) => {
    const posts = [post, ...get().posts];
    set({ posts, filteredPosts: posts });
  },

  updatePost: (postId: number, updates: Partial<Post>) => {
    const posts = get().posts.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    );
    const filteredPosts = get().filteredPosts.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    );
    
    set({ posts, filteredPosts });
  },

  removePost: (postId: number) => {
    const posts = get().posts.filter(post => post.id !== postId);
    const filteredPosts = get().filteredPosts.filter(post => post.id !== postId);
    
    set({ posts, filteredPosts });
  },

  clearPosts: () => {
    set({ 
      posts: [], 
      filteredPosts: [], 
      currentPost: null,
      hasMore: true,
      totalPosts: 0,
    });
  },

  clearError: () => {
    set({ error: null });
  },
})); 