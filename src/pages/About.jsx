import SEO from "../components/SEO";

const About = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://keralayard.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Us",
        "item": "https://keralayard.com/about"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-warm pb-20">
      <SEO
        title="About Us - The Kerala Yard Story"
        description="Kerala Yard is your direct bridge to authentic Kerala flavors in Ahmedabad. Sourced directly from Kerala, delivered to your doorstep."
        keywords="about Kerala Yard, authentic Kerala groceries Ahmedabad, Kerala products story"
        jsonLd={breadcrumbSchema}
      />

      {/* Hero */}
      <div className="bg-[#1B6B3A] text-white py-16 px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-2">Our Story</p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">About Kerala Yard</h1>
        <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Your direct bridge to the rich flavors, time-honored traditions, and authentic essence of God's Own Country - right here in Ahmedabad.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-14">

        {/* Our Roots */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#1B6B3A]">Our Roots</h2>
          <div className="w-10 h-1 bg-[#1B6B3A] rounded-full" />
          <p className="text-gray-600 leading-relaxed">
            Launched on <span className="font-semibold text-gray-800">June 1, 2026</span>, Kerala Yard was born out of a simple, heartfelt passion: to eliminate the distance between Kerala's pristine, sun-drenched plantations and your home.
          </p>
          <p className="text-gray-600 leading-relaxed">
            For anyone living away from Kerala, we know how difficult it is to find genuine, unadulterated regional staples. The unique aroma of pure coconut oil, the distinct crunch of locally made snacks, and the comforting taste of authentic matta rice are hard to replicate. We realized that people shouldn't have to wait for a trip back home or rely on care packages from relatives to enjoy the foods they love.
          </p>
          <p className="text-gray-600 leading-relaxed">
            That is why we started Kerala Yard. We handle the sourcing, the quality checks, and the logistics ourselves - ensuring a seamless, hassle-free door-to-door delivery across Ahmedabad.
          </p>
        </section>

        {/* Our Promise */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1B6B3A]">Our Promise: Purely Kerala, Straight to Your Door</h2>
            <div className="w-10 h-1 bg-[#1B6B3A] rounded-full" />
            <p className="text-gray-600 leading-relaxed">
              We don't do compromises. Everything in our inventory is carefully handpicked and sourced directly from Kerala to preserve the true richness, taste, and therapeutic value of regional favorites.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Traditional Snacks",
                desc: "Authentic, golden banana chips sliced thin, fried in 100% pure coconut oil, and classic local treats made the traditional way.",
              },
              {
                title: "Daily Essentials",
                desc: "Nutrient-rich matta rice, premium breakfast powders (like Puttu and Idiyappam podi), and wholesome staples that form the backbone of a true Kerala kitchen.",
              },
              {
                title: "The Spice Route",
                desc: "Pure, unadulterated spices and aromatic oils that bring the legendary flavor profiles of the Western Ghats straight to your cooking pot.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
                <div className="w-2 flex-shrink-0 rounded-full bg-[#1B6B3A] self-stretch" />
                <div>
                  <p className="font-bold text-gray-800 mb-1">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1B6B3A]">Why Choose Kerala Yard?</h2>
            <div className="w-10 h-1 bg-[#1B6B3A] rounded-full" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                heading: "100% Authenticity",
                body: "We source exclusively from local farmers and trusted, iconic brand makers within Kerala. If it isn't genuinely from the region, it doesn't make it to our yard.",
              },
              {
                heading: "Zero Shortcuts",
                body: "No artificial fillers, cheap blends, or unexpected substitutes - just pure, uncompromised quality.",
              },
              {
                heading: "Doorstep Convenience",
                body: "No more hunting through specialty markets. We bring the best of Kerala directly to your doorstep, anywhere in Ahmedabad, with just a few clicks.",
              },
            ].map(({ heading, body }) => (
              <div key={heading} className="bg-[#1B6B3A]/5 border border-[#1B6B3A]/15 rounded-2xl p-5 space-y-2">
                <p className="font-bold text-[#1B6B3A]">{heading}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="bg-[#1B6B3A] text-white rounded-3xl p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Bridging Cultures, One Delivery at a Time</h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-lg mx-auto">
            You don't have to be Malayali to taste the rich, traditional flavors of Kerala. Whether it's a nostalgic craving or a brand-new culinary exploration, Kerala Yard is here for you - delivering warmth and culture straight to your home.
          </p>
          <p className="text-white/70 text-sm font-medium pt-2">
            Thank you for letting us share our journey with you. Welcome to the family!
          </p>
        </section>

      </div>
    </div>
  );
};

export default About;
