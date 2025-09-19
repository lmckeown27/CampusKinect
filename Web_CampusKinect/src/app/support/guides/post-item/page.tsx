'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, DollarSign, Tag, MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PostItemGuide() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      {/* Header */}
      <div className="py-8" style={{ backgroundColor: '#708d81' }}>
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition-colors duration-200 font-medium cursor-pointer"
              style={{ color: '#708d81' }}
            >
              <ArrowLeft size={20} />
              <span>Back to Help Center</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Post an Item for Sale</h1>
            <p className="text-xl text-white opacity-90">Create your first listing with photos and pricing</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Before You Start */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Before You Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">What You'll Need:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Clear photos of your item</li>
                <li>Item description and details</li>
                <li>Fair market price</li>
                <li>Category selection</li>
                <li>Your location/pickup details</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Tips for Success:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Use natural lighting for photos</li>
                <li>Be honest about condition</li>
                <li>Research similar item prices</li>
                <li>Write detailed descriptions</li>
                <li>Respond quickly to messages</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#99afa7' }}>Step-by-Step Posting</h2>
          
          {/* Step 1 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Access the Create Post Page</h3>
                <p className="mb-4 text-gray-300">
                  Navigate to the marketplace section and click the "Create Post" or "+" button.
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">How to Find It:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>Web: Click "Create Post" in the top navigation</li>
                    <li>Mobile: Tap the "+" button in the bottom navigation</li>
                    <li>Or go directly to /create-post</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Add Photos</h3>
                <p className="mb-4 text-gray-300">
                  Upload clear, well-lit photos of your item from multiple angles.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Good Photos:</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>Well-lit, natural lighting</li>
                      <li>Multiple angles</li>
                      <li>Show any flaws or wear</li>
                      <li>Clean background</li>
                      <li>High resolution</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">❌ Avoid:</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>Blurry or dark photos</li>
                      <li>Only one angle</li>
                      <li>Hiding damage</li>
                      <li>Cluttered background</li>
                      <li>Low quality images</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Write Title & Description</h3>
                <p className="mb-4 text-gray-300">
                  Create a clear, descriptive title and detailed description of your item.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Title Best Practices:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>Include brand, model, and key features</li>
                      <li>Keep it under 60 characters</li>
                      <li>Be specific and accurate</li>
                      <li>Example: "MacBook Pro 13-inch 2020 - Excellent Condition"</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Description Should Include:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>Detailed specifications</li>
                      <li>Condition and any flaws</li>
                      <li>Reason for selling</li>
                      <li>What's included</li>
                      <li>Pickup/delivery preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                4
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Set Price & Category</h3>
                <p className="mb-4 text-gray-300">
                  Choose the right category and set a fair, competitive price.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Pricing Tips:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>Research similar items</li>
                      <li>Consider condition and age</li>
                      <li>Price slightly high for negotiation</li>
                      <li>Be realistic about value</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Popular Categories:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>Electronics & Tech</li>
                      <li>Textbooks & School Supplies</li>
                      <li>Furniture & Home</li>
                      <li>Clothing & Accessories</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                5
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Add Location & Preferences</h3>
                <p className="mb-4 text-gray-300">
                  Set your location and specify pickup/delivery preferences.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Safety First:</h4>
                      <p className="text-sm text-yellow-700">
                        Always meet in public places on campus. Consider campus security offices, libraries, or busy common areas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="mb-6 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#708d81' }}>
                6
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Review & Publish</h3>
                <p className="mb-4 text-gray-300">
                  Double-check all information before publishing your listing.
                </p>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Final Checklist:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>Photos are clear and show the item well</li>
                        <li>Title and description are accurate</li>
                        <li>Price is fair and competitive</li>
                        <li>Category is correct</li>
                        <li>Contact preferences are set</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* After Publishing */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>After Publishing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Managing Your Listing:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Respond to messages promptly</li>
                <li>Edit listing if needed</li>
                <li>Mark as sold when complete</li>
                <li>Delete if no longer available</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Boosting Visibility:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>Share with friends</li>
                <li>Post in relevant campus groups</li>
                <li>Update listing to refresh it</li>
                <li>Consider adjusting price if no interest</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="mb-8 p-6 bg-grey-light rounded-lg border border-gray-600" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#99afa7' }}>Safety Guidelines</h2>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={16} className="text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Important Safety Tips:</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>Always meet in public, well-lit areas</li>
                  <li>Bring a friend when possible</li>
                  <li>Trust your instincts</li>
                  <li>Don't share personal information</li>
                  <li>Use campus security as meeting points</li>
                  <li>Report suspicious behavior</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Need More Help */}
        <div className="p-6 rounded-lg border-2 border-[#708d81]" style={{ backgroundColor: '#708d81' }}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Need Help with Your Listing?</h2>
            <p className="text-white opacity-90 mb-4">
              Our support team can help you create the perfect listing and answer any questions.
            </p>
            <button
              onClick={() => router.push('/support')}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
              style={{ 
                backgroundColor: 'white', 
                color: '#99afa7',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 