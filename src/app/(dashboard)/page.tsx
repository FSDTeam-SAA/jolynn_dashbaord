import React from 'react'
import OverviewState from './_components/OverviewState'
import WebsiteVisitsChart from './_components/WebsiteVisitsChart'
import NewActionsAndRegistration from './_components/NewActionsAndRegistration'

function page() {
  return (
    <div>
      <OverviewState />
      <WebsiteVisitsChart />
      <NewActionsAndRegistration />
    </div>
  )
}

export default page