import { useState, useEffect } from 'react';
import { useProvider } from '@/contexts/ProviderContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen, Plus, Trash2, Loader2, Clock, CheckCircle, XCircle,
  Image as ImageIcon, FileText, Link as LinkIcon, Tag, Eye, Heart,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Ad,
  createPublication,
  getProviderPublications,
  deleteAd,
  uploadAdImage,
} from '@/services/adsService';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'médecine_générale', label: 'Médecine générale' },
  { value: 'cardiologie', label: 'Cardiologie' },
  { value: 'pédiatrie', label: 'Pédiatrie' },
  { value: 'chirurgie', label: 'Chirurgie' },
  { value: 'gynécologie', label: 'Gynécologie & Obstétrique' },
  { value: 'neurologie', label: 'Neurologie' },
  { value: 'psychiatrie', label: 'Psychiatrie' },
  { value: 'orthopédie', label: 'Orthopédie' },
  { value: 'dermatologie', label: 'Dermatologie' },
  { value: 'ophtalmologie', label: 'Ophtalmologie' },
  { value: 'ORL', label: 'ORL' },
  { value: 'endocrinologie', label: 'Endocrinologie' },
  { value: 'rhumatologie', label: 'Rhumatologie' },
  { value: 'pneumologie', label: 'Pneumologie' },
  { value: 'gastroentérologie', label: 'Gastroentérologie' },
  { value: 'urologie', label: 'Urologie' },
  { value: 'oncologie', label: 'Oncologie' },
  { value: 'urgences', label: 'Urgences & Réanimation' },
  { value: 'biologie', label: 'Biologie & Analyses' },
  { value: 'radiologie', label: 'Radiologie & Imagerie' },
  { value: 'pharmacologie', label: 'Pharmacologie' },
  { value: 'santé_publique', label: 'Santé publique' },
  { value: 'autre', label: 'Autre' },
];

interface PublicationFormData {
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  doi: string;
  image_url: string;
  pdf_url: string;
  expires_at: string;
}

const EMPTY_FORM: PublicationFormData = {
  title: '',
  short_description: '',
  full_description: '',
  category: '',
  doi: '',
  image_url: '',
  pdf_url: '',
  expires_at: '',
};

function getStatusConfig(status: string) {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: typeof Clock }> = {
    pending: { variant: 'secondary', label: 'En attente de validation', icon: Clock },
    approved: { variant: 'default', label: 'Publiée', icon: CheckCircle },
    rejected: { variant: 'destructive', label: 'Rejetée', icon: XCircle },
    suspended: { variant: 'outline', label: 'Suspendue', icon: XCircle },
  };
  return map[status] || map.pending;
}

