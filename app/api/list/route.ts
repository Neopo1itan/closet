import { readdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

interface ClothesResponse {
	top: string[]
	pants: string[]
	topCount: number
	pantsCount: number
}

export async function GET(): Promise<NextResponse<ClothesResponse>> {
	const base = '/assets'
	const topDir = join(process.cwd(), 'public', 'assets', 'top')
	const pantsDir = join(process.cwd(), 'public', 'assets', 'pants')

	const topFiles = await readdir(topDir)
	const pantsFiles = await readdir(pantsDir)

	return NextResponse.json({
		top: topFiles.map((f) => `${base}/top/${f}`),
		pants: pantsFiles.map((f) => `${base}/pants/${f}`),
		topCount: topFiles.length,
		pantsCount: pantsFiles.length,
	})
}
