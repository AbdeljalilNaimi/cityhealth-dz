import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'success' | 'error';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let redirected = false;

    const doRedirect = (path: string) => {
      if (redirected) return;
      redirected = true;
      setStatus('success');
      setTimeout(() => navigate(path, { replace: true }), 1500);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        doRedirect('/profile');
      } else if (event === 'PASSWORD_RECOVERY') {
        if (redirected) return;
        redirected = true;
        navigate('/reset-password', { replace: true });
      } else if (event === 'USER_UPDATED' && session) {
        doRedirect('/profile');
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setStatus('error');
        setErrorMsg('Ce lien est invalide ou a expiré.');
        return;
      }
      if (session) {
        doRedirect('/profile');
      }
    });

    const timeout = setTimeout(() => {
      if (!redirected) {
        setStatus('error');
        setErrorMsg('Ce lien est invalide ou a expiré. Veuillez réessayer.');
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md w-full"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto" />
            <div>
              <h1 className="text-xl font-bold">Vérification en cours...</h1>
              <p className="text-muted-foreground mt-1 text-sm">Veuillez patienter quelques secondes</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
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
              <p className="text-muted-foreground mt-1">Redirection vers votre profil...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <XCircle className="h-10 w-10 text-destructive" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">Lien invalide</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {errorMsg || 'Ce lien est invalide ou a expiré.'}
              </p>
            </div>
            <div className="space-y-3">
              <Link to="/citizen/login">
                <Button className="w-full">Se connecter</Button>
              </Link>
              <Link to="/citizen/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Créer un nouveau compte
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallbackPage;
