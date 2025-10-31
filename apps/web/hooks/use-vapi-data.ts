import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@workspace/backend/_generated/api";

type PhoneNumbers = typeof api.private.vapi.getPhoneNumber._returnType;
type Assistants = typeof api.private.vapi.getAssistant._returnType;

export const useVapiPhoneNumber = (): {
  data: PhoneNumbers;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<PhoneNumbers>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getPhoneNumber = useAction(api.private.vapi.getPhoneNumber);
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getPhoneNumber();
        if (cancelled) {
          return;
        }
        setData(data);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setError(error as Error);
        toast.error("failed to fetch phone number");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
};

export const useVapiAssistant = (): {
  data: Assistants;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<Assistants>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAssistant = useAction(api.private.vapi.getAssistant);
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAssistant();
        if (cancelled) {
          return;
        }
        setData(data);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setError(error as Error);
        toast.error("failed to fetch assistant ");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
};
