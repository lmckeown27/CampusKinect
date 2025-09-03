import { create } from 'zustand';
import { Post, CreatePostForm, PostFilters } from '../types';
import apiService from '../services/api';

interface PostsState {
  posts: Post[];
  filteredPosts: Post[];
  currentPost: Post | null;
  filters: PostFilters;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalPosts: number;
  currentPage: number;
}

interface PostsActions {
  fetchPosts: (page?: number, reset?: boolean) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (postData: CreatePostForm) => Promise<void>;
  updatePost: (id: string, postData: Partial<CreatePostForm>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  setFilters: (filters: Partial<PostFilters>) => void;
  clearFilters: () => void;
  searchPosts: (query: string) => Promise<void>;
  sortPosts: (sortBy: 'date' | 'grade' | 'relevance') => void;
  bookmarkPost: (postId: string) => void;
  unbookmarkPost: (postId: string) => void;
  setCurrentPost: (post: Post | null) => void;
  clearError: () => void;
  resetState: () => void;
}

type PostsStore = PostsState & PostsActions;

const initialState: PostsState = {
  posts: [],
  filteredPosts: [],
  currentPost: null,
  filters: {},
  isLoading: false,
  error: null,
  hasMore: true,
  totalPosts: 0,
  currentPage: 1,
};

export const usePostsStore = create<PostsStore>((set, get) => ({
  ...initialState,

  fetchPosts: async (page = 1, reset = false) => {
    const { filters, currentPage } = get();
    
    if (reset) {
      set({ posts: [], currentPage: 1, hasMore: true });
    }

    if (!get().hasMore && !reset) return;

    set({ isLoading: true, error: null });

    try {
      const response = await apiService.getPosts(page, 20, filters);
      const { data, pagination } = response;



      set((state) => ({
        posts: reset ? data : [...state.posts, ...data],
        filteredPosts: reset ? data : [...state.filteredPosts, ...data],
        totalPosts: pagination.total,
        hasMore: pagination.page < pagination.totalPages,
        currentPage: pagination.page,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch posts', 
        isLoading: false 
      });
    }
  },

  fetchPost: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const post = await apiService.getPost(id);
      set({ currentPost: post, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch post', 
        isLoading: false 
      });
    }
  },

  createPost: async (postData: CreatePostForm) => {
    set({ isLoading: true, error: null });

    try {
      const newPost = await apiService.createPost(postData);
      set((state) => ({
        posts: [newPost, ...state.posts],
        filteredPosts: [newPost, ...state.filteredPosts],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create post', 
        isLoading: false 
      });
      throw error;
    }
  },

  updatePost: async (id: string, postData: Partial<CreatePostForm>) => {
    set({ isLoading: true, error: null });

    try {
      const updatedPost = await apiService.updatePost(id, postData);
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === id ? updatedPost : post
        ),
        filteredPosts: state.filteredPosts.map(post => 
          post.id === id ? updatedPost : post
        ),
        currentPost: state.currentPost?.id === id ? updatedPost : state.currentPost,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update post', 
        isLoading: false 
      });
      throw error;
    }
  },

  deletePost: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await apiService.deletePost(id);
      set((state) => ({
        posts: state.posts.filter(post => post.id !== id),
        filteredPosts: state.filteredPosts.filter(post => post.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete post', 
        isLoading: false 
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<PostFilters>) => {
    set((state) => {
      const newFilters = { ...state.filters, ...filters };
      
      // Handle property removal: if a property is explicitly set to undefined, remove it
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof PostFilters] === undefined) {
          delete newFilters[key as keyof PostFilters];
        }
      });
      
      // Clean up conflicting category parameters
      if (newFilters.postType && newFilters.postTypes) {
        // If both exist, prefer the newer one based on what was just set
        if (filters.postType !== undefined) {
          delete newFilters.postTypes; // New single selection, clear multiple
        } else if (filters.postTypes !== undefined) {
          delete newFilters.postType; // New multiple selection, clear single
        }
      }
      
      return {
        filters: newFilters,
      currentPage: 1,
      hasMore: true,
      };
    });
    
    // Refetch posts with new filters
    get().fetchPosts(1, true);
  },

  clearFilters: () => {
    set((state) => ({
      filters: {},
      currentPage: 1,
      hasMore: true,
    }));
    
    // Refetch posts without filters
    get().fetchPosts(1, true);
  },

  searchPosts: async (query: string) => {
    if (!query.trim()) {
      get().clearFilters();
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await apiService.searchPosts(query, get().filters);
      const { data, pagination } = response;

      set({
        filteredPosts: data,
        totalPosts: pagination.total,
        hasMore: pagination.page < pagination.totalPages,
        currentPage: pagination.page,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Search failed', 
        isLoading: false 
      });
    }
  },

  sortPosts: (sortBy: 'date' | 'grade' | 'relevance') => {
    set((state) => {
      const sortedPosts = [...state.filteredPosts].sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'grade':
            return b.grade - a.grade;
          case 'relevance':
            // For now, just sort by date as relevance would need backend implementation
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });

      return { filteredPosts: sortedPosts };
    });
  },

  bookmarkPost: (postId: string) => {
    // This would typically call an API to bookmark
    // For now, just update local state
    set((state) => ({
      posts: state.posts.map(post => 
        post.id === postId ? { ...post, isBookmarked: true } : post
      ),
      filteredPosts: state.filteredPosts.map(post => 
        post.id === postId ? { ...post, isBookmarked: true } : post
      ),
    }));
  },

  unbookmarkPost: (postId: string) => {
    set((state) => ({
      posts: state.posts.map(post => 
        post.id === postId ? { ...post, isBookmarked: false } : post
      ),
      filteredPosts: state.filteredPosts.map(post => 
        post.id === postId ? { ...post, isBookmarked: false } : post
      ),
    }));
  },

  setCurrentPost: (post: Post | null) => {
    set({ currentPost: post });
  },

  clearError: () => {
    set({ error: null });
  },

  resetState: () => {
    set(initialState);
  },
})); 