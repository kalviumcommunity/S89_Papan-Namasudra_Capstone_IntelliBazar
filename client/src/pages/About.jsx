import React from "react";
import { Link } from "react-router-dom";
import {
  FaRocket,
  FaUsers,
  FaShieldAlt,
  FaHeart,
  FaGlobe,
  FaAward,
  FaHandshake,
  FaLightbulb,
  FaArrowRight,
  FaQuoteLeft,
} from "react-icons/fa";
import ChatbotFloat from "../components/ChatbotFloat";

const About = () => {
  const stats = [
    { number: "10M+", label: "Happy Customers", icon: <FaUsers /> },
    { number: "50K+", label: "Products", icon: <FaRocket /> },
    { number: "99.9%", label: "Uptime", icon: <FaShieldAlt /> },
    { number: "150+", label: "Countries", icon: <FaGlobe /> },
  ];

  const values = [
    {
      icon: <FaLightbulb className="text-yellow-500" />,
      title: "Innovation",
      description: "We continuously innovate to bring you the latest products and shopping features, making your experience seamless and enjoyable."
    },
    {
      icon: <FaHeart className="text-red-500" />,
      title: "Customer First",
      description: "Every decision we make is centered around our customers. Your satisfaction and experience are our top priorities."
    },
    {
      icon: <FaShieldAlt className="text-green-500" />,
      title: "Trust & Security",
      description: "We maintain the highest standards of security and privacy to protect your data and ensure safe transactions."
    },
    {
      icon: <FaHandshake className="text-blue-500" />,
      title: "Integrity",
      description: "We believe in honest business practices, transparent pricing, and building long-term relationships with our customers."
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      description: "Visionary leader with 15+ years in e-commerce and retail innovation."
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      description: "Tech innovator specializing in platform development and scalable systems."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Design",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      description: "Creative designer focused on user experience and interface innovation."
    },
    {
      name: "David Kumar",
      role: "VP of Operations",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      description: "Operations expert ensuring seamless customer experience and logistics."
    },
  ];

  const testimonials = [
    {
      quote: "IntelliBazar has completely transformed how I shop online. The product quality is exceptional, and I've discovered so many amazing brands!",
      author: "Priya Sharma",
      role: "Fashion Enthusiast",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "The customer service is exceptional, and the platform is so intuitive. It's my go-to for all my shopping needs.",
      author: "Raj Patel",
      role: "Tech Professional",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "I love how secure and reliable IntelliBazar is. The variety of products and fast delivery make it perfect for busy professionals like me.",
      author: "Anita Desai",
      role: "Business Owner",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">About IntelliBazar</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-gray-200">
            Your ultimate destination for premium shopping experiences. We curate the finest products from around the world,
            offering unmatched quality, competitive prices, and exceptional customer service that makes every purchase memorable.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Shopping <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3 border-2 border-gray-300 text-gray-300 rounded-lg font-semibold hover:bg-gray-300 hover:text-gray-900 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl text-gray-700 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2020, IntelliBazar began with a simple yet ambitious vision: to create the world's most
                  trusted shopping destination that prioritizes quality, value, and exceptional customer experience.
                </p>
                <p>
                  Our journey started when our founders realized that customers deserved better than generic shopping
                  experiences. They wanted a platform that would carefully curate products, ensure quality standards,
                  and provide genuine value for every purchase.
                </p>
                <p>
                  Today, we're proud to serve millions of customers worldwide with our commitment to excellence. We
                  handpick every product, work directly with trusted suppliers, and maintain the highest standards
                  of quality control to ensure your complete satisfaction.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Our team working together"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">4+ Years</div>
                <div className="text-sm">of Innovation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape the way we serve our customers and community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition">
                <div className="text-4xl mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team of experts is passionate about creating exceptional shopping experiences through innovation and technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-gray-700 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 relative">
                <FaQuoteLeft className="text-gray-600 text-2xl mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Premium Shopping?</h2>
          <p className="text-xl mb-8 leading-relaxed text-gray-200">
            Join millions of satisfied customers who have discovered the perfect blend of quality, convenience, and value at IntelliBazar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Create Account <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-3 border-2 border-gray-300 text-gray-300 rounded-lg font-semibold hover:bg-gray-300 hover:text-gray-900 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Chatbot */}
      <ChatbotFloat />
    </div>
  );
};

export default About;
