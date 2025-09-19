'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Mail, 
  User, 
  ShoppingBag, 
  MessageCircle, 
  Shield, 
  Settings,
  ChevronRight,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  Book,
  Users,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  description: string;
  popular?: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: Article[];
}

export default function SupportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    campus: '',
    issueType: '',
    description: ''
  });

  const popularArticles: Article[] = [
    {
      id: 'verify-email',
      title: 'Getting Started: Verify your university email',
      category: 'Getting Started',
      description: 'Step-by-step guide to verify your .edu email address',
      popular: true
    },
    {
      id: 'post-item',
      title: 'How to post an item in the marketplace',
      category: 'Marketplace Basics',
      description: 'Create your first listing with photos and pricing',
      popular: true
    },
    {
      id: 'messaging',
      title: 'How to message a buyer/seller',
      category: 'Messaging & Connections',
      description: 'Start conversations and manage your messages',
      popular: true
    },
    {
      id: 'safety',
      title: 'Staying safe on CampusKinect',
      category: 'Safety & Trust',
      description: 'Essential safety tips for campus trading',
      popular: true
    }
  ];

  const categories: Category[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <User size={24} />,
      description: 'Set up your account and get verified',
      articles: [
        {
          id: 'create-account',
          title: 'Create Your Account',
          category: 'Getting Started',
          description: 'Step-by-step account creation with .edu verification'
        },
        {
          id: 'setup-profile',
          title: 'Set Up Your Profile',
          category: 'Getting Started',
          description: 'Add your photo, bio, major, and graduation year'
        },
        {
          id: 'campus-verification',
          title: 'Campus Verification',
          category: 'Getting Started',
          description: 'Why verification matters and how it works'
        }
      ]
    },
    {
      id: 'marketplace',
      title: 'Marketplace Basics',
      icon: <ShoppingBag size={24} />,
      description: 'Buy and sell items on your campus',
      articles: [
        {
          id: 'post-item-detailed',
          title: 'Post an Item for Sale',
          category: 'Marketplace Basics',
          description: 'Add title, price, images, and description'
        },
        {
          id: 'edit-listing',
          title: 'Edit or Delete a Listing',
          category: 'Marketplace Basics',
          description: 'Manage your active marketplace posts'
        },
        {
          id: 'search-filter',
          title: 'Search & Filter Listings',
          category: 'Marketplace Basics',
          description: 'Find items by category, price, and campus'
        }
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging & Connections',
      icon: <MessageCircle size={24} />,
      description: 'Connect with other students',
      articles: [
        {
          id: 'message-users',
          title: 'Message a Seller or Buyer',
          category: 'Messaging & Connections',
          description: 'Start conversations about listings'
        },
        {
          id: 'manage-conversations',
          title: 'Manage Conversations',
          category: 'Messaging & Connections',
          description: 'Delete, archive, or block users'
        },
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          category: 'Messaging & Connections',
          description: 'Turn notifications on or off'
        }
      ]
    },
    {
      id: 'account-security',
      title: 'Account & Security',
      icon: <Lock size={24} />,
      description: 'Manage your account settings',
      articles: [
        {
          id: 'reset-password',
          title: 'Reset Your Password',
          category: 'Account & Security',
          description: 'Recover access to your account'
        },
        {
          id: 'privacy-settings',
          title: 'Privacy Settings',
          category: 'Account & Security',
          description: 'Control who can see your profile'
        },
        {
          id: 'report-user',
          title: 'Report a User or Post',
          category: 'Account & Security',
          description: 'Flag inappropriate content or behavior'
        }
      ]
    },
    {
      id: 'safety-trust',
      title: 'Safety & Trust',
      icon: <Shield size={24} />,
      description: 'Stay safe while trading',
      articles: [
        {
          id: 'safe-trading',
          title: 'Safe Trading Tips',
          category: 'Safety & Trust',
          description: 'Meet in public places and avoid scams'
        },
        {
          id: 'campus-rules',
          title: 'Campus Rules & Moderation',
          category: 'Safety & Trust',
          description: 'Community guidelines and enforcement'
        },
        {
          id: 'something-wrong',
          title: 'What to Do if Something Goes Wrong',
          category: 'Safety & Trust',
          description: 'Report issues and get help'
        }
      ]
    }
  ];

  const filteredArticles = () => {
    if (!searchQuery) return [];
    
    const allArticles = [...popularArticles, ...categories.flatMap(cat => cat.articles)];
    return allArticles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for contacting us! We\'ll respond within 24-48 hours.');
    setShowContactForm(false);
    setContactForm({ name: '', email: '', campus: '', issueType: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-grey-medium">
      {/* Header */}
      <div className="py-12" style={{ backgroundColor: '#708d81' }}>
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
              <span className="text-lg">Back</span>
            </button>
          </div>
          
          <div className="text-center">
            <Book size={48} className="text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">CampusKinect Help Center</h1>
            <p className="text-xl text-white opacity-90 mb-8">Find answers, get help, and learn how to use CampusKinect</p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg border-0 text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-white"
                style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Search Results for "{searchQuery}"
            </h2>
            {filteredArticles().length > 0 ? (
              <div className="grid gap-4">
                {filteredArticles().map((article) => (
                  <div
                    key={article.id}
                    className="p-6 bg-grey-light rounded-lg border border-gray-600 hover:border-[#708d81] transition-colors cursor-pointer"
                    style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}
                    onClick={() => {
                      const guideMap: { [key: string]: string } = {
                        'verify-email': '/support/guides/verify-email',
                        'post-item': '/support/guides/post-item',
                        'messaging': '/support/guides/messaging',
                        'safety': '/support/guides/safety'
                      };
                      const guidePath = guideMap[article.id];
                      if (guidePath) {
                        router.push(guidePath);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium" style={{ color: '#708d81' }}>{article.category}</span>
                        <h3 className="text-lg font-semibold mt-1 text-white">{article.title}</h3>
                        <p className="mt-2 text-gray-300">{article.description}</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300">No articles found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Popular Articles */}
        {!searchQuery && (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white">Popular Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-6 bg-grey-light rounded-lg border border-gray-600 hover:border-[#708d81] transition-all duration-200 cursor-pointer group"
                    style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}
                    onClick={() => {
                      const guideMap: { [key: string]: string } = {
                        'verify-email': '/support/guides/verify-email',
                        'post-item': '/support/guides/post-item',
                        'messaging': '/support/guides/messaging',
                        'safety': '/support/guides/safety'
                      };
                      const guidePath = guideMap[article.id];
                      if (guidePath) {
                        router.push(guidePath);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium" style={{ color: '#708d81' }}>{article.category}</span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#708d81] transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{article.title}</h3>
                    <p className="text-gray-300">{article.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-6 bg-grey-light rounded-lg border border-gray-600 hover:border-[#708d81] transition-all duration-200 cursor-pointer group"
                    style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#708d81' }}>
                        <div className="text-white">{category.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                        <p className="text-sm mt-1 text-gray-300">{category.description}</p>
                      </div>
                      <ChevronRight 
                        size={16} 
                        className={`text-gray-300 group-hover:text-[#708d81] transition-all duration-200 ${
                          selectedCategory === category.id ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                    
                    {selectedCategory === category.id && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="space-y-3">
                          {category.articles.map((article) => (
                            <div
                              key={article.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-600 cursor-pointer"
                              onClick={() => {
                                const guideMap: { [key: string]: string } = {
                                  'verify-email': '/support/guides/verify-email',
                                  'create-account': '/support/guides/verify-email',
                                  'setup-profile': '/support/guides/verify-email',
                                  'campus-verification': '/support/guides/verify-email',
                                  'post-item-detailed': '/support/guides/post-item',
                                  'edit-listing': '/support/guides/post-item',
                                  'search-filter': '/support/guides/post-item',
                                  'message-users': '/support/guides/messaging',
                                  'manage-conversations': '/support/guides/messaging',
                                  'push-notifications': '/support/guides/messaging',
                                  'reset-password': '/support/guides/verify-email',
                                  'privacy-settings': '/support/guides/verify-email',
                                  'report-user': '/support/guides/safety',
                                  'safe-trading': '/support/guides/safety',
                                  'campus-rules': '/support/guides/safety',
                                  'something-wrong': '/support/guides/safety'
                                };
                                const guidePath = guideMap[article.id];
                                if (guidePath) {
                                  router.push(guidePath);
                                }
                              }}
                            >
                              <div>
                                <h4 className="text-sm font-medium text-white">{article.title}</h4>
                                <p className="text-xs mt-1 text-gray-300">{article.description}</p>
                              </div>
                              <ChevronRight size={14} className="text-gray-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Contact Support Section */}
        <div className="p-8 rounded-xl border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
          <div className="text-center mb-8">
            <Users size={48} className="text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Still Need Help?</h2>
            <p className="text-white opacity-90">Can't find what you're looking for? Get in touch with our support team.</p>
          </div>

          {!showContactForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowContactForm(true)}
                className="px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 cursor-pointer"
                style={{ 
                  backgroundColor: 'white', 
                  color: '#708d81',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <Send size={20} className="inline mr-2" />
                Submit a Support Request
              </button>
              <div className="mt-4 flex items-center justify-center space-x-2 text-white opacity-80">
                <Clock size={16} />
                <span className="text-sm">We aim to reply within 24–48 hours</span>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Campus</label>
                    <input
                      type="text"
                      required
                      value={contactForm.campus}
                      onChange={(e) => setContactForm({...contactForm, campus: e.target.value})}
                      placeholder="e.g., University of California, Berkeley"
                      className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Issue Type</label>
                    <select
                      required
                      value={contactForm.issueType}
                      onChange={(e) => setContactForm({...contactForm, issueType: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <option value="">Select an issue type</option>
                      <option value="account">Account Issues</option>
                      <option value="marketplace">Marketplace Problems</option>
                      <option value="safety">Safety Concerns</option>
                      <option value="bug">Bug Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.description}
                    onChange={(e) => setContactForm({...contactForm, description: e.target.value})}
                    placeholder="Please describe your issue in detail..."
                    className="w-full px-4 py-3 rounded-lg border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
                    style={{ 
                      backgroundColor: 'white', 
                      color: '#708d81',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <Send size={18} className="inline mr-2" />
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-6 py-3 rounded-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-[#708d81] transition-all duration-200 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 