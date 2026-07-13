import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default function NewActionsAndRegistration() {
  // Pending Actions data array
  const pendingActions = [
    { id: 1, label: 'Business Card Reviews', count: 2 },
    { id: 2, label: 'Listing approvals', count: 2 },
    { id: 3, label: 'Reported reviews', count: 2 },
  ]

  // New Registrations data array
  const newRegistrations = [
    { id: 1, name: 'Metro HVAC Services', status: 'Pending' },
    { id: 2, name: 'Summit Contractors', status: 'Pending' },
    { id: 3, name: 'Sunrise Roofing Inc.', status: 'Pending' },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-1 w-full mt-10">
      
      {/* 1. Pending Actions Card */}
      <Card className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-5">
          <CardTitle className="text-base font-bold text-[#1e266e] tracking-tight">
            Pending Actions
          </CardTitle>
          <Link 
            href="/pending-actions" 
            className="text-xs font-semibold text-[#3b4cb8] hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {pendingActions.map((action) => (
              <div 
                key={action.id} 
                className="flex items-center justify-between py-4 text-sm font-medium text-gray-800"
              >
                <span>{action.label}</span>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#990000] text-white text-[11px] font-bold">
                  {action.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. New Registrations Card */}
      <Card className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-5">
          <CardTitle className="text-base font-bold text-[#1e266e] tracking-tight">
            New Registrations
          </CardTitle>
          <Link 
            href="/new-registrations" 
            className="text-xs font-semibold text-[#3b4cb8] hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {newRegistrations.map((registration) => (
              <div 
                key={registration.id} 
                className="flex items-center justify-between py-4 text-sm font-medium text-gray-800"
              >
                <span>{registration.name}</span>
                <span className="px-3 py-1 text-xs font-semibold text-[#d97706] bg-[#fef3c7] rounded-full tracking-wide">
                  {registration.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}