import { api } from "@workspace/backend/_generated/api";
import { useAction } from "convex/react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import { Button } from "@workspace/ui/components/button";
interface UplaodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload?: () => void;
}
const UplaodDialog = ({
  open,
  onOpenChange,
  onFileUpload,
}: UplaodDialogProps) => {
  const addFile = useAction(api.private.files.addFile);
  const [uploadFile, setUploadFile] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ category: "", fileName: "" });

  const handleFileDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadFile([file]);
      if (!uploadForm.fileName) {
        setUploadForm((prev) => ({ ...prev, fileName: file.name }));
      }
    }
  };

  const handleFileUpload = async () => {
    setUploading(true);
    try {
      const blob = uploadFile[0];
      if (!blob) {
        return;
      }
      const fileName = uploadForm.fileName || blob.name;
      await addFile({
        bytes: await blob.arrayBuffer(),
        fileName,
        category: uploadForm.category,
        mimeType: blob.type || "text/plain"
      });
      onFileUpload?.();
      handleCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUploadForm({ category: "", fileName: "" });
    setUploadFile([]);
  };
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg glass-dialog">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            upload document to your Knowledge base for ai powered search and
            retrieval
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              className=""
              id="category"
              onChange={(e) =>
                setUploadForm((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="documentation,support,product"
              type="text"
              value={uploadForm.category}
            />
          </div>
          <div className="space-y-2 mt-5">
            <Label htmlFor="filename">
              FileName{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              className=""
              id="filename"
              onChange={(e) =>
                setUploadForm((prev) => ({ ...prev, fileName: e.target.value }))
              }
              placeholder="override default filename"
              type="text"
              value={uploadForm.fileName}
            />
          </div>
          <Dropzone
            accept={{
              "application/pdf": [".pdf"],
              "text/plain": [".txt"],
              "text/csv": [".csv"],
            }}
            disabled={uploading}
            maxFiles={1}
            onDrop={handleFileDrop}
            src={uploadFile}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
        <DialogFooter>
          <Button onClick={handleCancel} disabled={uploading} variant="outline" className="glass-light">
            Cancel
          </Button>
          <Button
            onClick={handleFileUpload}
            disabled={
              uploadFile.length === 0 || uploading || !uploadForm.category
            }
          >
            {uploading ? "uploading...." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UplaodDialog;
