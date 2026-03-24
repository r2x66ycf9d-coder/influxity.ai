import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from './ui/button';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  metric: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'TechStart Solutions',
    content: 'Influxity.ai transformed our customer support operations. The AI chatbot handles 80% of inquiries automatically, freeing our team to focus on complex issues. The ROI was immediate.',
    metric: 'Saved 20 hours/week',
    avatar: 'SC',
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    role: 'Operations Manager',
    company: 'GrowthCo Marketing',
    content: 'The content generator is a game-changer. We produce social media posts and marketing copy 5x faster. What used to take hours now takes minutes, and the quality is consistently excellent.',
    metric: '5x faster content creation',
    avatar: 'MR',
  },
  {
    id: 3,
    name: 'Emily Thompson',
    role: 'Sales Director',
    company: 'Apex Retail Group',
    content: 'Lead intelligence has revolutionized our sales process. The AI qualification scoring helps us prioritize high-value prospects, resulting in a 3x increase in conversion rates.',
    metric: '3x lead conversion',
    avatar: 'ET',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Founder',
    company: 'CloudSync Services',
    content: 'The smart scheduler eliminated the back-and-forth of meeting coordination. It handles timezone complexity automatically and integrates perfectly with our calendar system.',
    metric: '15 hours saved monthly',
    avatar: 'DP',
  },
  {
    id: 5,
    name: 'Lisa Martinez',
    role: 'E-commerce Manager',
    company: 'StyleHub Fashion',
    content: 'Product recommendations powered by AI increased our average order value by 45%. Customers love the personalized suggestions, and our sales have never been better.',
    metric: '45% higher AOV',
    avatar: 'LM',
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-800/40 to-purple-900/40 backdrop-blur-sm relative z-10">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by Growing Businesses
          </h2>
          <p className="text-xl text-purple-100">
            See how Influxity.ai is transforming operations for companies like yours
          </p>
        </div>

        <div className="relative bg-white/95 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Quote Icon */}
          <div className="absolute top-6 left-6 text-purple-200">
            <Quote className="w-12 h-12" />
          </div>

          {/* Testimonial Content */}
          <div className="relative z-10 mb-8">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic">
              "{currentTestimonial.content}"
            </p>

            {/* Metric Badge */}
            <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-600 text-purple-900 px-6 py-2 rounded-full font-semibold text-sm mb-6">
              {currentTestimonial.metric}
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-lg">
                {currentTestimonial.avatar}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  {currentTestimonial.name}
                </div>
                <div className="text-gray-600">
                  {currentTestimonial.role}, {currentTestimonial.company}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-purple-700 w-8'
                      : 'bg-purple-300 hover:bg-purple-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Company Logos */}
        <div className="mt-12 text-center">
          <p className="text-purple-200 text-sm mb-6">Trusted by innovative companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="text-white font-semibold text-lg px-6 py-3 bg-white/10 rounded-lg backdrop-blur-sm"
              >
                {t.company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
