import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => {
    const vapiInstance = new Vapi("6c64bae1-32c8-47e3-b32a-ad22c4a019f1");
    setVapi(vapiInstance);
    vapiInstance.on("call-start", () => {
      setConnected(true), setConnecting(true), setTranscript([]);
    });
    vapiInstance.on("call-end", () => {
      setConnected(false), setConnecting(false), setIsSpeaking(false);
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
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript,
          },
        ]);
      }
    });
    return () => {
      vapiInstance?.stop();
    };
  }, []);

  const startCall = () => {
    setConnecting(true);
    if (vapi) {
      vapi.start("d9f43dc2-5c01-4ebf-b8e0-b5051bb1bd89");
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
    startCall,
    endCall,
  };
};
