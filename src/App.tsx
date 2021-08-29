import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
// @ts-ignore
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Auth from './zerotier/auth'
import Node from './zerotier/node'
import Networks from './zerotier/networks'
import Peers from './zerotier/peers'

import { useConfigPath, useAuthToken } from './shared/config'

import 'react-tabs/style/react-tabs.css'
import './App.css'

const queryClient = new QueryClient()

function MainWindow() {
  const { data: configDirPath } = useConfigPath()
  const { data: authToken, status: authTokenStatus } = useAuthToken(configDirPath)

  return (
    <Tabs>
      <TabList>
        <Tab>Auth</Tab>
        {!!authToken &&
        <>
          <Tab>Info</Tab>
          <Tab>Networks</Tab>
          <Tab>Peers</Tab>
        </>
        }
      </TabList>
      <TabPanel>
        <Auth configDirPath={configDirPath} token={authToken} tokenStatus={authTokenStatus} />
      </TabPanel>
      {!!authToken &&
      <>
        <TabPanel>
          <Node authToken={authToken} />
        </TabPanel>
        <TabPanel>
          <Networks authToken={authToken} />
        </TabPanel>
        <TabPanel>
          <Peers authToken={authToken} />
        </TabPanel>
      </>
      }
    </Tabs>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='App'>
        <MainWindow />
      </div>
    </QueryClientProvider>
  )
}

export default App
