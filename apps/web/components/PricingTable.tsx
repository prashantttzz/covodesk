import React from 'react'
 import { PricingTable as ClerkPrincingTable } from '@clerk/nextjs'
const PricingTable = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-y-4'><ClerkPrincingTable
    forOrganizations
    appearance={
        {
            elements:{
                pricingTableCard:"shadow-none! border! rounded-lg!",
                pricingTableCardHeader:"bg-background!",
                pricingTableCardBody:"bg-background!",
                pricingTableCardFooter:"bg-background!",
            }
        }
    }/></div>
  )
}

export default PricingTable