export function ProviderPublicationsManager() {
  const { provider } = useProvider();
  const [publications, setPublications] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PublicationFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadPublications = async () => {
    if (!provider?.id) return;
    setLoading(true);
    try {
      const data = await getProviderPublications(provider.id);
      setPublications(data);
    } catch {
      toast.error('Erreur lors du chargement des publications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, [provider?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !provider?.id) return;
    setUploadingImage(true);
    try {
      const url = await uploadAdImage(file, provider.id);
      setForm(prev => ({ ...prev, image_url: url }));
      toast.success('Image téléchargée');
    } catch {
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    if (!form.title.trim() || !form.short_description.trim() || !form.full_description.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      await createPublication({
        provider_id: provider.id,
        provider_name: provider.name || 'Praticien',
        provider_avatar: provider.image || undefined,
        provider_type: provider.specialty || provider.type || undefined,
        provider_city: provider.city || undefined,
        is_verified_provider: provider.verified || false,
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        image_url: form.image_url || undefined,
        pdf_url: form.pdf_url || undefined,
        doi: form.doi || undefined,
        category: form.category || undefined,
        expires_at: form.expires_at || undefined,
      });
      toast.success('Publication soumise — elle sera visible après validation admin');
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadPublications();
    } catch (err: any) {
      if (err.message === 'PROFANITY_DETECTED') {
        toast.error('Contenu inapproprié détecté. Veuillez réviser votre texte.');
      } else {
        toast.error('Erreur lors de la soumission');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAd(id);
      toast.success('Publication supprimée');
      loadPublications();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = publications.filter(p => p.status === 'pending').length;
  const approvedCount = publications.filter(p => p.status === 'approved').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Mes Publications
              </CardTitle>
              <CardDescription>
                Partagez vos publications médicales avec la communauté CityHealth — chaque soumission est validée par notre équipe.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              data-testid="button-new-publication"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nouvelle publication
            </Button>
          </div>

          {/* Quick stats */}
          {publications.length > 0 && (
            <div className="flex gap-3 pt-1 flex-wrap">
              {approvedCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {approvedCount} publiée{approvedCount > 1 ? 's' : ''}
                </span>
              )}
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {pendingCount} en attente
                </span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Moderation info banner */}
          <Alert className="mb-5 border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-muted-foreground">
              Vos publications apparaissent sur la page publique <strong>/annonces</strong> après validation par notre équipe (sous 24 à 48 h). Vous pouvez soumettre des articles, cas cliniques, guides, ou actualités médicales.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Aucune publication</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Soumettez votre première publication médicale</p>
              <Button
                className="mt-4"
                onClick={() => setShowForm(true)}
                data-testid="button-first-publication"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Créer une publication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {publications.map((pub) => {
                const status = getStatusConfig(pub.status);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={pub.id}
                    className="flex gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                    data-testid={`publication-item-${pub.id}`}
                  >
                    {/* Thumbnail */}
                    {pub.image_url ? (
                      <img
                        src={pub.image_url}
                        alt={pub.title}
                        className="w-20 h-16 rounded-lg object-cover shrink-0 hidden sm:block"
                      />
                    ) : (
                      <div className="w-20 h-16 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 hidden sm:block">
                        <BookOpen className="h-6 w-6 text-primary/40" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm leading-snug line-clamp-1">{pub.title}</h3>
                        <Badge variant={status.variant} className="shrink-0 text-[10px] flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{pub.short_description}</p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {pub.category && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            {CATEGORIES.find(c => c.value === pub.category)?.label || pub.category}
                          </span>
                        )}
                        {pub.doi && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <LinkIcon className="h-3 w-3" />
                            DOI
                          </span>
                        )}
                        {pub.pdf_url && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            PDF
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground ml-auto">
                          {format(new Date(pub.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>

                      {/* Engagement stats (only for approved) */}
                      {pub.status === 'approved' && (
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{pub.views_count} vues</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{pub.likes_count}</span>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {pub.status === 'rejected' && pub.rejection_reason && (
                        <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                          <XCircle className="h-3 w-3 shrink-0" />
                          {pub.rejection_reason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(pub.id)}
                        disabled={deletingId === pub.id}
                        data-testid={`button-delete-publication-${pub.id}`}
                      >
                        {deletingId === pub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Publication Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setForm(EMPTY_FORM); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Soumettre une publication
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="pub-title">
                Titre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pub-title"
                placeholder="Titre de votre publication..."
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                maxLength={120}
                required
                data-testid="input-publication-title"
              />
            </div>

            {/* Short description */}
            <div className="space-y-1.5">
              <Label htmlFor="pub-short">
                Résumé court <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="pub-short"
                placeholder="Un résumé accrocheur de 1 à 2 phrases..."
                value={form.short_description}
                onChange={e => setForm(prev => ({ ...prev, short_description: e.target.value }))}
                maxLength={300}
                rows={2}
                required
                data-testid="input-publication-short"
              />
              <p className="text-xs text-muted-foreground text-right">{form.short_description.length}/300</p>
            </div>

            {/* Full description */}
            <div className="space-y-1.5">
              <Label htmlFor="pub-full">
                Contenu complet <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="pub-full"
                placeholder="Développez votre publication en détail : contexte, méthodes, résultats, conclusions..."
                value={form.full_description}
                onChange={e => setForm(prev => ({ ...prev, full_description: e.target.value }))}
                rows={7}
                required
                data-testid="input-publication-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select
                  value={form.category}
                  onValueChange={v => setForm(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger data-testid="select-publication-category">
                    <SelectValue placeholder="Choisir une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* DOI */}
              <div className="space-y-1.5">
                <Label htmlFor="pub-doi">DOI (optionnel)</Label>
                <Input
                  id="pub-doi"
                  placeholder="10.xxxx/xxxxxxx"
                  value={form.doi}
                  onChange={e => setForm(prev => ({ ...prev, doi: e.target.value }))}
                  data-testid="input-publication-doi"
                />
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-1.5">
              <Label>Image de couverture (optionnel)</Label>
              {form.image_url ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={form.image_url} alt="Aperçu" className="w-full h-36 object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                  >
                    Retirer
                  </Button>
                </div>
              ) : (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                    "border-border hover:border-primary/40 hover:bg-primary/5",
                    uploadingImage && "pointer-events-none opacity-50"
                  )}
                  data-testid="label-publication-image"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Cliquez pour ajouter une image</span>
                      <span className="text-xs text-muted-foreground/60">JPEG, PNG, WebP — max 5 Mo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>

            {/* PDF URL */}
            <div className="space-y-1.5">
              <Label htmlFor="pub-pdf">Lien PDF / Article complet (optionnel)</Label>
              <Input
                id="pub-pdf"
                placeholder="https://..."
                type="url"
                value={form.pdf_url}
                onChange={e => setForm(prev => ({ ...prev, pdf_url: e.target.value }))}
                data-testid="input-publication-pdf"
              />
            </div>

            {/* Expires at */}
            <div className="space-y-1.5">
              <Label htmlFor="pub-expires">Date d'expiration (optionnel)</Label>
              <Input
                id="pub-expires"
                type="date"
                value={form.expires_at}
                onChange={e => setForm(prev => ({ ...prev, expires_at: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                data-testid="input-publication-expires"
              />
            </div>

            {/* Moderation notice */}
            <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                Votre publication sera examinée par notre équipe et publiée sous 24 à 48 h si elle est conforme à nos règles.
              </AlertDescription>
            </Alert>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting || uploadingImage} data-testid="button-submit-publication">
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Soumission...</>
                ) : (
                  <><BookOpen className="h-4 w-4 mr-1.5" />Soumettre pour validation</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
