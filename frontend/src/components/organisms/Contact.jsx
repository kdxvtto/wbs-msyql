import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { cn } from '@/lib/utils'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Alamat Kantor',
    details: ['Jl. Diponegoro No.22, Pokoh, Wonoboyo', 'Kec. Wonogiri, Kab. Wonogiri, Jawa Tengah 57615'],
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Phone,
    title: 'Telepon',
    details: ['(0273) 324044', '(0273) 321095'],
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['info@bankwonogiri.co.id', 'cs@bankwonogiri.co.id'],
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Clock,
    title: 'Jam Operasional',
    details: ['Senin - Jumat: 08:00 - 15:00', 'Sabtu - Minggu: Tutup'],
    color: 'bg-amber-100 text-amber-600',
  },
]

export function Contact() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation()
  const { ref: mapRef, isVisible: mapVisible } = useScrollAnimation()
  const { ref: contactRef, isVisible: contactVisible } = useScrollAnimation()

  return (
    <section id="contact" className="relative py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          ref={headerRef}
          className={cn(
            "text-center mb-12 transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Hubungi <span className="text-primary">Kami</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Kami siap membantu Anda. Hubungi kami melalui berbagai channel yang tersedia.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div 
          ref={cardsRef}
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-700",
            cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {contactInfo.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-3">{item.title}</h3>
              {item.details.map((detail, idx) => (
                <p key={idx} className="text-muted-foreground text-sm">{detail}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Map & Quick Contact Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Map */}
          <div
            ref={mapRef}
            className={cn(
              "transition-all duration-700",
              mapVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            )}
          >
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <MapPin className="w-7 h-7 text-primary" />
              Lokasi Kantor
            </h3>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31622.24914165429!2d110.89617737431638!3d-7.812976999999975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a2e4c22a8362b%3A0x361c94515c79261a!2sPT%20BPR%20BANK%20WONOGIRI%20(Perseroda)!5e0!3m2!1sid!2sid!4v1767059759233!5m2!1sid!2sid" 
                width="100%" 
                height="350" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi PT BPR Bank Wonogiri"
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Contact */}
          <div
            ref={contactRef}
            className={cn(
              "transition-all duration-700",
              contactVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}
          >
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <MessageCircle className="w-7 h-7 text-primary" />
              Hubungi Langsung
            </h3>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Untuk pertanyaan atau informasi lebih lanjut, silakan hubungi customer service kami melalui channel berikut:
              </p>
              
              <div className="space-y-4">
                <a
                  href="tel:0273324044"
                  className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Telepon</p>
                    <p className="text-primary font-medium">(0273) 324044</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                >
                  <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <p className="text-green-600 font-medium">Chat dengan CS</p>
                  </div>
                </a>

                <a
                  href="mailto:info@bankwonogiri.co.id"
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-blue-600 font-medium">info@bankwonogiri.co.id</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
