"use client";
import React, { useState } from "react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableHeader,
  TableCell,
  TableRow,
  TableHead,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import {
  FileIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useInfinteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { usePaginatedQuery } from "convex/react";
import UploadDialog from "../../../components/upload-dialog";
import InfiniteScrollTrigger from "@workspace/ui/components/InfiniteScrollTrigger";
import DeleteDialog from "@/components/delete-dialog";
import { Protect } from "@clerk/nextjs";
import { PublicFile } from "@workspace/backend/private/files";
import PremiumFeatureOverlay from "@/components/premium-feature-overlay";
const Files = () => {
  const files = usePaginatedQuery(
    api.private.files.listFiles,
    {},
    { initialNumItems: 10 }
  );
  const {
    topElementRef,
    handleLoadMore,
    isLoadingFirstPage,
    canLoadMore,
    isLoadingMore,
  } = useInfinteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 10,
    observerEnabled: true,
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);
  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file);
    setDeleteDialog(true);
  };
  const handlefileDelete = () => {
    setSelectedFile(null);
  };
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={<PremiumFeatureOverlay>k </PremiumFeatureOverlay>}
    >
      <>
        <UploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />
        <DeleteDialog
          onDelete={handlefileDelete}
          open={deleteDialog}
          file={selectedFile}
          onOpenChange={setDeleteDialog}
        />
        <div className="flex flex-col w-full p-8 bg-muted min-h-screen">
          <div className="mx-auto w-full max-w-screen-md">
            <div className="sapce-y-2">
              <h1 className="text-2xl md:text-4xl">Knowledge Base</h1>
              <p className="text-muted-foreground">
                {" "}
                upload and manage documents for your ai assistant
              </p>
            </div>
            <div className="mt-8 rounded-lg border bg-background">
              <div className="flex items-center justify-end border-b px-6 py-4">
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <PlusIcon />
                  Add New
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-4 font-medium">
                      Name
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      Type
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      Size
                    </TableHead>
                    <TableHead className="px-6 py-4 font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    if (isLoadingFirstPage) {
                      return (
                        <TableRow>
                          <TableCell className="h-24 text-center" colSpan={4}>
                            Loading files...
                          </TableCell>
                        </TableRow>
                      );
                    }
                    if (files.results.length === 0) {
                      return (
                        <TableRow>
                          <TableCell className="h-24 text-center" colSpan={4}>
                            No file found
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return files.results.map((file) => (
                      <TableRow className="hover:bg-muted/50" key={file.id}>
                        <TableCell className="px-6 py-4 font-medium">
                          <Badge className="flex items-center gap-3">
                            <FileIcon />
                            {file.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className="upperclass" variant="outline">
                            {file.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-muted-foreground">
                          {file.size}
                        </TableCell>
                        <TableCell className="px-6 py-4 ">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="size-8 p-0"
                                size="sm"
                                variant="ghost"
                              >
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteClick(file)}
                              >
                                <TrashIcon className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
              {!isLoadingFirstPage && files.results.length > 0 && (
                <div className="border-t">
                  <InfiniteScrollTrigger
                    canLoadMore={canLoadMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    ref={topElementRef}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </Protect>
  );
};

export default Files;
