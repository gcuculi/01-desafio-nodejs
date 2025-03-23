
import fs from 'node:fs';
import { parse } from 'csv-parse';

const csvPath = new URL('./tasks.csv', import.meta.url);

const stream = fs.createReadStream(csvPath);

const csvFile = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2 // starts in second row, skip the first because it is the header
});

async function processingCsvFile() {
  const rows = stream.pipe(csvFile);

  for await (const row of rows) {
    const [ title, description ] = row;

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        title, 
        description, 
      })
    })
  }
}

processingCsvFile()
