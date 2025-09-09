'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import KinectLogo from '@/assets/logos/KinectLogo.png';

export default function LandingPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const sections = [
    { id: 'hero', title: 'Welcome' },
    { id: 'features', title: 'Features' },
    { id: 'stats', title: 'Stats' },
    { id: 'cta', title: 'Join Now' }
  ];

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionWidth = container.clientWidth;
      container.scrollTo({
        left: index * sectionWidth,
        behavior: 'smooth'
      });
      setCurrentSection(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const newSection = Math.round(scrollLeft / sectionWidth);
      setCurrentSection(newSection);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9f6] to-[#e8f0e8]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <Image
              src={KinectLogo}
              alt="CampusKinect Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-lg font-bold text-[#708d81]">CampusKinect</h1>
          </div>
          <Link
            href="/auth/login"
            className="text-[#708d81] hover:text-[#5a7268] font-medium text-sm"
          >
            Sign In
          </Link>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 pb-3">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSection === index ? 'bg-[#708d81]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={KinectLogo}
              alt="CampusKinect Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-[#708d81]">CampusKinect</h1>
          </div>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="text-[#708d81] hover:text-[#5a7268] font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-[#708d81] text-white px-6 py-2 rounded-lg hover:bg-[#5a7268] transition-colors"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="lg:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Hero Section - Mobile */}
        <section className="min-w-full snap-start flex flex-col justify-center px-6 py-12 min-h-[calc(100vh-120px)]">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Connect with Your
              <span className="text-[#708d81] block">Campus Community</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join thousands of students finding events, roommates, study groups, and more.
            </p>
            <div className="space-y-4">
              <Link
                href="/auth/register"
                className="block bg-[#708d81] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#5a7268] transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <button
                onClick={() => scrollToSection(1)}
                className="block w-full border-2 border-[#708d81] text-[#708d81] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#708d81] hover:text-white transition-colors"
              >
                Learn More →
              </button>
            </div>
          </div>
        </section>

        {/* Features Section - Mobile */}
        <section className="min-w-full snap-start px-6 py-12 min-h-[calc(100vh-120px)]">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Everything You Need
          </h3>
          <div className="space-y-6">
            <MobileFeatureCard
              title="Campus Events"
              description="Discover parties, club meetings, and social events."
              icon="🎉"
            />
            <MobileFeatureCard
              title="Find Roommates"
              description="Connect with compatible roommates and housing."
              icon="🏠"
            />
            <MobileFeatureCard
              title="Study Groups"
              description="Join study groups and find tutoring help."
              icon="📚"
            />
            <MobileFeatureCard
              title="Buy & Sell"
              description="Trade textbooks, furniture, and electronics."
              icon="💰"
            />
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => scrollToSection(2)}
              className="text-[#708d81] font-semibold"
            >
              See Our Impact →
            </button>
          </div>
        </section>

        {/* Stats Section - Mobile */}
        <section className="min-w-full snap-start px-6 py-12 min-h-[calc(100vh-120px)] flex flex-col justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Trusted by Students
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <MobileStatCard number="50+" label="Universities" />
              <MobileStatCard number="10K+" label="Students" />
              <MobileStatCard number="25K+" label="Posts" />
              <MobileStatCard number="95%" label="Satisfaction" />
            </div>
            <button
              onClick={() => scrollToSection(3)}
              className="text-[#708d81] font-semibold"
            >
              Ready to Join? →
            </button>
          </div>
        </section>

        {/* CTA Section - Mobile */}
        <section className="min-w-full snap-start px-6 py-12 min-h-[calc(100vh-120px)] flex flex-col justify-center">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Connect?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join your university's social network today and start building connections.
            </p>
            <div className="space-y-4">
              <Link
                href="/auth/register"
                className="block bg-[#708d81] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#5a7268] transition-colors shadow-lg"
              >
                Sign Up Now - It's Free
              </Link>
              <Link
                href="/auth/login"
                className="block text-[#708d81] font-medium"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Desktop Version - Original Layout */}
      <main className="hidden lg:block container mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with Your
            <span className="text-[#708d81] block">Campus Community</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students finding events, roommates, study groups, 
            buying and selling items, and building lifelong connections at their university.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link
              href="/auth/register"
              className="block md:inline-block bg-[#708d81] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#5a7268] transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="block md:inline-block border-2 border-[#708d81] text-[#708d81] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#708d81] hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Everything You Need for Campus Life
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Campus Events"
              description="Discover parties, club meetings, study sessions, and social events happening on your campus."
              icon="🎉"
            />
            <FeatureCard
              title="Find Roommates"
              description="Connect with compatible roommates and explore housing options near your university."
              icon="🏠"
            />
            <FeatureCard
              title="Study Groups"
              description="Join study groups, find tutoring, and collaborate with classmates on projects."
              icon="📚"
            />
            <FeatureCard
              title="Buy & Sell"
              description="Trade textbooks, furniture, electronics, and other items with fellow students."
              icon="💰"
            />
            <FeatureCard
              title="Campus Services"
              description="Offer or find services like ride sharing, food delivery, and academic help."
              icon="🛠️"
            />
            <FeatureCard
              title="Safe Community"
              description="University-verified students in a secure environment built for your campus."
              icon="🔒"
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white rounded-2xl shadow-lg">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              Trusted by Students Nationwide
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard number="50+" label="Universities" />
              <StatCard number="10K+" label="Active Students" />
              <StatCard number="25K+" label="Posts Created" />
              <StatCard number="95%" label="Student Satisfaction" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Connect?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join your university's social network today and start building meaningful 
            connections with your campus community.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-[#708d81] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#5a7268] transition-colors shadow-lg"
          >
            Sign Up Now - It's Free
          </Link>
        </section>
      </main>

      {/* Footer - Desktop Only */}
      <footer className="hidden lg:block bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src={KinectLogo}
                  alt="CampusKinect"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-xl font-bold">CampusKinect</span>
              </div>
              <p className="text-gray-400">
                Connecting university students through a trusted campus social network.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Campus Events</li>
                <li>Housing & Roommates</li>
                <li>Study Groups</li>
                <li>Marketplace</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>hello@campuskinect.net</li>
                <li>@campuskinect</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CampusKinect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mobile Components
function MobileFeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

function MobileStatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-[#708d81] mb-1">{number}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

// Desktop Components
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-[#708d81] mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
