export type imagesType = {
  imageSrc: string
  prompt: string
  negative: string
  ratio: string
  width: number
  height: number
  seed: number
  steps: number
}

export type CreateType = {
  loading: boolean
  setLoading: (loading: boolean) => void
  setImages: (images: imagesType[]) => void
}

export type GenerateType = {
  loading: boolean
  images: imagesType[] | null
  setModalData: (data: imagesType) => void
  setModalOpen: (isOpen: boolean) => void
}

export type ModalProps = {
  isOpen: boolean
  closeModal: () => void
  modalData: imagesType
}
