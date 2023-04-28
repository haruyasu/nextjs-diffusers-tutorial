'use client'

import { useState } from 'react'
import { imagesType } from './types'

import Create from './create'
import Generate from './generate'
import Modal from './modal'

const testImages: imagesType[] = [
  {
    imageSrc: 'https://placehold.jp/512x512.png',
    prompt: 'test prompt1',
    negative: 'test negative prompt1',
    width: 512,
    height: 512,
    ratio: '1:1',
    steps: 30,
    seed: 1,
  },
  {
    imageSrc: 'https://placehold.jp/512x512.png',
    prompt: 'test prompt2',
    negative: 'test negative prompt2',
    width: 512,
    height: 512,
    ratio: '1:1',
    steps: 30,
    seed: 1,
  },
]

// メイン
const Main = () => {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<imagesType[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<imagesType | null>(null)

  // モーダルを閉じる
  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* モーダル */}
      {modalData && <Modal isOpen={modalOpen} closeModal={closeModal} modalData={modalData} />}

      <div className="col-span-2">
        {/* 画面生成フォーム */}
        <Create loading={loading} setLoading={setLoading} setImages={setImages} />
      </div>

      <div className="col-span-3">
        {/* 生成画像 */}
        <Generate
          loading={loading}
          images={images}
          setModalData={setModalData}
          setModalOpen={setModalOpen}
        />
      </div>
    </div>
  )
}

export default Main
