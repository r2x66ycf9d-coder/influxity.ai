import { useEffect, useState } from 'react';
import { TrendingUp, Users, Zap, Star } from 'lucide-react';

interface MetricProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  duration?: number;
}

function AnimatedMetric({ icon, value, suffix, label, duration = 2000 }: MetricProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-purple-300/30 hover:border-amber-400/50 transition-all hover:scale-105">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-amber-400 flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="text-3xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-purple-200 text-center">
        {label}
      </div>
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="py-12 px-4 bg-purple-800/40 backdrop-blur-sm border-y border-purple-600/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedMetric
            icon={<Users className="w-6 h-6" />}
            value={10000}
            suffix="+"
            label="Businesses Automated"
          />
          <AnimatedMetric
            icon={<Zap className="w-6 h-6" />}
            value={500}
            suffix="K+"
            label="AI Interactions"
          />
          <AnimatedMetric
            icon={<TrendingUp className="w-6 h-6" />}
            value={98}
            suffix="%"
            label="Satisfaction Rate"
          />
          <AnimatedMetric
            icon={<Star className="w-6 h-6" />}
            value={4}
            suffix=".9"
            label="Average Rating"
          />
        </div>
      </div>
    </section>
  );
}
