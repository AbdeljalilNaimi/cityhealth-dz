import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/BackButton';

const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let redirected = false;

    const doRedirect = () => {
      if (redirected) return;
      redirected = true;
      setIsVerified(true);
      setIsProcessing(false);
      setTimeout(() => navigate('/profile', { replace: true }), 2000);
    };

    // Listen for Supabase auth state — fires when the PKCE code or hash token
    // in the URL is processed automatically by the Supabase client.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        doRedirect();
      }
    });

    // Also check if a session already exists (token processed before this effect ran)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        doRedirect();
      } else {
        // No session yet — stop the loading spinner after a short wait
        // so the user isn't stuck on a blank screen if there's no token
        setTimeout(() => {
          if (!redirected) setIsProcessing(false);
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute top-4 left-4">
        <BackButton fallback="/citizen/login" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold">Email vérifié !</h1>
          <p className="text-muted-foreground mt-2">
            {isVerified
              ? 'Connexion réussie. Redirection vers votre tableau de bord...'
              : 'Votre email a été vérifié. Vous pouvez maintenant vous connecter.'}
          </p>
        </div>

        {!isVerified && (
          <Link to="/citizen/login">
            <Button className="w-full">Se connecter</Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerifiedPage;
