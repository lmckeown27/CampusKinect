import { render, screen } from '@testing-library/react';
import HomeTab from '../tabs/HomeTab';

// Mock the stores
jest.mock('@/stores/postsStore', () => ({
  usePostsStore: () => ({
    posts: [],
    filters: { mainTab: 'all', subTab: '', tags: [], search: '', sortBy: 'relevance' },
    isLoading: false,
    error: null,
    hasMore: false,
    fetchPosts: jest.fn(),
    setMainTab: jest.fn(),
    setSubTab: jest.fn(),
    setTags: jest.fn(),
    setSearch: jest.fn(),
  }),
}));

// Mock the utils
jest.mock('@/utils', () => ({
  formatDate: jest.fn(() => 'Mock Date'),
  getPostTypeLabel: jest.fn(() => 'Mock Label'),
  getPostTypeColor: jest.fn(() => 'text-gray-600 bg-gray-100'),
  getGradeColor: jest.fn(() => 'text-gray-600 bg-gray-100'),
}));

describe('HomeTab', () => {
  it('renders without crashing', () => {
    render(<HomeTab />);
    expect(screen.getByText('CampusConnect')).toBeInTheDocument();
  });

  it('displays the main tab navigation', () => {
    render(<HomeTab />);
    expect(screen.getByText('Goods/Services')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('shows search bar', () => {
    render(<HomeTab />);
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
  });
}); 