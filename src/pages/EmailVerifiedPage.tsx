import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

  useEffect(() => {
    if (isAuthenticated && profile?.userType === 'citizen') {
      const timer = setTimeout(() => navigate('/profile', { replace: true }), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </motion.div>
        <h1 className="text-2xl font-bold">Email vérifié !</h1>
        <p className="text-muted-foreground">
          {isAuthenticated ? 'Redirection vers votre tableau de bord...' : 'Votre email a été vérifié. Vous pouvez maintenant vous connecter.'}
        </p>
        {!isAuthenticated && (
          <Link to="/citizen/login">
            <Button className="w-full">Se connecter</Button>
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerifiedPage;
