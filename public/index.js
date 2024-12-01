const form = document.getElementById('upload-form');
const itemListDiv = document.getElementById('item-list');

form.addEventListener('submit', async (event) => {
	event.preventDefault();

	const formData = new FormData(form);
	try {
		const response = await fetch('/api/ocr', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error(`Failed to process receipt: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.items && data.items.length > 0) {
			hydrateList(data.items);
		} else {
			itemListDiv.innerHTML = '<p>No items detected</p>';
		}
	} catch (error) {
		itemListDiv.innerHTML = `<p>Error: ${error.message}</p>`;
	}
});

const hydrateList = (items) => {
	itemListDiv.innerHTML =
		'<ul>' +
		items
			.map((item) => `<li>${item.name}: £${item.price.toFixed(2)}</li>`)
			.join('') +
		'</ul>';
};
