import React, { useEffect, useState } from "react";
import { WidgetHeader } from "./widget-header";
import { LoaderIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdFamily,
  errorAtom,
  loadingAtom,
  organizationIdAtom,
  screenAtom,
} from "./widget-atom";
import { api } from "@workspace/backend/_generated/api";
import { useAction, useMutation } from "convex/react";

type Initstep = "org" | "session" | "settings" | "vapi" | "done";
const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null;
}) => {
  const [step, setStep] = useState<Initstep>("org");
  const [sessionValid, setSessionValid] = useState(false);
  const loadingMessage = useAtomValue(loadingAtom);
  const setErrorMessage = useSetAtom(errorAtom);
  const setLoadingMessage = useSetAtom(loadingAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setScreen = useSetAtom(screenAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdFamily(organizationId || "")
  );
  const validateOrganization = useAction(api.public.organization.validate);
  const validateSession = useMutation(api.public.contactSession.validate);

  useEffect(() => {
    if (step !== "org") {
      return;
    }
    setLoadingMessage("loading organization...");
    if (!organizationId) {
      setErrorMessage("organization ID is required");
      setScreen("error");
      return;
    }
    setLoadingMessage("validating organization...");
    validateOrganization({ organizationId })
      .then((res) => {
        if (res.valid) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(res.reason || "invalid configuration");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("unable to verify organization!");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setOrganizationId,
    setStep,
    validateOrganization,
    setLoadingMessage,
  ]);

  useEffect(() => {
    if (step !== "session") {
      return;
    }
    if (!contactSessionId) {
      setSessionValid(false);
      setStep("done");
      return;
    }
    setLoadingMessage("Validating contact session ID...");
    validateSession({ contactSessionId })
      .then((res) => {
        setSessionValid(res.valid);
        setStep("done");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("done");
      });
  }, [step, contactSessionId, validateSession, setLoadingMessage ,setSessionValid ,sessionValid]);

  useEffect(() => {
    if (step !== "done") return;
    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-1 flex-col justify-between gap-y-2 px-2 py-6">
          <p className="font-semibold text-3xl">Hi there! </p>
          <p className="text-xl"> het&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "loading..."}</p>
      </div>
    </>
  );
};

export default WidgetLoadingScreen;
