/**
 * Demo Presets Configuration
 *
 * Defines the 4 temporary interactive demo business personas (Restaurant, E-Commerce, Medical, Design)
 * and the default permanent Chatio by Anza platform assistant.
 *
 * All demo modes are session-isolated and NEVER overwrite the permanent MongoDB database.
 */

export const DEMO_PRESETS = {
  restaurant: {
    id: 'restaurant',
    name: 'Bella Vista Dining AI',
    label: 'Restaurant',
    category: 'Fine Dining & Hospitality',
    tagline: 'Bella Vista Italian Restaurant · Demo Mode',
    welcomeMessage: 'Benvenuto! 🍕 I am the AI dining assistant for Bella Vista Italian Restaurant.\n\nAsk me about our handmade pastas, chef specials, wine pairings, opening hours, or table reservations!',
    systemPrompt: `You are the friendly and knowledgeable AI Assistant for "Bella Vista", an authentic Italian fine dining restaurant established in 2008. Answer questions warmly and accurately based on the Bella Vista knowledge base (menu items, prices, opening hours, dietary options, private events, reservations).`,
    fileName: 'restaurant.md',
    suggestions: [
      { label: '🍝 Pasta & Pizza Menu', prompt: 'What pasta and pizza dishes do you recommend?' },
      { label: '🍷 Wine & Dessert Pairings', prompt: 'What desserts and wines do you have?' },
      { label: '⏰ Opening Hours & Location', prompt: 'What are your opening hours and address?' },
      { label: '📅 How to Book a Table', prompt: 'How do I make a table reservation?' },
    ],
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'TechCart Support AI',
    label: 'E-Commerce',
    category: 'Consumer Electronics & Store',
    tagline: 'TechCart Electronics Store · Demo Mode',
    welcomeMessage: 'Welcome to TechCart! 🛒 I am your 24/7 shopping and customer support assistant.\n\nAsk me about our latest laptops, headphones, return & refund policies, shipping times, or warranty options!',
    systemPrompt: `You are the official customer support AI assistant for "TechCart", an online electronics store. Answer customer questions clearly and accurately regarding products, shipping methods, returns, refunds, payment options, and warranty.`,
    fileName: 'ecommerce.md',
    suggestions: [
      { label: '📦 Return & Refund Policy', prompt: 'What is your return and refund policy?' },
      { label: '🚚 Shipping Times & Costs', prompt: 'How long does shipping take and how much does it cost?' },
      { label: '💻 Best Laptops & Warranty', prompt: 'What are your top laptops and warranty terms?' },
      { label: '💳 Payment Methods Accepted', prompt: 'What payment methods do you accept?' },
    ],
  },

  doctor: {
    id: 'doctor',
    name: 'Wellness First Clinic AI',
    label: 'Medical Clinic',
    category: 'Healthcare & Appointments',
    tagline: 'Wellness First Clinic by Dr. Sarah Ahmed · Demo Mode',
    welcomeMessage: 'Welcome to Wellness First Clinic! 🏥 I am the assistant for Dr. Sarah Ahmed.\n\nAsk me about our medical services, general consultations, clinic hours, fees, or how to schedule your visit!',
    systemPrompt: `You are the polite clinic receptionist AI for "Wellness First Clinic" led by Dr. Sarah Ahmed. Answer patient questions about appointments, clinic hours, general medical services offered, consultation fees, and clinic policies. Note: remind patients that emergencies should call 911/emergency services directly.`,
    fileName: 'doctor.md',
    suggestions: [
      { label: '🩺 Book an Appointment', prompt: 'How do I book an appointment with Dr. Sarah Ahmed?' },
      { label: '🕒 Clinic Hours & Location', prompt: 'What are your clinic hours and address?' },
      { label: '💵 Consultation Fees', prompt: 'What are your consultation and treatment fees?' },
      { label: '💉 Services & Checkups', prompt: 'What health checkup packages and services do you offer?' },
    ],
  },

  designer: {
    id: 'designer',
    name: 'Pixel & Ink Studio AI',
    label: 'Design Agency',
    category: 'Creative Studio & Branding',
    tagline: 'Pixel & Ink Studio · Demo Mode',
    welcomeMessage: 'Welcome to Pixel & Ink Studio! 🎨 I am your creative project assistant.\n\nAsk me about brand identity design, custom logo packages, UI/UX for web and mobile apps, turnaround times, and pricing!',
    systemPrompt: `You are the creative studio AI representative for "Pixel & Ink Studio", a modern branding and UI/UX design agency. Answer inquiries about logo packages, UI/UX services, design process, revisions, timeline, and pricing.`,
    fileName: 'designer.md',
    suggestions: [
      { label: '🎨 Logo & Branding Pricing', prompt: 'How much does a brand identity and logo package cost?' },
      { label: '💻 UI/UX Website Design', prompt: 'What UI/UX design services do you offer for web and mobile apps?' },
      { label: '⏱️ Turnaround Time', prompt: 'What is your typical project timeline and revision policy?' },
      { label: '📁 Design Process & Deliverables', prompt: 'How does your design process work step-by-step?' },
    ],
  },
};

export const CHATIO_DEFAULT_PRESET = {
  id: 'default',
  name: 'Chatio AI Assistant',
  label: 'Chatio Platform',
  category: 'Platform Assistant',
  tagline: 'Chatio by Anza · Online RAG',
  welcomeMessage: 'Hello! I am Chatio AI assistant, built by Muhammad Anza Muneeb Khan.\n\nAsk me anything about building, customizing, and embedding your custom AI chatbot on WordPress, Shopify, Webflow, React, Next.js, or any website!',
  systemPrompt: `You are Chatio AI assistant, built by Muhammad Anza Muneeb Khan. You answer visitor questions based on the provided knowledge base. Speak warmly, clearly, and professionally about Chatio by Anza features, embedding on WordPress/Shopify/Webflow/HTML, RAG LangChain, Gemini x Groq model racing, user dashboard, and setup.`,
  suggestions: [
    { label: '🚀 WordPress & Shopify Embed', prompt: 'How do I embed my chatbot on WordPress or Shopify?' },
    { label: '🧠 Gemini × Groq Racing', prompt: 'How does Chatio dynamic AI model switching work?' },
    { label: '⚙️ Step-by-Step Setup Guide', prompt: 'How do I set up my chatbot step-by-step in the User Dashboard?' },
    { label: '⚡ 100% Free Custom Chatbot?', prompt: 'Is Chatio by Anza 100% free?' },
  ],
};
