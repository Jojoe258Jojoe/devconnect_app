import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Users, 
  GitBranch, 
  Zap, 
  ArrowRight, 
  Star,
  Layers,
  Brain,
  Rocket,
  Mail,
  MapPin,
  Phone,
  Github,
  Twitter,
  Linkedin,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center bg-main-gradient">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')`,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="relative inline-block">
              <Code2 className="h-20 w-20 text-primary-400 mx-auto animate-float" />
              <div className="absolute -inset-4 bg-primary-400/20 rounded-full blur-xl animate-glow"></div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight">
              Dev
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Connect
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for software engineers to collaborate, share ideas, 
              create flowcharts, and generate code together.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <a href="https://youtu.be/jPRtZutVM-0?si=be04BK8dwo1dJmmT">Watch Demo</a>
                </motion.button>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/flowchart">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300"
                  >
                    Create Flowcharts
                    <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                
                <Link to="/code-generator">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Generate Code
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-primary-400/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

const FeaturesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const features = [
    {
      icon: Users,
      title: 'Collaborate & Share',
      description: 'Connect with engineers worldwide, share ideas, and get expert feedback on your projects.',
      color: 'from-blue-400 to-purple-500'
    },
    {
      icon: Layers,
      title: 'Visual Flowcharts',
      description: 'Create stunning flowcharts and blueprints to visualize your ideas and system architecture.',
      color: 'from-primary-400 to-accent-400'
    },
    {
      icon: Brain,
      title: 'AI Code Generation',
      description: 'Generate production-ready code in multiple programming languages with our AI assistant.',
      color: 'from-accent-400 to-orange-500'
    },
    {
      icon: Rocket,
      title: 'Real-time Collaboration',
      description: 'Work together in real-time with live editing, comments, and instant synchronization.',
      color: 'from-pink-400 to-red-500'
    }
  ];

  return (
    <section ref={ref} className="py-32 bg-dark-900 relative">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Powerful Features for Modern Developers
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to collaborate, create, and innovate in one powerful platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card-gradient backdrop-blur-xl p-8 rounded-2xl border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300 h-full">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Connect',
      description: 'Create your account and connect with other developers in our community.',
      image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      number: '02',
      title: 'Share Ideas',
      description: 'Post your ideas, questions, and get valuable feedback from peers.',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      number: '03',
      title: 'Create & Collaborate',
      description: 'Use our tools to create flowcharts and generate code collaboratively.',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  return (
    <section ref={ref} className="py-32 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-white mb-6">How It Works</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Get started in minutes and unlock the full potential of collaborative development.
          </p>
        </motion.div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <span className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                  <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              
              <div className="flex-1">
                <div className="relative">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { isAuthenticated } = useAuthStore();

  return (
    <section ref={ref} className="py-32 bg-gradient-to-r from-primary-900 via-dark-900 to-accent-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Development Workflow?
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of developers who are already collaborating, creating, and innovating on Devconnect.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-white text-dark-900 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all duration-300"
                >
                  Start Collaborating Now
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            ) : (
              <Link to="/flowchart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-white text-dark-900 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all duration-300"
                >
                  Start Creating
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            )}
            
            <div className="flex items-center space-x-4 text-gray-300">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-accent-400 fill-current" />
                ))}
              </div>
              <span className="text-sm">Trusted by 10,000+ developers</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                DevConnect
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The ultimate platform for software engineers to collaborate, share ideas, and create together.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Jojoe258Jojoe" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://x.com/JoeTinyefuza" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/tinyefuza-joe-274234306" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=tinyefuza-joe-274234306" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/flowchart" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Flowchart Creator
                </Link>
              </li>
              <li>
                <Link to="/code-generator" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Code Generator
                </Link>
              </li>
              <li>
                <Link to="/communities" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Communities
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/dashboard" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=tinyefuza-joe-274234306" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=tinyefuza-joe-274234306" className="text-gray-400 hover:text-primary-400 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=tinyefuza-joe-274234306" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="https://jojoeportfolio.netlify.app" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Portfolio/blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span><a href="mailto:tinyejoe7@gmail.com">tinyejoe7@gmail.com</a></span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span><a href="tel:+256757357680">+256-757-357-680</a></span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Kampala, Uganda</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2025 Devconnect. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
