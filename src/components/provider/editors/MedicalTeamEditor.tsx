import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Plus, Trash2, Save, Loader2, Pencil, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CityHealthProvider } from '@/data/providers';

// ─── Types ──────────────────────────────────────────────────────────────────

type GardeType = 'matin' | 'apres_midi' | 'nuit' | '24h' | 'custom';
type MemberStatus = 'active' | 'on_leave' | 'inactive';

export interface Garde {
  id: string;
  type: GardeType;
  label: string;
  startTime: string;
  endTime: string;
  days: number[];
}

export interface TeamMember {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  status: MemberStatus;
  gardes: Garde[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const GARDE_PRESETS: Record<GardeType, { label: string; start: string; end: string; icon: string }> = {
  matin:      { label: 'Matin',       start: '08:00', end: '14:00', icon: '🌅' },
  apres_midi: { label: 'Après-midi',  start: '14:00', end: '20:00', icon: '🌤' },
  nuit:       { label: 'Nuit',        start: '20:00', end: '08:00', icon: '🌙' },
  '24h':      { label: '24h',         start: '08:00', end: '08:00', icon: '🕐' },
  custom:     { label: 'Personnalisé', start: '',     end: '',       icon: '⚙️' },
};

const STATUS_CONFIG: Record<MemberStatus, { label: string; cls: string }> = {
  active:   { label: 'Actif',    cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  on_leave: { label: 'En congé', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  inactive: { label: 'Inactif',  cls: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' },
};

const MEDICAL_SPECIALTIES = [
  'Médecine générale', 'Cardiologie', 'Pédiatrie', 'Gynécologie-Obstétrique',
  'Chirurgie générale', 'Orthopédie', 'Neurologie', 'Psychiatrie', 'Dermatologie',
  'Ophtalmologie', 'ORL', 'Urologie', 'Gastro-entérologie', 'Endocrinologie',
  'Pneumologie', 'Rhumatologie', 'Infectiologie', 'Hématologie', 'Oncologie',
  'Anesthésie-Réanimation', 'Radiologie', 'Médecine interne', 'Urgentiste',
  'Sage-femme', 'Kinésithérapeute', 'Autre',
];

// ─── Helper factories ────────────────────────────────────────────────────────

const newMember = (): TeamMember => ({
  id: crypto.randomUUID(),
  name: '',
  specialty: 'Médecine générale',
  phone: '',
  email: '',
  status: 'active',
  gardes: [],
});

const newGarde = (): Garde => ({
  id: crypto.randomUUID(),
  type: 'matin',
  label: GARDE_PRESETS.matin.label,
  startTime: GARDE_PRESETS.matin.start,
  endTime: GARDE_PRESETS.matin.end,
  days: [1, 2, 3, 4, 5],
});

// ─── Day Toggle ──────────────────────────────────────────────────────────────

function DayToggle({ days, onChange }: { days: number[]; onChange: (d: number[]) => void }) {
  const toggle = (d: number) =>
    onChange(days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort((a, b) => a - b));
  return (
    <div className="flex gap-1 flex-wrap">
      {DAY_LABELS.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          className={cn(
            'w-9 h-9 rounded-full text-xs font-medium transition-all select-none',
            days.includes(i)
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/70',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Garde summary (used in list view) ───────────────────────────────────────

function gardeSummary(gardes: Garde[]): string {
  if (gardes.length === 0) return 'Aucune garde';
  return gardes
    .map(g => {
      const { icon, label } = GARDE_PRESETS[g.type];
      const dayStr = g.days.map(d => DAY_LABELS[d]).join(', ');
      const timeStr = g.type !== '24h' ? ` · ${g.startTime}–${g.endTime}` : '';
      return `${icon} ${label}${timeStr} (${dayStr || '—'})`;
    })
    .join('  ·  ');
}

// ─── Initials from name ───────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  provider: CityHealthProvider;
  onSave: (updates: Partial<CityHealthProvider>) => Promise<void>;
}

export function MedicalTeamEditor({ provider, onSave }: Props) {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = (provider as any).teamMembers as TeamMember[] | undefined;
    if (saved && saved.length > 0) return saved;
    const old = provider.doctorRoster;
    if (old && old.length > 0) {
      return old.map(d => ({
        id: crypto.randomUUID(),
        name: d.name,
        specialty: d.specialty,
        status: 'active' as MemberStatus,
        gardes: [],
      }));
    }
    return [];
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isExistingMember = editing ? members.some(m => m.id === editing.id) : false;

  const persist = async (updated: TeamMember[]) => {
    await onSave({
      teamMembers: updated,
      doctorRoster: updated.map(m => ({ name: m.name, specialty: m.specialty })),
    } as any);
  };

  // ── Open dialogs ────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditing(newMember());
    setDialogOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing({ ...m, gardes: m.gardes.map(g => ({ ...g, days: [...g.days] })) });
    setDialogOpen(true);
  };

  // ── Save member (add or update) ─────────────────────────────────────────────

  const handleSaveMember = async () => {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    try {
      const idx = members.findIndex(m => m.id === editing.id);
      const updated =
        idx >= 0
          ? members.map(m => (m.id === editing.id ? editing : m))
          : [...members, editing];
      setMembers(updated);
      setDialogOpen(false);
      await persist(updated);
      toast.success(isExistingMember ? 'Médecin mis à jour' : 'Médecin ajouté à l\'équipe');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete member ────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      const updated = members.filter(m => m.id !== deleteTarget.id);
      setMembers(updated);
      await persist(updated);
      toast.success('Médecin retiré de l\'équipe');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Garde helpers (for dialog) ───────────────────────────────────────────────

  const setEditingField = <K extends keyof TeamMember>(k: K, v: TeamMember[K]) =>
    setEditing(prev => prev ? { ...prev, [k]: v } : prev);

  const addGarde = () =>
    editing && setEditingField('gardes', [...editing.gardes, newGarde()]);

  const updateGardeType = (gardeId: string, type: GardeType) => {
    if (!editing) return;
    const preset = GARDE_PRESETS[type];
    setEditingField(
      'gardes',
      editing.gardes.map(g =>
        g.id === gardeId
          ? { ...g, type, label: preset.label, startTime: preset.start, endTime: preset.end }
          : g,
      ),
    );
  };

  const updateGardeField = (gardeId: string, field: keyof Garde, value: any) => {
    if (!editing) return;
    setEditingField(
      'gardes',
      editing.gardes.map(g => (g.id === gardeId ? { ...g, [field]: value } : g)),
    );
  };

  const removeGarde = (gardeId: string) =>
    editing && setEditingField('gardes', editing.gardes.filter(g => g.id !== gardeId));

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Member List ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Équipe Médicale
              </CardTitle>
              <CardDescription>
                {members.length === 0
                  ? 'Aucun médecin enregistré'
                  : `${members.length} médecin${members.length > 1 ? 's' : ''} · ${members.filter(m => m.status === 'active').length} actif${members.filter(m => m.status === 'active').length > 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <Button onClick={openAdd} className="gap-2 shrink-0" data-testid="button-add-doctor">
              <Plus className="h-4 w-4" />
              Ajouter un médecin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
              <Users className="h-14 w-14 mb-4 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">Aucun médecin dans l'équipe</p>
              <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs">
                Ajoutez vos médecins et configurez leurs gardes pour les afficher sur votre profil public.
              </p>
              <Button variant="outline" className="mt-5 gap-2" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                Ajouter le premier médecin
              </Button>
            </div>
          ) : (
            <div className="space-y-2" data-testid="list-team-members">
              {members.map(m => (
                <div
                  key={m.id}
                  className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors"
                  data-testid={`card-team-member-${m.id}`}
                >
                  <Avatar className="h-11 w-11 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" data-testid={`text-member-name-${m.id}`}>
                        {m.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs px-2 py-0.5', STATUS_CONFIG[m.status].cls)}
                        data-testid={`status-member-${m.id}`}
                      >
                        {STATUS_CONFIG[m.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{m.specialty}</p>

                    {m.gardes.length > 0 && (
                      <p className="text-xs text-muted-foreground/70 mt-1 flex items-start gap-1">
                        <Clock className="h-3 w-3 shrink-0 mt-px" />
                        <span>{gardeSummary(m.gardes)}</span>
                      </p>
                    )}

                    {(m.phone || m.email) && (
                      <div className="flex gap-4 mt-1.5">
                        {m.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />{m.phone}
                          </span>
                        )}
                        {m.email && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />{m.email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => openEdit(m)}
                      data-testid={`button-edit-member-${m.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(m)}
                      disabled={deletingId === m.id}
                      data-testid={`button-delete-member-${m.id}`}
                    >
                      {deletingId === m.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isExistingMember ? 'Modifier le médecin' : 'Ajouter un médecin'}
            </DialogTitle>
            <DialogDescription>
              {isExistingMember
                ? 'Modifiez les informations et les gardes de ce médecin.'
                : 'Renseignez les informations du médecin et configurez ses gardes.'}
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-6 py-2">

              {/* Personal info */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Informations personnelles
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="member-name">Nom complet *</Label>
                    <Input
                      id="member-name"
                      placeholder="Dr. Benali Karim"
                      value={editing.name}
                      onChange={e => setEditingField('name', e.target.value)}
                      data-testid="input-member-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="member-specialty">Spécialité *</Label>
                    <Select
                      value={editing.specialty}
                      onValueChange={v => setEditingField('specialty', v)}
                    >
                      <SelectTrigger id="member-specialty" data-testid="select-member-specialty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_SPECIALTIES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="member-phone">Téléphone</Label>
                    <Input
                      id="member-phone"
                      placeholder="05 XX XX XX XX"
                      value={editing.phone || ''}
                      onChange={e => setEditingField('phone', e.target.value)}
                      data-testid="input-member-phone"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="member-email">Email</Label>
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="dr.benali@clinique.dz"
                      value={editing.email || ''}
                      onChange={e => setEditingField('email', e.target.value)}
                      data-testid="input-member-email"
                    />
                  </div>
                </div>
              </section>

              {/* Status */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Statut
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(Object.entries(STATUS_CONFIG) as [MemberStatus, { label: string; cls: string }][]).map(
                    ([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditingField('status', key)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                          editing.status === key
                            ? cn('border-transparent', cfg.cls)
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                        data-testid={`button-status-${key}`}
                      >
                        {cfg.label}
                      </button>
                    ),
                  )}
                </div>
              </section>

              <Separator />

              {/* Gardes */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Gardes & Disponibilités
                  </p>
                  <Button
                    variant="outline" size="sm" className="h-8 gap-1.5 text-xs"
                    onClick={addGarde}
                    data-testid="button-add-garde"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une garde
                  </Button>
                </div>

                {editing.gardes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">Aucune garde définie</p>
                    <p className="text-xs opacity-70 mt-0.5">
                      Cliquez sur "Ajouter une garde" pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editing.gardes.map(g => (
                      <div
                        key={g.id}
                        className="p-4 rounded-xl border bg-muted/30 space-y-3"
                        data-testid={`card-garde-${g.id}`}
                      >
                        {/* Type + time range */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={g.type}
                            onValueChange={(v: GardeType) => updateGardeType(g.id, v)}
                          >
                            <SelectTrigger className="w-44 h-8 text-sm" data-testid={`select-garde-type-${g.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.entries(GARDE_PRESETS) as [GardeType, typeof GARDE_PRESETS[GardeType]][]).map(
                                ([key, preset]) => (
                                  <SelectItem key={key} value={key}>
                                    {preset.icon} {preset.label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>

                          {g.type !== '24h' && (
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="time"
                                value={g.startTime}
                                onChange={e => updateGardeField(g.id, 'startTime', e.target.value)}
                                className="h-8 text-sm w-[110px]"
                                data-testid={`input-garde-start-${g.id}`}
                              />
                              <span className="text-xs text-muted-foreground">→</span>
                              <Input
                                type="time"
                                value={g.endTime}
                                onChange={e => updateGardeField(g.id, 'endTime', e.target.value)}
                                className="h-8 text-sm w-[110px]"
                                data-testid={`input-garde-end-${g.id}`}
                              />
                            </div>
                          )}

                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => removeGarde(g.id)}
                            data-testid={`button-remove-garde-${g.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Day selector */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Jours de garde</p>
                          <DayToggle
                            days={g.days}
                            onChange={days => updateGardeField(g.id, 'days', days)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveMember}
              disabled={!editing?.name.trim() || saving}
              className="gap-2"
              data-testid="button-save-member"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isExistingMember ? 'Enregistrer les modifications' : 'Ajouter à l\'équipe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce médecin ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name && (
                <>
                  <strong>{deleteTarget.name}</strong> sera retiré de votre équipe médicale.
                  Cette action est réversible — vous pouvez le ré-ajouter à tout moment.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-member"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
