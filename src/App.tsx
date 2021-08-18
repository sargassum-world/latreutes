import React from 'react'
import { isMacOS, isWindows } from '@tauri-apps/api/helpers/os-check'
// @ts-ignore
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Auth from './zerotier/auth'

import 'react-tabs/style/react-tabs.css'
import './App.css'

function App() {
  let os = 'Linux'
  if (isMacOS()) {
    os = 'macOS'
  } else if (isWindows()) {
    os = 'Windows'
  }

  return (
    <div className='App'>
      <Tabs>
        <TabList>
          <Tab>Debug</Tab>
          <Tab>Auth</Tab>
        </TabList>
        <TabPanel>
          <p>This application is running on {os}.</p>
        </TabPanel>
        <TabPanel>
          <Auth />
        </TabPanel>
      </Tabs>
    </div>
  )
}

export default App
