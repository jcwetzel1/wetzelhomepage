"use server";

import { revalidatePath } from "next/cache";
import { addProspect, removeProspect, updateProspectMlbId } from "@/lib/db";

function refresh() {
  revalidatePath("/baseball/prospects");
  revalidatePath("/baseball/scores");
}

export async function addProspectAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await addProspect(name);
  refresh();
}

export async function removeProspectAction(id: number) {
  await removeProspect(id);
  refresh();
}

export async function setProspectMlbIdAction(id: number, mlbId: string) {
  const trimmed = mlbId.trim();
  await updateProspectMlbId(id, trimmed ? Number(trimmed) : null);
  refresh();
}

export async function lookupProspectIdAction(id: number, name: string) {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(name)}`
  );
  if (!res.ok) return { found: false };
  const data = await res.json();
  const person = data.people?.[0];
  if (!person) return { found: false };
  await updateProspectMlbId(id, person.id);
  refresh();
  return { found: true, mlbId: person.id as number };
}
