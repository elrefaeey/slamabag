import { Button } from '@/components/ui/button';
import { Award, Truck, Shield, HeadphonesIcon } from 'lucide-react';

export const AboutSection = () => {
  const features = [
    {
      icon: Award,
      title: "Premium Quality",
      description: "Handcrafted with the finest materials and attention to detail"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Complimentary shipping on all orders over $200"
    },
    {
      icon: Shield,
      title: "Lifetime Warranty",
      description: "We stand behind our products with comprehensive coverage"
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Our customer service team is always here to help"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl font-bold mb-6">About MY Bag</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                For over a decade, MY Bag has been at the forefront of luxury accessories, 
                creating timeless pieces that blend sophistication with functionality. Our 
                commitment to exceptional craftsmanship and premium materials ensures that 
                every bag tells a story of elegance and durability.
              </p>
              <p>
                We believe that the perfect bag is more than just an accessory—it's a 
                companion that accompanies you through life's important moments. From 
                boardroom meetings to weekend adventures, our collections are designed 
                to elevate your style while meeting your practical needs.
              </p>
              <p>
                Each piece in our collection is meticulously crafted by skilled artisans 
                who share our passion for excellence. We source only the finest leathers 
                and hardware, ensuring that your MY Bag investment will last for years to come.
              </p>
            </div>
            <Button className="btn-gold mt-8">
              Learn More About Our Story
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden">
              <img
                src="/api/placeholder/600/600"
                alt="MY Bag craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gold text-black p-6 rounded-xl animate-float">
              <div className="text-2xl font-bold">10+</div>
              <div className="text-sm font-medium">Years of Excellence</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4 group-hover:bg-gold group-hover:text-black transition-colors duration-300">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};