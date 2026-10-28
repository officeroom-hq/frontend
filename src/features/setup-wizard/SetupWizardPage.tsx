import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { api, type PlanDepartment, type SetupInput, type WorkspacePlan } from '../../api';
import { AppLayout } from '../../layouts/AppLayout';
import { AIInsightCard, Button, Card, EmptyState, FormAlert, Input, LoadingState, ErrorState, PageHeader, Select, Textarea } from '../../components/ui';
import { requiredText } from '../../lib/validation';

type Size = SetupInput['business']['size'];

const STEPS = ['Business basics', 'Team and departments', 'Goals', 'Review plan'] as const;
const SECTORS = ['Food manufacturing', 'Retail', 'Logistics', 'Professional services', 'Fintech', 'Healthcare', 'Construction', 'Other'];
const CITIES: { city: string; state: string }[] = [
  { city: 'Lagos', state: 'Lagos' },
  { city: 'Abuja', state: 'FCT' },
  { city: 'Port Harcourt', state: 'Rivers' },
  { city: 'Ibadan', state: 'Oyo' },
  { city: 'Kano', state: 'Kano' },
];
const SIZES: { value: Size; label: string }[] = [
  { value: '1-10', label: '1 to 10 people' },
  { value: '11-50', label: '11 to 50 people' },
  { value: '51-200', label: '51 to 200 people' },
  { value: '200+', label: 'More than 200' },
];
const DEPARTMENT_OPTIONS = ['Finance', 'Human Resources', 'Operations', 'Sales', 'Marketing', 'Procurement', 'Customer Support'];
const GOAL_OPTIONS = ['Close the month faster', 'Keep payroll on schedule', 'Grow distributor sales', 'Cut stock wastage', 'Organise staff documents', 'Improve customer response time'];

interface Draft {
  name: string;
  sector: string;
  city: string;
  size: Size;
  teamSize: string;
  departments: string[];
  goals: string[];
}

const INITIAL: Draft = { name: 'Adeola Spices & Foods Ltd', sector: SECTORS[0], city: 'Lagos', size: '51-200', teamSize: '24', departments: ['Finance', 'Operations'], goals: [] };

type PlanState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; plan: WorkspacePlan };

function toInput(d: Draft): SetupInput {
  const loc = CITIES.find((c) => c.city === d.city) ?? CITIES[0];
  return {
    business: { name: d.name.trim(), sector: d.sector, city: loc.city, state: loc.state, size: d.size },
    teamSize: Number(d.teamSize),
    departments: d.departments,
    goals: d.goals,
  };
}

function validate(step: number, d: Draft): Partial<Record<keyof Draft, string>> {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (step === 0) {
    const n = requiredText(d.name, 'Business name');
    if (n) errors.name = n;
  }
  if (step === 1) {
    const t = Number(d.teamSize);
    if (!Number.isInteger(t) || t < 1) errors.teamSize = 'Enter how many people work here.';
    if (d.departments.length === 0) errors.departments = 'Pick at least one department.';
  }
  if (step === 2 && d.goals.length === 0) errors.goals = 'Pick at least one goal.';
  return errors;
}

