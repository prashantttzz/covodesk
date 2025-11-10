/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import PluginCard, { type Feature } from "@/components/PluginCard";
import VapiConnectView from "@/components/vapi-connect-view";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@workspace/ui/components/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  Form,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useMutation, useQuery } from "convex/react";
import {
  GlobeIcon,
  PhoneCallIcon,
  PhoneIcon,
  WorkflowIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
const vapiFeature: Feature[] = [
  {
    icon: PhoneIcon,
    label: "Phone Numbers",
    description: "get dedicated business lines",
  },
  {
    icon: GlobeIcon,
    label: "web voice call",
    description: "voice chat directly in your app",
  },
  {
    icon: PhoneCallIcon,
    label: "Outbound calls",
    description: "Automated customer outreach",
  },
  {
    icon: WorkflowIcon,
    label: "workflows",
    description: "customer conversation flows",
  },
];

const formschema = z.object({
  publicApiKey: z.string().min(1, { message: "pulic api key is required" }),
  privateApiKey: z.string().min(1, { message: "private api key is required" }),
});
const VapiPluginForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const upsertSecret = useMutation(api.private.secret.upsert);
  const form = useForm<z.infer<typeof formschema>>({
    defaultValues: {
      publicApiKey: "",
      privateApiKey: "",
    },
  });

  const onSubmit = async (value: z.infer<typeof formschema>) => {
    try {
      await upsertSecret({
        service: "vapi",
        value: {
          publicApiKey: value.publicApiKey,
          privateApiKey: value.privateApiKey,
        },
      });
      setOpen(false);
      toast.success("vapi secret created");
    } catch (error) {
      console.error(error);
      toast.error("something went wrong");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="glass-light !bg-card">
        <DialogHeader>Enable Vapi</DialogHeader>
        <DialogDescription>
          your api keys are safely encrypted and stored using aws secret
        </DialogDescription>
        <Form {...form}>
          <form
            className="flex flex-col gap-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="publicApiKey"
              render={({ field }) => (
                <FormItem>
                  <Label>Public Api Key</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="your public api key"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="privateApiKey"
              render={({ field }) => (
                <FormItem>
                  <Label>Private Api Key</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="your private api key"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? "connecting" : "connect"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
const VapiPluginRemoveForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const removePlugin = useMutation(api.private.plugins.remove);
  const onSubmit = async () => {
    try {
      await removePlugin({ service: "vapi" });
      setOpen(false);
      toast.success("vapi plugin disconnected");
    } catch (error) {
      console.error(error);
      toast.error("something went wrong");
    }
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="glass-light !bg-card">
        <DialogHeader>disconnect Vapi</DialogHeader>
        <DialogDescription>
          are you sure you want to disconnect vapi plugin?{" "}
        </DialogDescription>
      <DialogFooter>
        <Button onClick={onSubmit} variant="destructive" className="bg-red-500">
          Disconnect
        </Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const VapiPlugin = () => {
  const [connect, setConnect] = useState(false);
  const [remove, setRemove] = useState(false);
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });
  const handleSubmit = () => {
    if (vapiPlugin) {
      setRemove(true);
    } else {
      setConnect(true);
    }
  };
  return (
    <>
      <VapiPluginForm setOpen={setConnect} open={connect} />
      <VapiPluginRemoveForm setOpen={setRemove} open={remove} />
      <div className="flex min-h-screen flex-col w-full bg-card p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
            <p>
              connect vapi to enable AI voice assistant over call and phone
              support
            </p>
          </div>
          <div className="mt-8 ">
            {vapiPlugin ? (
              // "connected"
              <VapiConnectView onDisconnect={handleSubmit} />
            ) : (
              <PluginCard
                serviceImage="/vapi.jpg"
                isDisabled={false}
                onSubmit={handleSubmit}
                serviceName="vapi"
                feature={vapiFeature}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VapiPlugin;
