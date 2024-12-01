import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import Tesseract from 'tesseract.js';

const app = new Hono();

function parseReceiptText(text: string) {
	const lines = text.split('\n');
	const items = [];
	const itemRegex = /^(.+?)\s+£?(\d+\.\d{2})$/;

	for (const line of lines) {
		const match = line.match(itemRegex);
		if (match) {
			items.push({
				name: match[1].trim(),
				price: parseFloat(match[2]),
			});
		}
	}

	return items;
}

app.use('/api/*', cors());

// app.use('/*', serveStatic({ root: './public' }));

app.post('/api/ocr', async (c) => {
	try {
		const body = await c.req.parseBody();
		const file = body.receipt;

		if (!file || !(file instanceof File)) {
			return c.json({ error: 'No valid file uploaded' }, 400);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const { data } = await Tesseract.recognize(buffer, 'eng');
		const items = parseReceiptText(data.text);

		return c.json({ items });
	} catch (error) {
		if (error instanceof Error) {
			return c.json(
				{ error: 'Failed to process image', details: error.message },
				500
			);
		}
	}
});

export default app;
