import React from 'react'
import { isMacOS, isWindows } from '@tauri-apps/api/helpers/os-check'

import './App.css'

function App() {
  let os = 'Linux'
  if (isMacOS()) {
    os = 'macOS'
  } else if (isWindows()) {
    os = 'Windows'
  }
  return (
    <div className="App">
      <header className="App-header">
        <p>
          This application is running on {os}.
        </p>
      </header>
    </div>
  )
}

export default App
