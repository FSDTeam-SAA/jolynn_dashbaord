import React from 'react'
import { Building2, MoreHorizontal, Users2, Files } from 'lucide-react'

function OverviewState() {
  const stats = [
    {
      title: 'Total Businesses',
      value: '1,160',
      icon: Building2,
    },
    {
      title: 'Pending Approvals',
      value: '16',
      icon: MoreHorizontal,
    },
    {
      title: 'Active Users',
      value: '1264',
      icon: Users2,
    },
    {
      title: 'Reports',
      value: '12',
      icon: Files,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div 
            key={index} 
            className="flex items-center justify-between px-4 py-7 bg-white rounded-[8px] shadow-[0px_4px_6px_0px_#0000001A]"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-500 tracking-wide">
                {stat.title}
              </span>
              <span className="text-3xl font-bold text-[#1e266e] tracking-tight">
                {stat.value}
              </span>
            </div>
            
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#eef2ff] text-[#3b4cb8]">
              <Icon className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OverviewState