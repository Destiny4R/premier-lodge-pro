import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Globe, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { toast } from "sonner";
import { submitContactForm, ContactRequest } from "@/services/publicService";

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

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+234 800 123 4567", "+234 800 987 6543"],
    description: "24/7 Customer Support",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@premierlodge.ng", "reservations@premierlodge.ng"],
    description: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["123 Victoria Island", "Lagos, Nigeria"],
    description: "Visit our main location",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon - Sun: 24 Hours", "Reception always open"],
    description: "We never close",
  },
];

const faqItems = [
  {
    question: "What time is check-in and check-out?",
    answer: "Check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in and late check-out may be available upon request.",
  },
  {
    question: "Is parking available at the hotel?",
    answer: "Yes, we offer complimentary valet parking for all guests. Self-parking is also available in our secure underground garage.",
  },
  {
    question: "Do you offer airport transfer services?",
    answer: "Yes, we provide luxury airport transfers. Please contact our concierge at least 24 hours in advance to arrange your pickup.",
  },
  {
    question: "Are pets allowed at the hotel?",
    answer: "We welcome small pets in designated pet-friendly rooms. An additional cleaning fee may apply. Please inform us at the time of booking.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "Free cancellation is available up to 48 hours before check-in. Cancellations made within 48 hours are subject to one night's charge.",
  },
];

export default function PublicContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data: ContactRequest = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };
    
    const response = await submitContactForm(data);
    
    if (response.success) {
      toast.success('Message sent! We will get back to you soon.');
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error('Failed to send message. Please try again.');
    }
    
    setIsSubmitting(false);
  };

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
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Get In Touch</span>
            </motion.div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact <span className="text-gradient-gold">Us</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions or need assistance? Our team is here to help make your stay unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {contactInfo.map((info) => (
              <motion.div key={info.title} variants={fadeInUp}>
                <Card variant="glass" className="p-6 h-full text-center hover-lift">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-muted-foreground text-sm">{detail}</p>
                  ))}
                  <p className="text-xs text-primary mt-2">{info.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl font-bold text-foreground mb-6">Send us a Message</h2>
              <Card variant="elevated" className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" name="name" placeholder="John Doe" required className="bg-secondary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-secondary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="+234 800 000 0000" className="bg-secondary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select name="subject" required>
                        <SelectTrigger className="bg-secondary">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reservation">Reservation Inquiry</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="How can we help you?" 
                      rows={5} 
                      required 
                      className="bg-secondary" 
                    />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-6">Find Us</h2>
                <Card variant="elevated" className="overflow-hidden">
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Premier Lodge Hotel</h3>
                      <p className="text-muted-foreground">123 Victoria Island, Lagos, Nigeria</p>
                      <Button variant="outline" className="mt-4" onClick={() => window.open('https://maps.google.com', '_blank')}>
                        <Globe className="w-4 h-4 mr-2" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon" className="w-12 h-12" onClick={() => window.open('https://facebook.com', '_blank')}>
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-12 h-12" onClick={() => window.open('https://instagram.com', '_blank')}>
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-12 h-12" onClick={() => window.open('https://twitter.com', '_blank')}>
                    <Twitter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find quick answers to common questions about your stay.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto space-y-4"
          >
            {faqItems.map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card variant="elevated" className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
