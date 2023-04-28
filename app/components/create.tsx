'use client'

import { useRef, useState } from 'react'
import { CreateType } from './types'
import JSZip from 'jszip'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

// 画像サイズ
const SIZE_OPTIONS = [
  { ratio: '7:4', width: 896, height: 512 },
  { ratio: '3:2', width: 768, height: 512 },
  { ratio: '5:4', width: 640, height: 512 },
  { ratio: '1:1', width: 512, height: 512 },
  { ratio: '4:5', width: 512, height: 640 },
  { ratio: '2:3', width: 512, height: 768 },
  { ratio: '4:7', width: 512, height: 896 },
]

// 画像生成最大数
const MAX_IMAGE_COUNT = 4

// 画像生成フォーム
const Create = ({ loading, setLoading, setImages }: CreateType) => {
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const negativeRef = useRef<HTMLTextAreaElement>(null)
  const scaleRef = useRef<HTMLInputElement>(null)
  const stepsRef = useRef<HTMLInputElement>(null)
  const seedRef = useRef<HTMLInputElement>(null)
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[3])
  const [size, setSize] = useState(3)
  const [count, setCount] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // 画像生成数変更
  const countHandleChange = (value: number | number[]) => {
    const numValue = value as number
    setCount(numValue)
  }

  // 画像サイズ変更
  const sizeHandleChange = (value: number | number[]) => {
    const numValue = value as number
    setSize(numValue)
    setSelectedSize(SIZE_OPTIONS[numValue])
  }

  // 画像生成
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // ローディング開始
    setLoading(true)
    // エラーメッセージクリア
    setError('')

    // フォームデータ取得
    const prompt = promptRef.current!.value
    const negative = negativeRef.current!.value
    const width = selectedSize.width
    const height = selectedSize.height
    const ratio = selectedSize.ratio
    const scale = parseFloat(scaleRef.current!.value)
    const steps = parseInt(stepsRef.current!.value, 10)
    const seed = parseInt(seedRef.current!.value, 10)

    // シード生成
    const seedList = []
    for (let i = 0; i < count; i++) {
      if (!seed) {
        // シードが指定されていない場合は、ランダムなシードを設定
        seedList.push(Math.floor(Math.random() * 1000000000))
      } else {
        // シードが指定されている場合は、指定されたシードを設定
        seedList.push(seed)
      }
    }

    try {
      const body = {
        prompt,
        negative,
        count,
        width,
        height,
        scale,
        steps,
        seedList,
      }

      // 画像生成API呼び出し
      const response = await fetch('http://localhost:8000/api/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      // 画像生成APIエラー
      if (!response.ok) {
        const errorData = await response.json()
        setError(`画像が生成できませんでした: ${errorData.detail}`)
        setLoading(false)
        return
      }

      // 画像生成API成功
      const zipBlob = await response.blob()
      // zipファイルを解凍
      const zipArrayBuffer = await zipBlob.arrayBuffer()
      // zipファイルを読み込み
      const zip = await JSZip.loadAsync(zipArrayBuffer)

      // 画像データを作成
      const imageDataList = []
      // zipファイル内の画像を取得
      for (const [index, fileName] of Object.entries(Object.keys(zip.files))) {
        // 画像ファイルを取得
        const imageFile = zip.file(fileName)
        // 画像ファイルをblobに変換
        const imageData = await imageFile!.async('blob')
        // blobをURLに変換
        const imageObjectURL = URL.createObjectURL(imageData)

        // 画像データを作成
        imageDataList.push({
          imageSrc: imageObjectURL,
          prompt,
          negative,
          ratio,
          width,
          height,
          seed: seedList[parseInt(index, 10)],
          steps,
        })
      }

      // 画像データをセット
      setImages(imageDataList)
    } catch (error) {
      // 画像生成APIエラー
      alert(error)
    }

    setLoading(false)
  }

  return (
    <>
      <div className="border-b-2 border-blue-100 mb-4 font-bold text-lg">Create</div>

      <form onSubmit={onSubmit}>
        <div className="p-4 rounded-lg bg-[#E6F2FF] shadow">
          {/* プロンプト */}
          <div className="mb-5">
            <div className="font-bold mb-2 text-sm">Prompt</div>
            <textarea
              className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
              rows={3}
              ref={promptRef}
              id="prompt"
              required
            />
          </div>

          {/* ネガティブプロンプト */}
          <div className="mb-5">
            <div className="font-bold mb-2 text-sm">Negative Prompt</div>
            <textarea
              className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
              rows={3}
              ref={negativeRef}
              id="negative"
            />
          </div>

          {/* 画像生成数 */}
          <div className="mb-5">
            <div className="font-bold mb-2 text-sm">Image Count</div>
            <div className="px-2">
              <Slider
                min={1}
                max={MAX_IMAGE_COUNT}
                value={count}
                onChange={countHandleChange}
                trackStyle={{ backgroundColor: 'rgba(29, 78, 216)', height: 4 }}
                handleStyle={{
                  borderColor: 'rgba(29, 78, 216)',
                  borderWidth: 2,
                  backgroundColor: 'rgba(29, 78, 216)',
                  width: 16,
                  height: 16,
                }}
                railStyle={{ backgroundColor: 'rgba(219, 234, 254)', height: 4 }}
              />
            </div>

            <div className="flex justify-between mt-2 text-sm">
              {Array.from({ length: MAX_IMAGE_COUNT }, (_, i) => i + 1).map((data, index) => (
                <div key={index}>{data}</div>
              ))}
            </div>
          </div>

          {/* 画像生成サイズ */}
          <div className="mb-5">
            <div className="flex justify-between">
              <div className="font-bold mb-2 text-sm">Size</div>
              <div className="text-sm">
                {selectedSize.width} x {selectedSize.height}
              </div>
            </div>
            <div className="px-2">
              <Slider
                min={0}
                max={SIZE_OPTIONS.length - 1}
                value={size}
                onChange={sizeHandleChange}
                trackStyle={{ backgroundColor: 'rgba(29, 78, 216)', height: 4 }}
                handleStyle={{
                  borderColor: 'rgba(29, 78, 216)',
                  borderWidth: 2,
                  backgroundColor: 'rgba(29, 78, 216)',
                  width: 16,
                  height: 16,
                }}
                railStyle={{ backgroundColor: 'rgba(219, 234, 254)', height: 4 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              {SIZE_OPTIONS.map((data, index) => (
                <div key={index}>{data.ratio}</div>
              ))}
            </div>
          </div>

          {/* 画像がプロンプトにどれだけ従うか */}
          <div className="mb-5">
            <div className="font-bold mb-2 text-sm">Guidance Scale</div>
            <input
              className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
              type="number"
              step={0.5}
              ref={scaleRef}
              id="scale"
              defaultValue={7.5}
              required
            />
          </div>

          {/* ステップ数 */}
          <div className="mb-5">
            <div className="font-bold mb-2 text-sm">Number of Interface Steps</div>
            <input
              className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
              type="number"
              ref={stepsRef}
              id="steps"
              defaultValue={30}
              required
            />
          </div>

          {/* シード */}
          <div className="mb-5">
            <div className="font-bold mb-2 text-sm">Seed</div>
            <input
              className="w-full border rounded-lg p-2 focus:outline-none bg-gray-50 focus:bg-white"
              type="number"
              ref={seedRef}
              id="seed"
            />
          </div>

          {/* エラーメッセージ */}
          {error && <div className="text-red-500 text-center mb-5">{error}</div>}

          {/* ボタン */}
          <div>
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
              disabled={loading}
            >
              <div className="flex items-center justify-center space-x-3">
                {loading && (
                  <div className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent" />
                )}
                <div>Generate</div>
              </div>
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default Create
