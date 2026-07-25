const response = await fetch("/wiki.html");
if (!response.ok) throw new Error(`Wiki shell failed to load: ${response.status}`);

const source = await response.text();
const parsed = new DOMParser().parseFromString(source, "text/html");
document.body.innerHTML = parsed.body.innerHTML;

await import("/src/wiki.js");
