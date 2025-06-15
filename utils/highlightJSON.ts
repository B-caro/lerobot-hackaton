export function highlightJSON(data: unknown): string {
  let json: string;

  try {
    json = typeof data === 'string' ? JSON.stringify(JSON.parse(data), null, 2) : JSON.stringify(data, null, 2);
  } catch {
    json = String(data);
  }

  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-yellow-600 dark:text-yellow-400'; // default string

      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-700 dark:text-blue-400'; // key
        } else {
          cls = 'text-green-700 dark:text-green-400'; // string value
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-pink-600 dark:text-pink-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-gray-500 italic dark:text-gray-400'; // null
      } else {
        cls = 'text-purple-700 dark:text-purple-400'; // number
      }

      return `<span class="${cls}">${match}</span>`;
    }
  );
}
