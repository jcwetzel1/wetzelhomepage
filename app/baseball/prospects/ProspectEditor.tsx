"use client";

import { useRef, useState, useTransition } from "react";
import type { Prospect } from "@/lib/db";
import {
  addProspectAction,
  lookupProspectIdAction,
  removeProspectAction,
  setProspectMlbIdAction,
} from "./actions";

function ProspectRow({ prospect }: { prospect: Prospect }) {
  const [mlbId, setMlbId] = useState(prospect.mlbId?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [notFound, setNotFound] = useState(false);

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-sm text-gray-900">{prospect.name}</td>
      <td className="py-2 pr-4">
        <input
          value={mlbId}
          onChange={(e) => {
            setMlbId(e.target.value);
            setNotFound(false);
          }}
          onBlur={() => startTransition(() => setProspectMlbIdAction(prospect.id, mlbId))}
          placeholder="MLB ID"
          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </td>
      <td className="py-2 pr-4">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await lookupProspectIdAction(prospect.id, prospect.name);
              if (result.found) {
                setMlbId(String(result.mlbId));
                setNotFound(false);
              } else {
                setNotFound(true);
              }
            })
          }
          className="text-xs text-red-700 hover:underline disabled:opacity-50"
        >
          Look up ID
        </button>
        {notFound && <span className="ml-2 text-xs text-gray-400">not found</span>}
      </td>
      <td className="py-2 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => removeProspectAction(prospect.id))}
          className="text-xs text-gray-400 hover:text-red-700 disabled:opacity-50"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export default function ProspectEditor({ prospects }: { prospects: Prospect[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-400 uppercase tracking-wide">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">MLB ID</th>
            <th className="py-2 font-medium"></th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((p) => (
            <ProspectRow key={p.id} prospect={p} />
          ))}
        </tbody>
      </table>

      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            await addProspectAction(formData);
            formRef.current?.reset();
          })
        }
        className="mt-4 flex gap-2"
      >
        <input
          name="name"
          placeholder="Add a player name"
          required
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-red-700 text-white text-sm font-medium px-4 py-2 hover:bg-red-800 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
