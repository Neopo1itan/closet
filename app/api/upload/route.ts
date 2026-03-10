import { writeFile, readdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'
import { extname } from 'path'

// 配置 Next.js 不解析 body
export const dynamic = 'force-dynamic'

// 处理上传 POST 请求
export async function POST(req: Request) {
	try {
		// 读取原始请求体
		const formData = await req.formData()

		// 从 formData 中获取文件
		const file = formData.get('file') as File | null
		const type = formData.get('type') as string // top / pants / match
		const customFileName = formData.get('fileName') as string | null
		const currentCount = formData.get('currentCount') as string | null

		if (!file || !type) {
			return NextResponse.json(
				{ success: false, error: 'Missing file or type' },
				{ status: 400 }
			)
		}

		// 生成文件名
		let fileName: string
		if (type === 'match' && customFileName) {
			fileName = `${customFileName}.jpg`
		} else if (type === 'top' || type === 'pants') {
			// 上装和下装使用当前数量+1作为文件名
			const count = currentCount ? parseInt(currentCount, 10) + 1 : 1
			const ext = extname(file.name)
			fileName = `${count}${ext}`
		} else {
			fileName = `${Date.now()}-${file.name}`
		}

		const savePath = join(process.cwd(), 'public', 'assets', type, fileName)

		// 将 File 转换为 Buffer
		const arrayBuffer = await (file as unknown as Blob).arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		// 写入文件
		await writeFile(savePath, buffer)

		return NextResponse.json({ success: true, path: `/assets/${type}/${fileName}`, fileName })
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		)
	}
}
