import React, { useState, useEffect } from 'react'
import { isMacOS, isWindows } from '@tauri-apps/api/helpers/os-check'
import { createDir, readTextFile, writeFile } from '@tauri-apps/api/fs'
import { appDir } from '@tauri-apps/api/path'

interface Props {
  authToken: string
  setAuthToken: (authToken: string) => void
}

function Auth({authToken, setAuthToken}: Props) {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [configDir, setConfigDir] = useState('')
  const [authTokenFile, setAuthTokenFile] = useState('')
  const [savedAuthToken, setSavedAuthToken] = useState('')
  const [tokenStatus, setTokenStatus] = useState('Loading authtoken...')

  let ztAuthTokenPath = '/var/lib/zerotier-one/authtoken.secret'
  if (isMacOS()) {
    ztAuthTokenPath = '/Library/Application Support/ZeroTier/One/authtoken.secret'
  } else if (isWindows()) {
    ztAuthTokenPath = '\\ProgramData\\ZeroTier\\One\\authtoken.secret'
  }

  useEffect(() => {
    if (authTokenFile) {
      return
    }

    async function read() {
      const configDir = await appDir()
      setConfigDir(configDir)
      // Normally we'd use the @tauri-apps/api/path.join, but it doesn't seem to work
      const authTokenFile = configDir + 'authtoken.secret'
      setAuthTokenFile(authTokenFile)
    }
    read()
  }, [authTokenFile, setConfigDir, setAuthTokenFile])

  useEffect(() => {
    if (authToken) {
      setTokenStatus('Using loaded authtoken.')
      return
    }

    if (!authTokenFile) {
      return
    }

    async function read() {
      // Normally we'd use the @tauri-apps/api/path.join, but it doesn't seem to work
      try {
        setTokenStatus('Loading authtoken from: ' + authTokenFile)
        const authToken = await readTextFile(authTokenFile)
        if (authToken) {
          setTokenStatus('authtoken loaded from: ' + authTokenFile)
          setAuthToken(authToken)
          return
        }
      } catch (e) {
      }
      setTokenStatus(`authtoken not found. Please copy it from (probably) ${ztAuthTokenPath} to ${authTokenFile}. You'll need administrator permissions to copy that file.`)
    }
    read()
  }, [refreshCounter, ztAuthTokenPath, authTokenFile, authToken, setAuthToken])
  useEffect(() => {
    if (!savedAuthToken || !authTokenFile) {
      return
    }

    async function write() {
      await createDir(configDir, {
        recursive: true
      })
      await writeFile({
        path: authTokenFile,
        contents: savedAuthToken
      })
    }
    write()
  }, [savedAuthToken, authTokenFile, configDir])

  return (
    <>
      <p>
        <button onClick={() => {setAuthToken(''); setRefreshCounter(refreshCounter + 1)}}>
          Reload
        </button>
      </p>
      <p>
        {tokenStatus}
      </p>
      <p>
        Authtoken: <input
          type='text'
          value={authToken}
          placeholder='Enter your ZeroTier authtoken.secret'
          onChange={e => setAuthToken(e.target.value)}
          size={30}
        />
        <button onClick={() => setSavedAuthToken(authToken)} disabled={!authToken || !authTokenFile}>
          Save
        </button>
      </p>
    </>
  )
}

export default Auth
