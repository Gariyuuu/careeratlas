"use client";

import { useActionState } from "react";
import { upsertProfile, type ProfileFormState } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEGREE_LEVELS, DEGREE_LEVEL_LABELS } from "@/lib/seed-data/education";

interface Profile {
  educationStatus?: string | null;
  currentIndustry?: string | null;
  location?: string | null;
  expectedGraduationYear?: number | null;
  skillsCsv?: string | null;
  salaryGoal?: number | null;
  workArrangementPref?: string | null;
  currentSalary?: number | null;
  yearsExperience?: number | null;
  degreeLevel?: string | null;
  major?: string | null;
  companySize?: string | null;
}

export function ProfileForm({ profile, industries }: { profile: Profile | null; industries: { slug: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<ProfileFormState | undefined, FormData>(upsertProfile, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Education status" name="educationStatus">
          <SelectField name="educationStatus" defaultValue={profile?.educationStatus} options={DEGREE_LEVELS.map((d) => ({ value: d, label: DEGREE_LEVEL_LABELS[d] }))} />
        </Field>
        <Field label="Highest degree level" name="degreeLevel">
          <SelectField name="degreeLevel" defaultValue={profile?.degreeLevel} options={DEGREE_LEVELS.map((d) => ({ value: d, label: DEGREE_LEVEL_LABELS[d] }))} />
        </Field>
        <Field label="Current / desired industry" name="currentIndustry">
          <SelectField name="currentIndustry" defaultValue={profile?.currentIndustry} options={industries.map((i) => ({ value: i.slug, label: i.name }))} />
        </Field>
        <Field label="Location" name="location">
          <Input id="location" name="location" defaultValue={profile?.location ?? ""} placeholder="e.g. Austin, TX" />
        </Field>
        <Field label="Major" name="major">
          <Input id="major" name="major" defaultValue={profile?.major ?? ""} placeholder="e.g. Computer Science" />
        </Field>
        <Field label="Expected graduation year" name="expectedGraduationYear">
          <Input id="expectedGraduationYear" name="expectedGraduationYear" type="number" defaultValue={profile?.expectedGraduationYear ?? ""} />
        </Field>
        <Field label="Current salary (USD)" name="currentSalary">
          <Input id="currentSalary" name="currentSalary" type="number" defaultValue={profile?.currentSalary ?? ""} />
        </Field>
        <Field label="Years of experience" name="yearsExperience">
          <Input id="yearsExperience" name="yearsExperience" type="number" step="0.5" defaultValue={profile?.yearsExperience ?? ""} />
        </Field>
        <Field label="Salary goal (USD)" name="salaryGoal">
          <Input id="salaryGoal" name="salaryGoal" type="number" defaultValue={profile?.salaryGoal ?? ""} />
        </Field>
        <Field label="Preferred work arrangement" name="workArrangementPref">
          <SelectField
            name="workArrangementPref"
            defaultValue={profile?.workArrangementPref}
            options={[
              { value: "remote", label: "Remote" },
              { value: "hybrid", label: "Hybrid" },
              { value: "onsite", label: "Onsite" },
            ]}
          />
        </Field>
        <Field label="Company size preference" name="companySize">
          <SelectField
            name="companySize"
            defaultValue={profile?.companySize}
            options={[
              { value: "startup", label: "Startup" },
              { value: "small", label: "Small" },
              { value: "mid", label: "Mid-size" },
              { value: "large", label: "Large" },
              { value: "enterprise", label: "Enterprise" },
            ]}
          />
        </Field>
      </div>
      <Field label="Skills (comma-separated)" name="skillsCsv">
        <Input id="skillsCsv" name="skillsCsv" defaultValue={profile?.skillsCsv ?? ""} placeholder="e.g. Python, SQL, Product Strategy" />
      </Field>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Profile saved.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}

function Field({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
    </div>
  );
}

function SelectField({ name, defaultValue, options }: { name: string; defaultValue?: string | null; options: { value: string; label: string }[] }) {
  return (
    <>
      <input type="hidden" name={name} id={`${name}-hidden`} defaultValue={defaultValue ?? ""} />
      <Select
        defaultValue={defaultValue ?? undefined}
        onValueChange={(v) => {
          const el = document.getElementById(`${name}-hidden`) as HTMLInputElement | null;
          if (el) el.value = v;
        }}
      >
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
