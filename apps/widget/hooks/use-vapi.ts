import { vapiSecretsAtom, widgetSettingsAtom } from "@/components/widget-atom";
import Vapi from "@vapi-ai/web";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

export const useVapi = (
  onMessage?: (message: TranscriptMessage) => void
) => {

  const vapiSecrets = useAtomValue(vapiSecretsAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [partialTranscript, setPartialTranscript] = useState<TranscriptMessage | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => {
    if (!vapiSecrets) {
      return;
    }
    const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
    setVapi(vapiInstance);
    vapiInstance.on("call-start", () => {
      setConnected(true), setConnecting(true), setTranscript([]), setPartialTranscript(null);
    });
    vapiInstance.on("call-end", () => {
      setConnected(false), setConnecting(false), setIsSpeaking(false), setPartialTranscript(null);
    });
    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });
    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });
    vapiInstance.on("error", (error) => {
      console.log("error", error);
      setConnecting(false);
    });
    vapiInstance.on("message", (message) => {
      if (message.type === "transcript") {
        if (message.transcriptType === "final") {
          setPartialTranscript(null);
          const newMessage: TranscriptMessage = {
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript,
          };
          setTranscript((prev) => [...prev, newMessage]);
          onMessage?.(newMessage);
        } else {

          setPartialTranscript({
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript,
          });
        }
      }
    });

    return () => {
      vapiInstance?.stop();
    };
  }, []);

  const startCall = () => {
    if (!vapiSecrets || !widgetSettings?.vapiSettings.assistantId) {
      return;
    }
    setConnecting(true);
    if (vapi) {
      vapi.start(widgetSettings.vapiSettings.assistantId);
    }
  };
  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };
  return {
    isSpeaking,
    connected,
    connecting,
    transcript,
    partialTranscript,
    startCall,
    endCall,
  };
};

