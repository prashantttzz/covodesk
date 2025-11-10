"use client";

import React from "react";
import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

const PricingTable = () => {
  return (
    <section className="relative flex flex-col items-center justify-center py-16 w-full bg-card">
      {/* Header */}
      <div className="relative z-10 flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-semibold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
          Simple, transparent pricing
        </h1>
        <p className="mt-2 text-gray-400">
          Choose a plan that fits your team. Upgrade anytime.
        </p>
      </div>

      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#1c1c1c]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[100px] bg-gradient-to-br from-blue-500/20 via-purple-600/20 to-pink-500/20 opacity-40" />

      {/* Clerk Table */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl px-6">
        <ClerkPricingTable
          forOrganizations
          appearance={{
            variables: {
              colorPrimary: "#60a5fa",
              colorBackground: "transparent",
              colorText: "white",
              fontSize: "14px",
              borderRadius: "24px",
            },
            elements: {
              // overall layout
              pricingTable: "grid grid-cols-1 md:grid-cols-2 gap-8 w-full",
              pricingTableCard: `
                relative overflow-hidden rounded-3xl border border-white/10 
                bg-[rgba(25,25,25,0.5)] backdrop-blur-xl 
                transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] 
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]
              `,
              pricingTableCardHeader: `
                border-none bg-transparent 
                text-white font-semibold text-xl mb-4
              `,
              pricingTableCardBody: `
                bg-transparent text-gray-300 text-sm space-y-3
              `,
              pricingTableCardFooter: `
                mt-4 bg-transparent border-t border-white/10 pt-4 flex justify-center
              `,
              pricingTablePlanFeature: `
                flex items-center justify-start gap-2 text-gray-300 text-sm hover:text-gray-100 transition-colors
              `,
              pricingTablePlanFeatureCheck: "text-green-400",
              pricingTablePlanName: "text-white text-2xl font-semibold mb-2",
              pricingTablePlanPrice: "text-4xl font-bold text-white",
              pricingTablePlanPricePeriod: "text-gray-400 text-base ml-1",
              pricingTableButton: `
                relative w-full mt-6 rounded-xl 
                bg-gradient-to-r from-white/10 to-white/5 
                border border-white/20 text-white font-semibold py-3 
                hover:from-white/15 hover:to-white/10 
                transition-all duration-300 
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_20px_rgba(0,0,0,0.4)]
              `,
            },
          }}
        />
      </div>
    </section>
  );
};

export default PricingTable;
