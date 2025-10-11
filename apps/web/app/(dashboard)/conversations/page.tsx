import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="flex h-screen flex-1 flex-col gap-y-4 bg-muted">
      <div className="flex flex-1 items-center justify-center gap-x-2">
        <Image src="/logo.svg" height={40} width={40} alt="logo" />
        <p>ConvoX</p>
      </div>
    </div>
  );
};

export default page;
