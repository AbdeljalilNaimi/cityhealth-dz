import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, FileText, ShieldCheck, Building2, Stethoscope, Pill, FlaskConical, ScanLine, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { PROVIDER_TYPES } from '@/constants/providerTypes';

const content = {
  fr: {
    badge: 'Inscription Professionnelle',
    title: 'Rejoignez CityHealth en 3 étapes',
    subtitle: 'Inscrivez votre établissement gratuitement et commencez à recevoir des patients dès aujourd\'hui.',
    cta: 'Commencer l\'inscription',
    steps: [
      { title: 'Choisissez votre type', desc: 'Sélectionnez votre spécialité parmi nos catégories.' },
      { title: 'Complétez votre profil', desc: 'Ajoutez vos informations, horaires et services.' },
      { title: 'Vérification & publication', desc: 'Notre équipe valide votre profil sous 24h.' },
    ],
  },
  ar: {
    badge: 'التسجيل المهني',
    title: 'انضم إلى CityHealth في 3 خطوات',
    subtitle: 'سجّل مؤسستك مجانًا وابدأ في استقبال المرضى اليوم.',
    cta: 'ابدأ التسجيل',
    steps: [
      { title: 'اختر نوعك', desc: 'حدد تخصصك من بين فئاتنا.' },
      { title: 'أكمل ملفك', desc: 'أضف معلوماتك وساعات العمل والخدمات.' },
      { title: 'التحقق والنشر', desc: 'فريقنا يتحقق من ملفك خلال 24 ساعة.' },
    ],
  },
  en: {
    badge: 'Professional Registration',
    title: 'Join CityHealth in 3 Steps',
    subtitle: 'Register your facility for free and start receiving patients today.',
    cta: 'Start Registration',
    steps: [
      { title: 'Choose your type', desc: 'Select your specialty from our categories.' },
      { title: 'Complete your profile', desc: 'Add your info, schedule, and services.' },
      { title: 'Verification & publish', desc: 'Our team validates your profile within 24h.' },
    ],
  },
};

const stepIcons = [UserPlus, FileText, ShieldCheck];

const providerTypes = [
  { key: PROVIDER_TYPES.HOSPITAL, icon: Building2, color: 'from-red-500 to-red-600' },
  { key: PROVIDER_TYPES.CLINIC, icon: Building2, color: 'from-cyan-500 to-cyan-600' },
  { key: PROVIDER_TYPES.DOCTOR, icon: Stethoscope, color: 'from-blue-500 to-blue-600' },
  { key: PROVIDER_TYPES.PHARMACY, icon: Pill, color: 'from-emerald-500 to-emerald-600' },
  { key: PROVIDER_TYPES.LAB, icon: FlaskConical, color: 'from-purple-500 to-purple-600' },
  { key: PROVIDER_TYPES.RADIOLOGY_CENTER, icon: ScanLine, color: 'from-indigo-500 to-indigo-600' },
  { key: PROVIDER_TYPES.DENTIST, icon: Stethoscope, color: 'from-teal-500 to-teal-600' },
  { key: PROVIDER_TYPES.BLOOD_CABIN, icon: Syringe, color: 'from-rose-500 to-rose-600' },
];

const typeLabels: Record<string, Record<string, string>> = {
  hospital: { fr: 'Hôpital', ar: 'مستشفى', en: 'Hospital' },
  clinic: { fr: 'Clinique', ar: 'عيادة', en: 'Clinic' },
  doctor: { fr: 'Médecin', ar: 'طبيب', en: 'Doctor' },
  pharmacy: { fr: 'Pharmacie', ar: 'صيدلية', en: 'Pharmacy' },
  lab: { fr: 'Laboratoire', ar: 'مختبر', en: 'Laboratory' },
  radiology_center: { fr: 'Radiologie', ar: 'أشعة', en: 'Radiology' },
  dentist: { fr: 'Dentiste', ar: 'طبيب أسنان', en: 'Dentist' },
  blood_cabin: { fr: 'Cabine de sang', ar: 'كابينة دم', en: 'Blood Cabin' },
};

export const ProviderRegistrationSection = () => {
  const { language, isRTL } = useLanguage();
  const t = content[language];

  return (
    <section className={`py-16 md:py-24 px-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl hidden md:block" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-semibold">
            {t.badge}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t.subtitle}</p>
        </motion.div>

        {/* 3 Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {t.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <motion.div
                key={i}
                className="relative p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Provider type icons */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {providerTypes.map((pt) => (
            <div
              key={pt.key}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border/50 hover:border-primary/40 transition-colors"
            >
              <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${pt.color} flex items-center justify-center`}>
                <pt.icon className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-foreground">{typeLabels[pt.key]?.[language]}</span>
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
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all group"
            >
              {t.cta}
              <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} size={18} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
