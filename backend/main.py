from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from zipfile import ZipFile
from fastapi import HTTPException

import service
import io

# FastAPI
app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ルート
@app.get("/")
async def root():
    return {"message": "Hello World"}


# 型定義
class PayloadType(BaseModel):
    prompt: str
    negative: str
    count: int
    width: int
    height: int
    scale: float
    steps: int
    seedList: list


# 画像生成
@app.post("/api/generate/")
async def generate(payload: PayloadType):
    try:
        # 画像生成
        images = await service.generate_image(payload)
        # バイトデータを格納するバッファを作成
        # このバッファに圧縮された画像ファイルが保存
        zip_buffer = io.BytesIO()

        # ZIPファイルを作成、wモードでファイルに書き込みが可能
        with ZipFile(zip_buffer, "w") as zip_file:
            # 生成された画像のリストをループ
            for i, image in enumerate(images):
                # 画像データを一時的に保存するためのバッファを作成
                memory_stream = io.BytesIO()
                # 画像データをmemory_streamにPNG形式で保存
                image.save(memory_stream, format="png")
                # バッファの位置を先頭に戻す
                # 次の操作でバッファのデータを正しく読み出すことができる
                memory_stream.seek(0)
                # ZIPファイルに画像データを書き込む
                zip_file.writestr(f"image_{i}.png", memory_stream.getvalue())
        # バッファを先頭に戻す
        zip_buffer.seek(0)

        # StreamingResponseを返すことで、バッファに保存された圧縮された画像ファイルをダウンロードできる
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=images.zip"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