function CheckGroup({ legend, options, value, onChange, error }: { legend: string; options: string[]; value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1 text-[11px] font-medium text-slate-700">{legend}</legend>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {options.map((opt) => (
          <label key={opt} className={`flex cursor-pointer items-center gap-2 rounded-control border px-2.5 py-2 text-caption focus-within:ring-2 focus-within:ring-blue-300 ${value.includes(opt) ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-line bg-white text-slate-700 hover:bg-slate-50'}`}>
            <input type="checkbox" className="h-3.5 w-3.5 accent-blue-600" checked={value.includes(opt)} onChange={() => toggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
      {error && <p className="text-micro text-red-600">{error}</p>}
    </fieldset>
  );
}

export function SetupWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [planState, setPlanState] = useState<PlanState>({ status: 'loading' });
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string>();

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const generate = async (d: Draft) => {
    setPlanState({ status: 'loading' });
    try {
      const plan = await api.generateWorkspacePlan(toInput(d));
      setPlanState({ status: 'ready', plan });
    } catch (e) {
      setPlanState({ status: 'error', error: e instanceof Error ? e : new Error('Plan generation failed.') });
    }
  };

  const next = () => {
    const errs = validate(step, draft);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const to = step + 1;
    setStep(to);
    if (to === 3) void generate(draft);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const updatePlan = (fn: (p: WorkspacePlan) => WorkspacePlan) =>
    setPlanState((s) => (s.status === 'ready' ? { status: 'ready', plan: fn(s.plan) } : s));

  const accept = async () => {
    if (planState.status !== 'ready') return;
    setAccepting(true);
    setAcceptError(undefined);
    try {
      await api.acceptWorkspacePlan(planState.plan);
      navigate('/dashboard');
    } catch (e) {
      setAcceptError(e instanceof Error ? e.message : 'Could not save the workspace. Try again.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <AppLayout searchPlaceholder="Search">
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 pb-8 pt-5 lg:px-6">
        <PageHeader title="Set up your workspace" subtitle="A few questions, then Officeroom drafts your departments, folders and goals. You edit anything before it is saved." />

        <ol aria-label="Setup steps" className="flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li key={label} aria-current={i === step ? 'step' : undefined} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${i === step ? 'bg-blue-600 font-medium text-white' : i < step ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-muted'}`}>
              <span className="font-semibold">{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <Card title={STEPS[step]} bodyClassName="space-y-4">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Business name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} error={errors.name} />
              </div>
              <Select label="Sector" value={draft.sector} onChange={(e) => patch({ sector: e.target.value })}>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </Select>
              <Select label="Main city" value={draft.city} onChange={(e) => patch({ city: e.target.value })}>
                {CITIES.map((c) => <option key={c.city}>{c.city}</option>)}
              </Select>
              <Select label="Company size" value={draft.size} onChange={(e) => patch({ size: e.target.value as Size })}>
                {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="max-w-xs">
                <Input label="How many people work here?" type="number" min={1} value={draft.teamSize} onChange={(e) => patch({ teamSize: e.target.value })} error={errors.teamSize} />
              </div>
              <CheckGroup legend="Departments to start with" options={DEPARTMENT_OPTIONS} value={draft.departments} onChange={(v) => patch({ departments: v })} error={errors.departments} />
            </div>
          )}

          {step === 2 && (
            <CheckGroup legend="What should Officeroom help you reach first?" options={GOAL_OPTIONS} value={draft.goals} onChange={(v) => patch({ goals: v })} error={errors.goals} />
          )}

          {step === 3 && <PlanReview state={planState} onRetry={() => void generate(draft)} onUpdate={updatePlan} />}
        </Card>

        {acceptError && <FormAlert>{acceptError}</FormAlert>}

        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={back} disabled={step === 0 || accepting}>Back</Button>
          {step < 3 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={accept} loading={accepting} disabled={planState.status !== 'ready' || planState.plan.departments.length === 0}>Accept and open workspace</Button>
          )}
        </div>
      </main>
    </AppLayout>
  );
}

function PlanReview({ state, onRetry, onUpdate }: { state: PlanState; onRetry: () => void; onUpdate: (fn: (p: WorkspacePlan) => WorkspacePlan) => void }) {
  if (state.status === 'loading') return <LoadingState rows={5} label="Drafting your workspace plan" />;
  if (state.status === 'error') return <ErrorState error={state.error} onRetry={onRetry} />;

  const { plan } = state;
  const setDept = (i: number, p: Partial<PlanDepartment>) =>
    onUpdate((pl) => ({ ...pl, departments: pl.departments.map((d, idx) => (idx === i ? { ...d, ...p } : d)) }));
  const removeDept = (i: number) => onUpdate((pl) => ({ ...pl, departments: pl.departments.filter((_, idx) => idx !== i) }));
  const addDept = () => onUpdate((pl) => ({ ...pl, departments: [...pl.departments, { name: 'New department', lead: '', purpose: '', folders: [] }] }));

  return (
    <div className="space-y-4">
      <AIInsightCard title="Why this plan" body={plan.rationale} footer="Everything below is editable. Nothing is saved until you accept." />

      <section aria-label="Departments" className="space-y-2">
        <h3 className="text-[12px] font-semibold text-ink">Departments</h3>
        {plan.departments.length === 0 ? (
          <EmptyState title="No departments yet" body="Add one to create its folders and lead." action={<Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={addDept}>Add department</Button>} />
        ) : (
          plan.departments.map((d, i) => (
            <div key={i} className="grid gap-2 rounded-control border border-line p-3 sm:grid-cols-2">
              <Input label="Department name" value={d.name} onChange={(e) => setDept(i, { name: e.target.value })} />
              <Input label="Lead" value={d.lead} onChange={(e) => setDept(i, { lead: e.target.value })} />
              <div className="sm:col-span-2">
                <Textarea label="Purpose" value={d.purpose} onChange={(e) => setDept(i, { purpose: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Input label="Folders (comma separated)" value={d.folders.join(', ')} onChange={(e) => setDept(i, { folders: e.target.value.split(',').map((f) => f.trim()).filter(Boolean) })} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button variant="ghost" size="sm" icon={<Trash2 size={12} />} onClick={() => removeDept(i)}>Remove</Button>
              </div>
            </div>
          ))
        )}
        {plan.departments.length > 0 && <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={addDept}>Add department</Button>}
      </section>

      <section aria-label="Goals" className="space-y-2">
        <h3 className="text-[12px] font-semibold text-ink">Goals</h3>
        <ul className="space-y-1.5">
          {plan.goals.map((g, i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <Input label={`Goal ${i + 1}`} value={g} onChange={(e) => onUpdate((pl) => ({ ...pl, goals: pl.goals.map((x, idx) => (idx === i ? e.target.value : x)) }))} />
              </div>
              <Button variant="ghost" size="sm" aria-label={`Remove goal ${i + 1}`} onClick={() => onUpdate((pl) => ({ ...pl, goals: pl.goals.filter((_, idx) => idx !== i) }))} icon={<Trash2 size={12} />}>Remove</Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
