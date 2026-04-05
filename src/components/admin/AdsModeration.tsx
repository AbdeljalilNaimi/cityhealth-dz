import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle, XCircle, Eye, Search, Loader2, Star, Flag, Trash2, Ban,
  BookOpen, Tag, Hash, Link as LinkIcon, FileText, User, Calendar, Heart, BarChart2,
  Clock, AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/services/auditLogService';
import {
  Ad, getAllAds, adminApprove, adminReject, adminSuspend, adminToggleFeatured, deleteAd,
  getAdReports, resolveReport,
} from '@/services/adsService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { variant: 'secondary' | 'default' | 'destructive' | 'outline'; label: string; icon: typeof Clock; color: string }> = {
  pending:   { variant: 'secondary',    label: 'En attente',  icon: Clock,         color: 'text-amber-500' },
  approved:  { variant: 'default',      label: 'Approuvée',   icon: CheckCircle,   color: 'text-emerald-500' },
  rejected:  { variant: 'destructive',  label: 'Rejetée',     icon: XCircle,       color: 'text-red-500' },
  suspended: { variant: 'outline',      label: 'Suspendue',   icon: Ban,           color: 'text-orange-500' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="gap-1 text-[11px]">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

export function AdsModeration() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialogAd, setRejectDialogAd] = useState<Ad | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allAdsData, reportsData] = await Promise.all([getAllAds(), getAdReports()]);
      setAds(allAdsData.filter(a => a.type === 'publication'));
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load publications:', err);
      toast.error('Erreur lors du chargement des publications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (ad: Ad) => {
    setProcessing(ad.id);
    try {
      await adminApprove(ad.id);
      if (user) logAdminAction(user.uid, user.email || '', 'ad_approved', ad.id, 'ad', { title: ad.title }).catch(() => {});
      toast.success(`"${ad.title}" approuvée et publiée`);
      setSelectedAd(null);
      loadData();
    } catch { toast.error("Erreur lors de l'approbation"); }
    finally { setProcessing(null); }
  };

  const openRejectDialog = (ad: Ad) => {
    setRejectDialogAd(ad);
    setRejectReason('Non conforme aux règles de la plateforme');
  };

  const handleReject = async () => {
    if (!rejectDialogAd) return;
    const ad = rejectDialogAd;
    setProcessing(ad.id);
    try {
      await adminReject(ad.id, rejectReason || 'Non conforme aux règles de la plateforme');
      if (user) logAdminAction(user.uid, user.email || '', 'ad_rejected', ad.id, 'ad', { title: ad.title }).catch(() => {});
      toast.success(`"${ad.title}" rejetée`);
      setRejectDialogAd(null);
      setSelectedAd(null);
      loadData();
    } catch { toast.error('Erreur lors du rejet'); }
    finally { setProcessing(null); }
  };

  const handleSuspend = async (ad: Ad) => {
    setProcessing(ad.id);
    try {
      await adminSuspend(ad.id);
      toast.success(`"${ad.title}" suspendue`);
      setSelectedAd(null);
      loadData();
    } catch { toast.error('Erreur'); }
    finally { setProcessing(null); }
  };

  const handleDelete = async (adId: string, title: string) => {
    setProcessing(adId);
    try {
      await deleteAd(adId);
      toast.success(`"${title}" supprimée définitivement`);
      setDeleteConfirmId(null);
      setSelectedAd(null);
      loadData();
    } catch { toast.error('Erreur de suppression'); }
    finally { setProcessing(null); }
  };

  const handleToggleFeatured = async (ad: Ad) => {
    try {
      await adminToggleFeatured(ad.id, !ad.is_featured);
      toast.success(ad.is_featured ? 'Retirée des publications sponsorisées' : 'Marquée comme sponsorisée');
      loadData();
    } catch { toast.error('Erreur'); }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await resolveReport(reportId);
      toast.success('Signalement résolu');
      loadData();
    } catch { toast.error('Erreur'); }
  };

  const filteredAds = ads.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = ads.filter(a => a.status === 'pending').length;
  const approvedCount = ads.filter(a => a.status === 'approved').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* ── Main Card ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Modération des Publications
              </CardTitle>
              <CardDescription className="mt-1">
                {pendingCount > 0
                  ? `${pendingCount} publication${pendingCount > 1 ? 's' : ''} en attente de validation`
                  : `${approvedCount} publiée${approvedCount !== 1 ? 's' : ''} · ${ads.length} au total`}
                {pendingReports > 0 && ` · ${pendingReports} signalement${pendingReports !== 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-publications"
              />
            </div>
          </div>

          {/* Summary pills */}
          {ads.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = ads.filter(a => a.status === status).length;
                if (count === 0) return null;
                const Icon = cfg.icon;
                return (
                  <span key={status} className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-muted', cfg.color)}>
                    <Icon className="h-3 w-3" />
                    {count} {cfg.label.toLowerCase()}
                  </span>
                );
              })}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="pending">
            <div className="px-6 border-b">
              <TabsList className="h-10 gap-1 bg-transparent p-0">
                <TabsTrigger value="pending" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                  En attente ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                  Toutes ({ads.length})
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">
                  Signalements {pendingReports > 0 && `(${pendingReports})`}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pending" className="m-0">
              <PublicationsTable
                ads={filteredAds.filter(a => a.status === 'pending')}
                processing={processing}
                onView={setSelectedAd}
                onApprove={handleApprove}
                onReject={openRejectDialog}
                onDelete={(ad) => setDeleteConfirmId(ad.id)}
                emptyMessage="Aucune publication en attente — tout est à jour ✓"
              />
            </TabsContent>

            <TabsContent value="all" className="m-0">
              <PublicationsTable
                ads={filteredAds}
                processing={processing}
                onView={setSelectedAd}
                onApprove={handleApprove}
                onReject={openRejectDialog}
                onSuspend={handleSuspend}
                onToggleFeatured={handleToggleFeatured}
                onDelete={(ad) => setDeleteConfirmId(ad.id)}
                emptyMessage="Aucune publication soumise pour le moment"
              />
            </TabsContent>

            <TabsContent value="reports" className="m-0">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Flag className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Aucun signalement</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Publication signalée</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-sm">{r.ads?.title || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(r.created_at), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.status === 'pending' ? 'secondary' : 'outline'} className="text-[11px]">
                            {r.status === 'pending' ? 'En attente' : 'Résolu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => handleResolveReport(r.id)}>
                              Résoudre
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── Detail / Preview Dialog ── */}
      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Détail de la publication
            </DialogTitle>
            <DialogDescription>
              Examinez le contenu avant de prendre une décision de modération.
            </DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4">
              {/* Cover image */}
              {selectedAd.image_url ? (
                <img
                  src={selectedAd.image_url}
                  alt={selectedAd.title}
                  className="w-full h-44 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-24 rounded-xl bg-primary/5 border border-dashed border-primary/20 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary/30" />
                </div>
              )}

              {/* Title + status */}
              <div>
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-base flex-1">{selectedAd.title}</h3>
                  <StatusBadge status={selectedAd.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {selectedAd.provider_name}
                  {selectedAd.provider_type && ` · ${selectedAd.provider_type}`}
                  {selectedAd.provider_city && ` · ${selectedAd.provider_city}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Soumise le {format(new Date(selectedAd.created_at), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2">
                {selectedAd.category && (
                  <span className="flex items-center gap-1 text-xs bg-primary/8 text-primary rounded-full px-2.5 py-1">
                    <Tag className="h-3 w-3" />{selectedAd.category}
                  </span>
                )}
                {(selectedAd as any).keywords && (
                  <span className="flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">
                    <Hash className="h-3 w-3" />{String((selectedAd as any).keywords).split(',').slice(0, 3).map((k: string) => k.trim()).join(', ')}
                  </span>
                )}
                {(selectedAd as any).doi && (
                  <span className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full px-2.5 py-1">
                    <LinkIcon className="h-3 w-3" />DOI: {(selectedAd as any).doi}
                  </span>
                )}
                {selectedAd.pdf_url && (
                  <a
                    href={selectedAd.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full px-2.5 py-1 hover:underline"
                  >
                    <FileText className="h-3 w-3" />Voir PDF
                  </a>
                )}
              </div>

              {/* Short description */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">Résumé</p>
                <p className="text-sm">{selectedAd.short_description}</p>
              </div>

              {/* Full description */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Contenu complet</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedAd.full_description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                <span className="flex items-center gap-1"><BarChart2 className="h-3.5 w-3.5" />{selectedAd.views_count} vues</span>
                <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{selectedAd.likes_count} likes</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{selectedAd.is_featured ? 'Sponsorisée' : 'Non sponsorisée'}</span>
              </div>

              {/* Rejection reason if rejected */}
              {selectedAd.status === 'rejected' && selectedAd.rejection_reason && (
                <Alert className="border-destructive/30 bg-destructive/5">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-sm text-destructive">
                    <strong>Raison du rejet :</strong> {selectedAd.rejection_reason}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {selectedAd.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1 sm:flex-none"
                      onClick={() => handleApprove(selectedAd)}
                      disabled={processing === selectedAd.id}
                      data-testid={`button-approve-${selectedAd.id}`}
                    >
                      {processing === selectedAd.id
                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        : <CheckCircle className="h-4 w-4 mr-2" />}
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                      onClick={() => { setSelectedAd(null); openRejectDialog(selectedAd); }}
                      disabled={processing === selectedAd.id}
                      data-testid={`button-reject-${selectedAd.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </>
                )}
                {selectedAd.status === 'approved' && (
                  <Button
                    variant="outline"
                    className="text-orange-600 border-orange-200"
                    onClick={() => handleSuspend(selectedAd)}
                    disabled={processing === selectedAd.id}
                    data-testid={`button-suspend-${selectedAd.id}`}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspendre
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleToggleFeatured(selectedAd)}
                  data-testid={`button-featured-${selectedAd.id}`}
                >
                  <Star className={cn('h-4 w-4 mr-2', selectedAd.is_featured && 'fill-amber-400 text-amber-400')} />
                  {selectedAd.is_featured ? 'Retirer sponsor' : 'Sponsoriser'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive ml-auto"
                  onClick={() => { setSelectedAd(null); setDeleteConfirmId(selectedAd.id); }}
                  data-testid={`button-delete-${selectedAd.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Reject with Reason Dialog ── */}
      <Dialog open={!!rejectDialogAd} onOpenChange={() => setRejectDialogAd(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              Rejeter la publication
            </DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet — elle sera visible par le prestataire.
            </DialogDescription>
          </DialogHeader>
          {rejectDialogAd && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-sm font-medium line-clamp-1">{rejectDialogAd.title}</p>
                <p className="text-xs text-muted-foreground">{rejectDialogAd.provider_name}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reject-reason">Raison du rejet</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Ex : Contenu non conforme aux règles de la plateforme..."
                  data-testid="input-reject-reason"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectDialogAd(null)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing !== null || !rejectReason.trim()}
              data-testid="button-confirm-reject"
            >
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La publication sera définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => {
                const ad = ads.find(a => a.id === deleteConfirmId);
                if (ad) handleDelete(ad.id, ad.title);
              }}
              disabled={processing !== null}
              data-testid="button-confirm-delete"
            >
              {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PublicationsTable({
  ads,
  processing,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onToggleFeatured,
  onDelete,
  emptyMessage,
}: {
  ads: Ad[];
  processing: string | null;
  onView: (ad: Ad) => void;
  onApprove: (ad: Ad) => void;
  onReject: (ad: Ad) => void;
  onSuspend?: (ad: Ad) => void;
  onToggleFeatured?: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
  emptyMessage: string;
}) {
  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-2">
        <BookOpen className="h-10 w-10 opacity-20" />
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%]">Publication</TableHead>
            <TableHead>Prestataire</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id} className="group">
              <TableCell>
                <div className="flex items-center gap-3">
                  {ad.image_url ? (
                    <img src={ad.image_url} alt="" className="w-12 h-9 object-cover rounded-md shrink-0" />
                  ) : (
                    <div className="w-12 h-9 rounded-md bg-primary/8 flex items-center justify-center shrink-0">
                      <BookOpen className="h-3.5 w-3.5 text-primary/40" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate max-w-[180px]">{ad.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {(ad as any).category && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Tag className="h-2.5 w-2.5" />{(ad as any).category}
                        </span>
                      )}
                      {ad.pdf_url && <FileText className="h-2.5 w-2.5 text-muted-foreground/50" />}
                      {(ad as any).doi && <LinkIcon className="h-2.5 w-2.5 text-muted-foreground/50" />}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  {ad.provider_name}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(ad.created_at), 'dd MMM', { locale: fr })}
              </TableCell>
              <TableCell>
                <StatusBadge status={ad.status} />
              </TableCell>
              <TableCell className="text-right pr-4">
                <div className="flex justify-end gap-1">
                  {/* View */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onView(ad)}
                    title="Voir le détail"
                    data-testid={`button-view-${ad.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Approve (pending only) */}
                  {ad.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      onClick={() => onApprove(ad)}
                      disabled={processing === ad.id}
                      title="Approuver"
                      data-testid={`button-approve-row-${ad.id}`}
                    >
                      {processing === ad.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <CheckCircle className="h-4 w-4" />}
                    </Button>
                  )}

                  {/* Reject (pending only) */}
                  {ad.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => onReject(ad)}
                      disabled={processing === ad.id}
                      title="Rejeter"
                      data-testid={`button-reject-row-${ad.id}`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Suspend (approved only) */}
                  {ad.status === 'approved' && onSuspend && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      onClick={() => onSuspend(ad)}
                      title="Suspendre"
                      data-testid={`button-suspend-row-${ad.id}`}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Star / Featured toggle */}
                  {onToggleFeatured && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        'h-8 w-8 p-0',
                        ad.is_featured
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-muted-foreground/40 hover:text-amber-400',
                      )}
                      onClick={() => onToggleFeatured(ad)}
                      title={ad.is_featured ? 'Retirer sponsor' : 'Sponsoriser'}
                      data-testid={`button-featured-row-${ad.id}`}
                    >
                      <Star className={cn('h-4 w-4', ad.is_featured && 'fill-amber-400')} />
                    </Button>
                  )}

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(ad)}
                    title="Supprimer"
                    data-testid={`button-delete-row-${ad.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
