import React from "react";
import { WidgetHeader } from "./widget-header";
import { AlertTriangleIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { errorAtom } from "./widget-atom";

const WidgetErrorScreen = () => {
    const errorMessage = useAtomValue(errorAtom);
  return (
    <>
      <WidgetHeader>
        <div className="flex flex-1 flex-col justify-between gap-y-2 px-2 py-6">
          <p className="font-semibold text-3xl">Hi there! </p>
          <p className="text-xl"> het&apos;s get you started</p>
        </div>
      </WidgetHeader>
       <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <AlertTriangleIcon className=""/>
        <p className="text-sm">
                {errorMessage||'invalid configuration'}
        </p>
       </div>
    </>
  );
};

export default WidgetErrorScreen;
