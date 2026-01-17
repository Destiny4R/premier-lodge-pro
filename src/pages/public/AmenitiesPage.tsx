import { motion } from "framer-motion";
import { Wifi, Car, Coffee, Dumbbell, Waves, Utensils, Sparkles, Shirt, Calendar, Shield, Clock, MapPin, Phone, ConciergeBell, Tv, Bath, Wine, Music, Heart, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const amenityCategories = [
  {
    title: "Room Amenities",
    description: "Every room is equipped with premium features for your comfort",
    items: [
      { icon: Wifi, label: "High-Speed WiFi", description: "Complimentary fiber-optic internet access in all rooms and public areas" },
      { icon: Tv, label: "Smart TV", description: "55-inch LED Smart TV with streaming services and cable channels" },
      { icon: Bath, label: "Luxury Bathroom", description: "Marble bathroom with rain shower, premium toiletries, and heated floors" },
      { icon: Coffee, label: "Mini Bar & Coffee", description: "Fully stocked mini bar and Nespresso coffee machine" },
      { icon: Shield, label: "In-Room Safe", description: "Electronic safe large enough for laptops and valuables" },
      { icon: Clock, label: "24/7 Room Service", description: "Round-the-clock dining delivered to your room" },
    ],
  },
  {
    title: "Wellness & Recreation",
    description: "Rejuvenate your body and mind with our world-class facilities",
    items: [
      { icon: Dumbbell, label: "Fitness Center", description: "State-of-the-art gym with personal trainers available" },
      { icon: Waves, label: "Swimming Pool", description: "Olympic-sized heated pool with poolside bar service" },
      { icon: Heart, label: "Spa & Wellness", description: "Full-service spa offering massages, facials, and body treatments" },
      { icon: Sun, label: "Rooftop Terrace", description: "Stunning views with comfortable lounge areas and bar" },
    ],
  },
  {
    title: "Dining & Entertainment",
    description: "Exquisite culinary experiences and entertainment options",
    items: [
      { icon: Utensils, label: "Fine Dining", description: "Award-winning restaurant featuring international and local cuisine" },
      { icon: Wine, label: "Wine & Cocktail Bar", description: "Extensive wine collection and craft cocktails by expert mixologists" },
      { icon: Music, label: "Live Entertainment", description: "Live music and cultural performances on select evenings" },
      { icon: Coffee, label: "Café & Lounge", description: "Artisan coffee, pastries, and light bites in a relaxed setting" },
    ],
  },
  {
    title: "Business & Services",
    description: "Everything you need for a productive and convenient stay",
    items: [
      { icon: Calendar, label: "Event Spaces", description: "Versatile meeting rooms and ballrooms for any occasion" },
      { icon: ConciergeBell, label: "Concierge Service", description: "Expert staff to assist with reservations, tours, and special requests" },
      { icon: Car, label: "Valet Parking", description: "Secure parking with 24-hour valet service" },
      { icon: Shirt, label: "Laundry Service", description: "Same-day laundry, dry cleaning, and pressing services" },
      { icon: MapPin, label: "Airport Transfer", description: "Luxury vehicle transfers to and from the airport" },
      { icon: Phone, label: "24/7 Reception", description: "Round-the-clock front desk and guest services" },
    ],
  },
];

export default function PublicAmenitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">World-Class Facilities</span>
            </motion.div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Hotel <span className="text-gradient-gold">Amenities</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Experience luxury at every turn with our comprehensive range of amenities designed to make your stay unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Amenities Sections */}
      {amenityCategories.map((category, categoryIndex) => (
        <section 
          key={category.title} 
          className={`py-16 ${categoryIndex % 2 === 0 ? 'bg-background' : 'bg-card'}`}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mb-12"
            >
              <motion.h2 
                variants={fadeInUp} 
                className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4"
              >
                {category.title}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl">
                {category.description}
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {category.items.map((amenity) => (
                <motion.div key={amenity.label} variants={fadeInUp}>
                  <Card variant="glass" className="p-6 h-full hover-lift group">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <amenity.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{amenity.label}</h3>
                        <p className="text-sm text-muted-foreground">{amenity.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Experience All Our Amenities
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book your stay today and enjoy access to all our world-class facilities and services.
            </p>
            <a href="/rooms">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8">
                <Sparkles className="w-4 h-4 mr-2" />
                View Our Rooms
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
