const fs=require('fs');
const pdfParse=require('pdf-parse');

const pdfPath='./Hrithik_CV.pdf';



// let extract text from the pdf
async function Extractionfrompdf(){
    try{
        const pdfbuffer=fs.readFileSync(pdfPath);
        console.log('PDF file read successfully');
        const textextracted=await pdfParse(pdfbuffer);
        console.log('Text extracted successfully',textextracted.text);
        console.log("text extracted Length:",textextracted.text.length);

    }catch(error){
        console.error('Error extracting text from PDF:',error);
    }
}

Extractionfrompdf();