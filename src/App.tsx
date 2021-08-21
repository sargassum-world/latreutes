import React, { useState } from 'react'
// @ts-ignore
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Auth from './zerotier/auth'
import NodeInfo from './zerotier/node'
import NetworksInfo from './zerotier/networks'
import PeersInfo from './zerotier/peers'

import 'react-tabs/style/react-tabs.css'
import './App.css'

function App() {
  const [authToken, setAuthToken] = useState('')

  return (
    <div className='App'>
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
          <Auth authToken={authToken} setAuthToken={setAuthToken} />
        </TabPanel>
        {!!authToken &&
          <>
            <TabPanel>
              <NodeInfo authToken={authToken} />
            </TabPanel>
            <TabPanel>
              <NetworksInfo authToken={authToken} />
            </TabPanel>
            <TabPanel>
              <PeersInfo authToken={authToken} />
            </TabPanel>
          </>
        }
      </Tabs>
    </div>
  )
}

export default App
