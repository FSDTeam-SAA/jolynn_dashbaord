import React from 'react'
import OverviewState from './_components/OverviewState'
import NewActionsAndRegistration from './_components/NewActionsAndRegistration'
import VisitsChartTabs from './_components/VisitsChartTabs'

function page() {
  return (
    <div>
      <OverviewState />
      <VisitsChartTabs />
      <NewActionsAndRegistration />
    </div>
  )
}

export default page
