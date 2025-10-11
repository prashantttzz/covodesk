import { CONTACT_SESSION_KEY } from "@/constant";
import { WidgetScreen } from "@/types";
import { Id } from "@workspace/backend/_generated/dataModel";
import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
export const screenAtom = atom<WidgetScreen>("loading");
export const errorAtom = atom<string | null>(null);
export const loadingAtom = atom<string | null>(null);
export const organizationIdAtom = atom<string | null>(null);
export const conversationIdAtom = atom<Id<"conversations"> | null>(null);
export const contactSessionIdFamily = atomFamily((organizationId: string) => {
  return atomWithStorage<Id<"contactSession"> | null>(
    `${CONTACT_SESSION_KEY}_${organizationId}`,
    null
  );
});
