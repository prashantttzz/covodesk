"use client";
import { OrganizationList, useOrganization } from "@clerk/nextjs";
import React from "react";

const OrgGuard = ({ children }: { children: React.ReactNode }) => {
  const { organization } = useOrganization();
  return(
    <div className="">
      {organization ? (
        children
      ) : (
        <OrganizationList
          afterCreateOrganizationUrl={"/"}
          afterSelectOrganizationUrl={"/"}
          hidePersonal
          skipInvitationScreen
        />
      )}
    </div>
  )
};

export default OrgGuard;
