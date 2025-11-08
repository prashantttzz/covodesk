import PricingTable from '@/components/PricingTable'
import React from 'react'

const Billing = () => {
  return (
    <div className="flex w-full flex-col min-h-screen bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md">
        <div className='space-y-2'>
          <h1 className='text-2xl md:text-4xl'>Plans and Billing</h1>
          <p>Choose the plan that &apos;s right for you</p>
        </div>

        <div className='mt-8'>
          <PricingTable/>
        </div>
      </div>
    </div>
  )
}

export default Billing