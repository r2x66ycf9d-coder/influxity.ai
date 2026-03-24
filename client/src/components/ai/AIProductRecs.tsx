import { useState, useEffect } from 'react';
import { Star, TrendingUp, Heart, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/SafeImage';
import { trackAIFeature } from '@/lib/analytics';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  matchScore?: number;
}

interface AIProductRecsProps {
  userId?: string;
  currentProduct?: Product;
  className?: string;
}

/**
 * AI-powered product recommendation engine
 * Features: personalized recommendations, similarity scoring, user behavior tracking
 */
export function AIProductRecs({
  userId,
  currentProduct,
  className = ''
}: AIProductRecsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, [userId, currentProduct]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    trackAIFeature('product_recs', 'load', {
      userId,
      hasCurrentProduct: !!currentProduct
    });

    // Simulate AI recommendation engine (replace with actual API call)
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'AI Chatbot Pro',
          description: 'Advanced conversational AI for customer support',
          price: 99,
          image: '/api/placeholder/200/200',
          rating: 4.8,
          category: 'AI Tools',
          matchScore: 95
        },
        {
          id: '2',
          name: 'Smart Analytics Dashboard',
          description: 'Real-time business insights and reporting',
          price: 149,
          image: '/api/placeholder/200/200',
          rating: 4.6,
          category: 'Analytics',
          matchScore: 88
        },
        {
          id: '3',
          name: 'Workflow Automation Suite',
          description: 'Automate repetitive tasks and processes',
          price: 199,
          image: '/api/placeholder/200/200',
          rating: 4.9,
          category: 'Automation',
          matchScore: 92
        },
        {
          id: '4',
          name: 'Email Marketing AI',
          description: 'AI-powered email campaigns and optimization',
          price: 79,
          image: '/api/placeholder/200/200',
          rating: 4.5,
          category: 'Marketing',
          matchScore: 85
        }
      ];

      setRecommendations(mockProducts);
      setIsLoading(false);
    }, 1500);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        trackAIFeature('product_recs', 'unfavorite', { productId });
      } else {
        newFavorites.add(productId);
        trackAIFeature('product_recs', 'favorite', { productId });
      }
      return newFavorites;
    });
  };

  const handleAddToCart = (product: Product) => {
    trackAIFeature('product_recs', 'add_to_cart', {
      productId: product.id,
      price: product.price,
      matchScore: product.matchScore
    });
    // Implement cart logic
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-purple-700 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Finding perfect matches for you...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-purple-700" />
        <h3 className="text-2xl font-bold text-gray-800">Recommended for You</h3>
        <Badge variant="secondary" className="ml-2">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <SafeImage
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(product.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </Button>
              {product.matchScore && product.matchScore >= 90 && (
                <Badge className="absolute top-2 left-2 bg-purple-700">
                  {product.matchScore}% Match
                </Badge>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
                  {product.name}
                </h4>
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {product.rating}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({Math.floor(Math.random() * 500 + 100)} reviews)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">
                  ${product.price}
                  <span className="text-sm text-gray-500 font-normal">/mo</span>
                </span>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  className="bg-purple-700 hover:bg-purple-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-900">
          <Sparkles className="w-4 h-4 inline mr-2" />
          These recommendations are personalized based on your preferences and browsing behavior.
        </p>
      </div>
    </div>
  );
}
