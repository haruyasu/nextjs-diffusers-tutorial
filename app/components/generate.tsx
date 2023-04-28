'use client'

import { imagesType, GenerateType } from './types'
import Image from 'next/image'

// 画像表示
const Generate = ({ loading, images, setModalData, setModalOpen }: GenerateType) => {
  // モーダル表示
  const openModal = (data: imagesType) => {
    setModalData(data)
    setModalOpen(true)
  }

  return (
    <>
      <div className="border-b-2 border-blue-100 mb-4 font-bold text-lg">Generation</div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
        </div>
      ) : images ? (
        <div className="grid grid-cols-2 gap-1">
          {images.map((data, index) => (
            <div key={index} className="cursor-pointer" onClick={() => openModal(data)}>
              <Image
                src={data.imageSrc}
                className="object-cover rounded-lg"
                alt="image"
                width={740}
                height={740}
              />
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export default Generate
