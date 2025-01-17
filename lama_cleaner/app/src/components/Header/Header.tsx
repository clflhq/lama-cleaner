import { FolderIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { PlayIcon } from '@radix-ui/react-icons'
import React, { useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  enableFileManagerState,
  fileState,
  isInpaintingState,
  isSDState,
  maskState,
  runManuallyState,
  showFileManagerState,
} from '../../store/Atoms'
import Button from '../shared/Button'
import Shortcuts from '../Shortcuts/Shortcuts'
import { ThemeChanger } from './ThemeChanger'
import SettingIcon from '../Settings/SettingIcon'
import PromptInput from './PromptInput'
import CoffeeIcon from '../CoffeeIcon/CoffeeIcon'
import emitter, { EVENT_CUSTOM_MASK } from '../../event'
import { useImage } from '../../utils'
import useHotKey from '../../hooks/useHotkey'

const Header = () => {
  const isInpainting = useRecoilValue(isInpaintingState)
  const [file, setFile] = useRecoilState(fileState)
  const [mask, setMask] = useRecoilState(maskState)
  const [maskImage, maskImageLoaded] = useImage(mask)
  const [uploadElemId] = useState(`file-upload-${Math.random().toString()}`)
  const [maskUploadElemId] = useState(`mask-upload-${Math.random().toString()}`)
  const isSD = useRecoilValue(isSDState)
  const runManually = useRecoilValue(runManuallyState)
  const [openMaskPopover, setOpenMaskPopover] = useState(false)
  const [showFileManager, setShowFileManager] =
    useRecoilState(showFileManagerState)
  const enableFileManager = useRecoilValue(enableFileManagerState)

  useHotKey(
    'f',
    () => {
      if (enableFileManager && !isInpainting) {
        setShowFileManager(!showFileManager)
      }
    },
    {},
    [showFileManager, enableFileManager, isInpainting]
  )

  const renderHeader = () => {
    return (
      <header>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {enableFileManager ? (
            <Button
              icon={<FolderIcon />}
              style={{ border: 0 }}
              toolTip="ファイルマネージャーを開く"
              disabled={isInpainting}
              onClick={() => {
                setShowFileManager(true)
              }}
            />
          ) : (
            <></>
          )}

          <label htmlFor={uploadElemId}>
            <Button
              icon={<PhotoIcon />}
              style={{ border: 0, gap: 0 }}
              disabled={isInpainting}
              toolTip="画像をアップロードする"
            >
              <input
                style={{ display: 'none' }}
                id={uploadElemId}
                name={uploadElemId}
                type="file"
                onChange={ev => {
                  const newFile = ev.currentTarget.files?.[0]
                  if (newFile) {
                    setFile(newFile)
                  }
                }}
                accept="image/png, image/jpeg"
              />
            </Button>
          </label>

          <div
            style={{
              visibility: file ? 'visible' : 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <PopoverPrimitive.Root open={openMaskPopover}>
              <PopoverPrimitive.Trigger
                className="btn-primary side-panel-trigger"
                onMouseEnter={() => setOpenMaskPopover(true)}
                onMouseLeave={() => setOpenMaskPopover(false)}
                style={{
                  visibility: mask ? 'visible' : 'hidden',
                  outline: 'none',
                }}
                onClick={() => {
                  if (mask) {
                    emitter.emit(EVENT_CUSTOM_MASK, { mask })
                  }
                }}
              >
                <PlayIcon />
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                  style={{
                    outline: 'none',
                  }}
                >
                  {maskImageLoaded ? (
                    <img
                      src={maskImage.src}
                      alt="mask"
                      className="mask-preview"
                    />
                  ) : (
                    <></>
                  )}
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
          </div>
        </div>

        {isSD && file ? <PromptInput /> : <></>}
      </header>
    )
  }
  return renderHeader()
}

export default Header
