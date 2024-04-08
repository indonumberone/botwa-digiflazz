// Inisialisasi objek kosong
const testResponses = {};

// Menambahkan data ke objek dengan kunci string
const refId = 'rWFo4VC';
const data = {status: 'completed', amount: 100};
testResponses[refId] = data;

// Mengakses data menggunakan kunci string
console.log(testResponses['rWFo4VC']); // Output: { status: 'completed', amount: 100 }
