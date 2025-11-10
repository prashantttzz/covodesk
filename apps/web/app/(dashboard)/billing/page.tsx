"use client";

import React from "react";
import { Check } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For personal use and testing.",
    features: ["Basic support", "1 project", "Community access"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For startups and small teams.",
    features: [
      "Priority support",
      "Up to 5 members",
      "Voice call support",
      "Custom knowledge base",
    ],
    highlight: true,
  },
];

const Billing = () => {
  const { user } = useUser();

  const handlePlanSelect = async (plan: string) => {
    if (!user) {
      alert("Please sign in to upgrade your plan.");
      return;
    }

    try {
      // if using Clerk's built-in billing portal (Stripe integration)
      // if you manage billing yourself, you could call your own API here
      // await fetch("/api/upgrade", { method: "POST", body: JSON.stringify({ plan }) });
    } catch (err) {
      console.error("Error opening billing portal:", err);
    }
  };

  return (
    <section className="relative flex flex-col w-full items-center justify-center py-10 bg-card">
      <div className="relative z-10 flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-semibold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
          Simple, transparent pricing
        </h1>
        <p className="mt-2 text-gray-400">
          Choose a plan that fits your stage. Upgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl px-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[rgba(25,25,25,0.5)] backdrop-blur-xl 
              transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]
            `}
          >
            <div
              className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${
                plan.highlight
                  ? "from-blue-500/30 to-blue-400/20"
                  : "from-white/5 to-white/0"
              } opacity-40 pointer-events-none`}
            />

            <div className="relative flex flex-col items-center text-center p-8 space-y-6">
              <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
              <p className="text-gray-400">{plan.description}</p>

              <div className="flex items-end justify-center text-white">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="ml-1 text-gray-400 text-lg">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 text-gray-300">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center justify-start gap-2"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan.name)}
                className={`relative w-full mt-6 rounded-xl border border-white/20 text-white font-semibold py-3
                  transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_20px_rgba(0,0,0,0.4)]
`}
              >
                {plan.name === "Free" ? "Get Started" : "Choose Plan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Billing;
