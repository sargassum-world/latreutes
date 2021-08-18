import React, { useState, useEffect } from 'react'
import { createDir, readTextFile, writeFile } from '@tauri-apps/api/fs'
import { appDir } from '@tauri-apps/api/path'

interface Props {
  authToken: string
  setAuthToken: (authToken: string) => void
}

function Auth({authToken, setAuthToken}: Props) {
  const [configDir, setConfigDir] = useState('')
  const [authTokenFile, setAuthTokenFile] = useState('')
  const [savedAuthToken, setSavedAuthToken] = useState('')
  const [tokenStatus, setTokenStatus] = useState('Loading authtoken...')

  useEffect(() => {
    if (authToken) {
      setTokenStatus('Using loaded authtoken.')
      return
    }

    async function read() {
      const configDir = await appDir()
      setConfigDir(configDir)
      // Normally we'd use the @tauri-apps/api/path.join, but it doesn't seem to work
      const authTokenFile = configDir + 'authtoken.secret'
      setAuthTokenFile(authTokenFile)
      try {
        setTokenStatus('Loading authtoken from: ' + authTokenFile)
        const authToken = await readTextFile(authTokenFile)
        if (authToken) {
          setTokenStatus('authtoken loaded from: ' + authTokenFile)
          setAuthToken(authToken)
        } else {
          setTokenStatus('authtoken not found. Please copy it to: ' + authTokenFile)
        }
      } catch (e) {
        setTokenStatus('authtoken not found. Please copy it to: ' + authTokenFile)
      }
    }
    read()
  }, [authTokenFile, authToken, setAuthToken])
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
