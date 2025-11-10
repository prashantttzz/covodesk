import { useVapiPhoneNumber } from "@/hooks/use-vapi-data";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  CheckCircleIcon,
  PhoneIcon,
  XCircleIcon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

const VapiPhoneTab = () => {
  const { data: phoneNumber, isLoading } = useVapiPhoneNumber();
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("copied to clipboard");
    } catch {
      toast.error("failed to copy");
    }
  };
  return (
    <div className="border-t  !bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4 ">Phone Number</TableHead>
            <TableHead className="px-6 py-4 ">Name</TableHead>
            <TableHead className="px-6 py-4 ">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            if (isLoading) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Loading phone numbers...
                  </TableCell>
                </TableRow>
              );
            }
            if (phoneNumber.length === 0) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    no phone number configured..
                  </TableCell>
                </TableRow>
              );
            }

            return phoneNumber.map((phone) => (
              <TableRow className="hover:bg-muted/50" key={phone.id}>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span className="font-mono">
                      {phone.number || "not configured"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {phone.name || "unamed"}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    className="capitalize"
                    variant={
                      phone.status === "active" ? "default" : "destructive"
                    }
                  >
                    {phone.status === "active" && (
                      <CheckCircleIcon className="mr-1 size-3" />
                    )}  
                    {phone.status !== "active" && (
                      <XCircleIcon className="mr-1 size-3" />
                    )}

                    {phone.status || "unkown"}
                  </Badge>{" "}
                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </div>
  );
};

export default VapiPhoneTab;
