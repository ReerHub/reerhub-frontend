"use client";
import { useEffect, useSyncExternalStore } from "react";
import { savedIds, saveJob, unsaveJob } from "./auth";
const EMPTY: string[] = [];
let member: string | undefined,
  ids = EMPTY,
  updatedAt = 0,
  attemptedAt = 0,
  generation = 0;
let pending: Promise<void> | undefined;
const listeners = new Set<() => void>();
const mutations = new Map<string, Promise<void>>();
const changedDuringRead = new Map<string, boolean>();
const notify = () => listeners.forEach((fn) => fn());
export function resetSaved(memberId?: string) {
  if (member === memberId) return;
  member = memberId;
  ids = EMPTY;
  updatedAt = 0;
  attemptedAt = 0;
  generation += 1;
  pending = undefined;
  mutations.clear();
  changedDuringRead.clear();
  notify();
}
async function loadSaved() {
  if (!member) return;
  if (pending) return pending;
  if (Date.now() - attemptedAt < 60000) return;
  const epoch = generation;
  attemptedAt = Date.now();
  pending = savedIds()
    .then((value) => {
      if (generation === epoch) {
        const merged = new Set(value);
        for (const [id, selected] of changedDuringRead) {
          if (selected) merged.add(id);
          else merged.delete(id);
        }
        ids = [...merged];
        updatedAt = Date.now();
        notify();
      }
    })
    .catch(() => {
      /* Keep the last successful state on failure. */
    })
    .finally(() => {
      if (generation === epoch) {
        pending = undefined;
        changedDuringRead.clear();
      }
    });
  return pending;
}
export function useSavedJobs(memberId?: string) {
  const value = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => (member === memberId ? ids : EMPTY),
    () => EMPTY,
  );
  useEffect(() => {
    resetSaved(memberId);
    if (memberId && !updatedAt) void loadSaved();
    const focus = () => {
      if (member === memberId && Date.now() - updatedAt >= 60000)
        void loadSaved();
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [memberId]);
  return value;
}
export function toggleSaved(jobId: string, next: boolean) {
  const existing = mutations.get(jobId);
  if (existing) return existing;
  if (!member) return Promise.reject(new Error("Please sign in to save roles"));
  const epoch = generation;
  const promise = (next ? saveJob(jobId) : unsaveJob(jobId))
    .then(() => {
      if (epoch !== generation) return;
      if (pending) changedDuringRead.set(jobId, next);
      ids = next
        ? [...new Set([...ids, jobId])]
        : ids.filter((id) => id !== jobId);
      updatedAt = Date.now();
      notify();
    })
    .finally(() => {
      if (mutations.get(jobId) === promise) mutations.delete(jobId);
    });
  mutations.set(jobId, promise);
  return promise;
}
