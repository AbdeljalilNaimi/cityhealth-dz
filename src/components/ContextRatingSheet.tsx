import { useState, useEffect, useRef } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRating, type RatingActionType } from '@/contexts/RatingContext';
import { useSubmitPlatformRating } from '@/hooks/usePlatformRatings';
import { toast } from 'sonner';

const AUTO_DISMISS_MS = 9000;

function actionLabel(type: RatingActionType): string {
  switch (type) {
    case 'appointment': return 'votre rendez-vous';
    case 'call':        return 'votre appel';
    case 'route':       return 'votre itinéraire';
  }
}

export function ContextRatingSheet() {
  const { trigger, isVisible, dismissRating } = useRating();
  const submitMutation = useSubmitPlatformRating();

  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    setHovered(0);
    setSelected(0);
    setFeedback('');
    setSubmitted(false);
    setFeedbackVisible(false);

    timerRef.current = setTimeout(() => {
      dismissRating();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, dismissRating]);

  const handleStarClick = (star: number) => {
    if (submitted || !trigger) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setSelected(star);

    if (star <= 3) {
      setFeedbackVisible(true);
    } else {
      submitRating(star, '');
    }
  };

  const submitRating = (star: number, fb: string) => {
    if (!trigger) return;
    submitMutation.mutate(
      {
        rating: star,
        feedback: fb || undefined,
        actionType: trigger.actionType,
        providerId: trigger.providerId,
        sessionId: trigger.sessionKey,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success('Merci pour votre évaluation !');
          setTimeout(() => dismissRating(), 1800);
        },
        onError: () => {
          toast.error("Erreur lors de l'enregistrement");
          dismissRating();
        },
      }
    );
  };

  const handleFeedbackSubmit = () => {
    submitRating(selected, feedback);
  };

  if (!trigger) return null;

  const displayStars = hovered || selected;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="rating-sheet"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4"
          role="dialog"
          aria-label="Évaluation"
        >
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/20 p-5 relative">
            <button
              onClick={dismissRating}
              aria-label="Fermer"
              data-testid="btn-dismiss-rating"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2 py-2"
              >
                <div className="text-3xl">🎉</div>
                <p className="text-sm font-medium text-center text-foreground">
                  Merci pour votre retour !
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground">
                    Comment s'est passé {actionLabel(trigger.actionType)} ?
                  </p>
                  {trigger.providerName && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {trigger.providerName}
                    </p>
                  )}
                </div>

                <div
                  className="flex gap-1.5 justify-center mb-3"
                  onMouseLeave={() => setHovered(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHovered(star)}
                      disabled={submitMutation.isPending}
                      data-testid={`btn-star-${star}`}
                      aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                      className="transition-transform hover:scale-110 focus:outline-none focus:scale-110"
                    >
                      <Star
                        className={`h-9 w-9 transition-colors duration-150 ${
                          star <= displayStars
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {feedbackVisible && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Que pouvons-nous améliorer ?</span>
                        </div>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Votre commentaire (optionnel)..."
                          rows={2}
                          className="text-sm resize-none"
                          data-testid="input-rating-feedback"
                        />
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={handleFeedbackSubmit}
                          disabled={submitMutation.isPending}
                          data-testid="btn-submit-rating"
                        >
                          {submitMutation.isPending ? 'Envoi...' : 'Envoyer'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!feedbackVisible && (
                  <p className="text-[11px] text-muted-foreground text-center mt-1">
                    Un clic suffit — votre note est enregistrée instantanément
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
