import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, FileText, ShieldCheck, Building2, Stethoscope, Pill, FlaskConical, ScanLine, Syringe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { PROVIDER_TYPES } from '@/constants/providerTypes';

const content = {
  fr: {
    badge: 'Inscription Professionnelle',
    title: 'Rejoignez CityHealth',
    titleAccent: 'en 3 étapes',
    subtitle: 'Inscrivez votre établissement gratuitement et commencez à recevoir des patients dès aujourd\'hui.',
    cta: 'Commencer l\'inscription',
    ctaSub: 'Gratuit • Aucun engagement',
    steps: [
      { title: 'Choisissez votre type', desc: 'Sélectionnez votre spécialité parmi nos catégories.' },
      { title: 'Complétez votre profil', desc: 'Ajoutez vos informations, horaires et services.' },
      { title: 'Vérification & publication', desc: 'Notre équipe valide votre profil sous 24h.' },
    ],
  },
  ar: {
    badge: 'التسجيل المهني',
    title: 'انضم إلى CityHealth',
    titleAccent: 'في 3 خطوات',
    subtitle: 'سجّل مؤسستك مجانًا وابدأ في استقبال المرضى اليوم.',
    cta: 'ابدأ التسجيل',
    ctaSub: 'مجاني • بدون التزام',
    steps: [
      { title: 'اختر نوعك', desc: 'حدد تخصصك من بين فئاتنا.' },
      { title: 'أكمل ملفك', desc: 'أضف معلوماتك وساعات العمل والخدمات.' },
      { title: 'التحقق والنشر', desc: 'فريقنا يتحقق من ملفك خلال 24 ساعة.' },
    ],
  },
  en: {
    badge: 'Professional Registration',
    title: 'Join CityHealth',
    titleAccent: 'in 3 Steps',
    subtitle: 'Register your facility for free and start receiving patients today.',
    cta: 'Start Registration',
    ctaSub: 'Free • No commitment',
    steps: [
      { title: 'Choose your type', desc: 'Select your specialty from our categories.' },
      { title: 'Complete your profile', desc: 'Add your info, schedule, and services.' },
      { title: 'Verification & publish', desc: 'Our team validates your profile within 24h.' },
    ],
  },
};

const stepIcons = [UserPlus, FileText, ShieldCheck];

const providerTypes = [
  { key: PROVIDER_TYPES.HOSPITAL, icon: Building2, label: { fr: 'Hôpital', ar: 'مستشفى', en: 'Hospital' } },
  { key: PROVIDER_TYPES.CLINIC, icon: Building2, label: { fr: 'Clinique', ar: 'عيادة', en: 'Clinic' } },
  { key: PROVIDER_TYPES.DOCTOR, icon: Stethoscope, label: { fr: 'Médecin', ar: 'طبيب', en: 'Doctor' } },
  { key: PROVIDER_TYPES.PHARMACY, icon: Pill, label: { fr: 'Pharmacie', ar: 'صيدلية', en: 'Pharmacy' } },
  { key: PROVIDER_TYPES.LAB, icon: FlaskConical, label: { fr: 'Laboratoire', ar: 'مختبر', en: 'Laboratory' } },
  { key: PROVIDER_TYPES.RADIOLOGY_CENTER, icon: ScanLine, label: { fr: 'Radiologie', ar: 'أشعة', en: 'Radiology' } },
  { key: PROVIDER_TYPES.DENTIST, icon: Stethoscope, label: { fr: 'Dentiste', ar: 'طبيب أسنان', en: 'Dentist' } },
  { key: PROVIDER_TYPES.BLOOD_CABIN, icon: Syringe, label: { fr: 'Cabine de sang', ar: 'كابينة دم', en: 'Blood Cabin' } },
];

export const ProviderRegistrationSection = () => {
  const { language, isRTL } = useLanguage();
  const t = content[language];

  return (
    <section className={`py-20 md:py-28 px-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Subtle background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
            <Sparkles className="h-3 w-3" />
            {t.badge}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {t.title}{' '}
            <span className="text-primary">{t.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">{t.subtitle}</p>
        </motion.div>

        {/* Steps — horizontal timeline style */}
        <div className="grid md:grid-cols-3 gap-0 mb-16 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-px bg-border" />

          {t.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <motion.div
                key={i}
                className="relative flex flex-col items-center text-center px-6 py-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                {/* Step number circle */}
                <div className="relative z-10 h-16 w-16 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center mb-5 shadow-sm">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1.5 text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Provider types — compact pill grid */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {providerTypes.map((pt) => (
            <div
              key={pt.key}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border/60 hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200 cursor-default"
            >
              <pt.icon className="h-3.5 w-3.5 text-primary/70" />
              <span className="text-xs font-medium text-foreground/80">{pt.label[language]}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link to="/provider/register">
            <Button
              size="lg"
              className="h-13 px-8 text-base rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              {t.cta}
              <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} size={18} />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">{t.ctaSub}</p>
        </motion.div>
      </div>
    </section>
  );
};
