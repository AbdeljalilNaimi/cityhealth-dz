import { Link } from 'react-router-dom';
import { 
  Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin,
  Stethoscope, Globe, ShieldCheck, Droplets, BookOpen, Search, Map,
  Siren, Bot, User, UserPlus, ClipboardCheck, ArrowRight, Smartphone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { AIHealthAssistant } from '@/components/AIHealthAssistant';
import { Logo } from '@/components/ui/Logo';

const Footer = () => {
  const { language, setLanguage, isRTL, t } = useLanguage();

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/cityhealth', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/cityhealth', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/cityhealth', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/cityhealth', label: 'LinkedIn' }
  ];

  const languages = [
    { code: 'fr', name: 'FR', flag: '🇫🇷' },
    { code: 'ar', name: 'عربي', flag: '🇩🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' }
  ];

  const servicesLinks = [
    { label: t('footer', 'searchDoctors'), href: '/search', icon: Search },
    { label: t('footer', 'interactiveMap'), href: '/map/providers', icon: Map },
    { label: t('footer', 'emergency247'), href: '/map/emergency', icon: Siren },
    { label: t('footer', 'aiAssistant'), href: '/medical-assistant', icon: Bot },
    { label: t('footer', 'bloodDonation'), href: '/blood-donation', icon: Droplets },
  ];

  const professionalsLinks = [
    { label: t('footer', 'becomePartner'), href: '/provider/register', icon: UserPlus },
    { label: t('footer', 'practitionerRegistration'), href: '/provider/register', icon: ClipboardCheck },
    { label: language === 'ar' ? 'الأسعار' : language === 'en' ? 'Pricing' : 'Tarifs', href: '/#pricing', icon: Heart },
    { label: t('footer', 'documentation'), href: '/docs', icon: BookOpen },
    { label: t('footer', 'verificationCharter'), href: '/how', icon: ShieldCheck },
  ];

  const legalLinks = [
    { label: t('footer', 'faq'), href: '/faq' },
    { label: t('footer', 'privacy'), href: '/privacy' },
    { label: t('footer', 'terms'), href: '/terms' },
    { label: t('footer', 'contact'), href: '/contact' },
  ];

  return (
    <footer className={`bg-muted/20 border-t border-border/40 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          
          {/* Column 1: Brand + Contact */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Logo size="md" showText={true} showOnlineIndicator={true} />
            </div>
            
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {t('footer', 'platformDescription')}
            </p>

            <div className="space-y-2 text-sm mb-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary/70" />
                <span>{t('homepage', 'locationBadge')}</span>
              </div>
              <a href="tel:+21348000000" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary/70" />
                <span dir="ltr">+213 48 XX XX XX</span>
              </a>
              <a href="mailto:contact@cityhealth.dz" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary/70" />
                <span>contact@cityhealth.dz</span>
              </a>
            </div>

            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-all duration-200" aria-label={social.label}>
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'services')}
            </h4>
            <ul className="space-y-2.5">
              {servicesLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <link.icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Professionals */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'professionals')}
            </h4>
            <ul className="space-y-2.5">
              {professionalsLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <link.icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Login */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'login')}
            </h4>
            <div className="space-y-3">
              <Link to="/citizen/login" className="group block p-3 rounded-xl bg-accent/5 hover:bg-accent/10 border border-border/50 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{t('footer', 'citizenSpace')}</p>
                    <p className="text-xs text-muted-foreground truncate">{t('footer', 'patientsIndividuals')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary rtl-flip transition-all" />
                </div>
              </Link>
              
              <Link to="/provider/login" className="group block p-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Stethoscope className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{t('footer', 'practitionerSpace')}</p>
                    <p className="text-xs text-muted-foreground truncate">{t('footer', 'doctorsEstablishments')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary rtl-flip transition-all" />
                </div>
              </Link>

              <div className="pt-2 border-t border-border/30">
                <Link to="/citizen/register" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  {t('footer', 'createCitizenAccount')}
                  <ArrowRight className="h-3 w-3 rtl-flip" />
                </Link>
              </div>
            </div>
          </div>

          {/* Column 5: Legal + Language + Extension */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'legal')}
            </h4>
            <ul className="space-y-2.5 mb-5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Browser Extension CTA */}
            <a
              href="https://drive.google.com/file/d/1TzuMuHPs8EsYVSXA03Olya1h8RX31PWm/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 rounded-xl bg-accent/5 hover:bg-accent/10 border border-border/50 hover:border-primary/30 transition-all duration-200 mb-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {language === 'ar' ? 'إضافة المتصفح' : language === 'en' ? 'Browser Extension' : 'Extension Navigateur'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {language === 'ar' ? 'تحميل مجاني' : language === 'en' ? 'Free download' : 'Télécharger gratuitement'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary rtl-flip transition-all" />
              </div>
            </a>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {t('footer', 'language')}
                </span>
              </div>
              <div className="flex gap-1.5">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage(lang.code as 'fr' | 'ar' | 'en')}
                    className={`h-8 px-2.5 text-xs ${
                      language === lang.code 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary/10 border-border/50'
                    }`}
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Download App Section */}
        <div className="mt-10 pt-8 border-t border-border/30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50">
              <div className="flex-shrink-0 p-3 bg-background rounded-xl shadow-sm border border-border/30">
                <QRCodeSVG 
                  value="https://play.google.com/store/apps/details?id=com.cityhealth.app"
                  size={80} level="M" includeMargin={false}
                  fgColor="hsl(var(--foreground))" bgColor="transparent"
                />
              </div>
              
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">{t('footer', 'downloadApp')}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3 max-w-xs">{t('footer', 'downloadAppDesc')}</p>
                
                <a href="https://play.google.com/store/apps/details?id=com.cityhealth.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity group">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] opacity-80 leading-none">{t('footer', 'downloadOn')}</div>
                    <div className="text-sm font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <Heart className="h-5 w-5 text-destructive animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="font-medium text-destructive text-sm">{t('footer', 'emergencyLabel')}</span>
                <span className="text-2xl font-bold text-destructive">15</span>
                <span className="text-xs text-destructive/70">24h/24</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} CityHealth. {t('footer', 'allRightsReserved')}</span>
            <div className="flex items-center gap-1.5">
              <span>{t('footer', 'madeWith')}</span>
              <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
              <span>{t('footer', 'inAlgeria')}</span>
              <span>🇩🇿</span>
            </div>
          </div>
        </div>
      </div>
      
      <AIHealthAssistant />
    </footer>
  );
};

export default Footer;
