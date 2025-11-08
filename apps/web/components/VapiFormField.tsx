import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { formSchema } from "./CustomizationForm";
import { useVapiAssistant, useVapiPhoneNumber } from "@/hooks/use-vapi-data";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
interface vapiFormFieldProps {
  form: UseFormReturn<formSchema>;
}

const VapiFormField = ({ form }: vapiFormFieldProps) => {
  const { data: assistant, isLoading: assistantLoading } = useVapiAssistant();
  const { data: phoneNumber, isLoading: phoneNumberLoading } =
    useVapiPhoneNumber();
  const disabled = form.formState.isSubmitting;
  return (
    <>
      <FormField
        control={form.control}
        name="vapiSettings.assistantId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Voice Assistant</FormLabel>
            <Select
              disabled={assistantLoading || disabled}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      assistantLoading
                        ? "loading assistant"
                        : "select an assistant"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {assistant.map((assist) => (
                  <SelectItem key={assist.id} value={assist.id}>
                    {assist.name || "unnamed assistant"} -{" "}
                    {assist.model?.model || "unkown model"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The vapi assistant to use for voice calls{" "}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vapiSettings.phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Numbers</FormLabel>
            <Select
              disabled={phoneNumberLoading || disabled}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      phoneNumberLoading
                        ? "loading phone numbers"
                        : "select a phone numbers"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {phoneNumber.map((phone) => (
                  <SelectItem key={phone.id} value={phone.id}>
                    {phone.number || "-"} -{" "}
                    {phone.name || "unnamed phone number"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The phone number to use for voice calls{" "}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default VapiFormField;
