import React from 'react'

function PasteJobDescription() {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-xl font-bold'>Paste Job Description Here to Generate a Tailor Master</h1>
        <textarea className=' border-2 border-gray-300 rounded-md p-2'/>
    </div>
  )
}

export default PasteJobDescription