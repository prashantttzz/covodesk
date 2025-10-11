"use client";
import React from "react";
import { WidgetHeader } from "./widget-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import {  useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdFamily, organizationIdAtom, screenAtom } from "./widget-atom";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

const WidgetAuthScreen = () => {
  const setScreen = useSetAtom(screenAtom);
   const organizationId = useAtomValue(organizationIdAtom);
   const setcontactSession = useSetAtom(contactSessionIdFamily(organizationId||""))
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  const createContactSession = useMutation(api.public.contactSession.create);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!organizationId) {
      return;
    }
    const metadata: Doc<"contactSession">["metadata"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(","),
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${screen.width}x${screen.height} `,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
      refferer: document.referrer || "direct",
      currentUrl: window.location.href,
    };
    const contactSessionId = await createContactSession({
      ...data,
      organizationId,
      metadata,
    });
   setcontactSession(contactSessionId);
   setScreen("selection")
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-1 flex-col justify-between gap-y-2 px-2 py-6">
          <p className="font-semibold text-3xl">Hi there! </p>
          <p className="text-xl"> het&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <Form {...form}>
        <form
          className="flex flex-1 flex-col gap-y-4 p-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-10 bg-background"
                    placeholder="e.g.. John Doe"
                    {...field}
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-10 bg-background"
                    placeholder="e.g.. JohnDoe@gmail.com"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={form.formState.isSubmitting}
            size="lg"
            type="submit"
          >Continue</Button>
        </form>
      </Form>
    </>
  );
};

export default WidgetAuthScreen;
