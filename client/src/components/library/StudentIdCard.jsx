import React from 'react';

const StudentIdCard = ({
  student = {
    name: 'Abhay Meena',
    fatherName: 'Santosh Meena',
    course: 'BCA',
    mobile: '8305750480',
    batch: '2025-28',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=8305750480',
    principalSignUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Signature_placeholder.svg' // Placeholder signature
  }
}) => {
  return (
    <div className="flex items-center justify-center p-8 bg-gray-100 min-h-screen">
      {/* ID Card Container */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
        style={{ width: '500px', height: '315px' }}
      >
        {/* Right Edge Decoration */}
        <div className="absolute right-0 top-1/4 h-1/2 w-4 bg-[#a73838] rounded-l-full opacity-80"></div>
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-gray-100">
          {/* Left Logo */}
          <div className="flex flex-col items-center w-1/5">
            <div className="flex items-end font-black tracking-tighter">
              <span className="text-orange-500 text-2xl leading-none">T</span>
              <span className="text-green-500 text-2xl leading-none">E</span>
              <span className="text-teal-500 text-2xl leading-none">C</span>
            </div>
            <span className="text-[6px] text-gray-500 font-bold whitespace-nowrap mt-0.5">IT Excellence Group</span>
          </div>
          
          {/* Center Text */}
          <div className="flex flex-col items-center justify-center w-3/5 text-center">
            <h1 className="text-[#a73838] text-[13px] font-bold leading-tight">Sant Singaji Institute of Science & Management</h1>
            <p className="text-[7px] text-gray-500 font-medium leading-tight mt-0.5">
              NH-59A, Indore - Harda Rd. Sandalpur Dist. Dewas (M.P.)
            </p>
            <p className="text-[7px] text-gray-500 font-medium leading-tight">
              Ph: 9229344439, 909090...
            </p>
          </div>
          
          {/* Right Logo */}
          <div className="w-1/5 flex justify-end">
            <div className="w-10 h-10 rounded-full bg-[#a73838] flex items-center justify-center text-white border-2 border-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="flex flex-1 px-4 py-3 bg-white relative z-10">
          {/* Photo Column */}
          <div className="w-[110px] flex-shrink-0 flex flex-col items-center">
            <div className="w-[100px] h-[120px] bg-orange-50 rounded-md border-2 border-orange-100 overflow-hidden shadow-inner">
              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Details Column */}
          <div className="flex-1 pl-4 flex flex-col">
            <div className="flex items-center mb-2">
              <span className="text-[#a73838] mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-gray-800 font-extrabold text-sm w-24">Batch -</span>
              <span className="text-gray-900 font-extrabold text-sm">{student.batch}</span>
            </div>
            
            <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-[11px] font-bold text-[#a73838] mt-1">
              <div>Name</div>
              <div className="text-gray-800 font-bold">{student.name}</div>
              
              <div>Father Name</div>
              <div className="text-gray-800 font-bold">{student.fatherName}</div>
              
              <div>Class</div>
              <div className="text-gray-800 font-bold">{student.course}</div>
              
              <div>Mobile</div>
              <div className="text-gray-800 font-bold">{student.mobile}</div>
            </div>
            
            {/* Signature Box */}
            <div className="mt-auto border border-[#a73838] rounded flex items-center justify-between px-2 py-1 w-[200px] h-[30px]">
              <span className="text-[9px] text-[#a73838] font-bold">Principal Sign |</span>
              <img src={student.principalSignUrl} alt="Signature" className="h-6 opacity-80" />
            </div>
          </div>
          
          {/* QR Code Column */}
          <div className="w-[80px] flex flex-col justify-end items-end pb-2">
            <div className="w-[70px] h-[70px] bg-white p-1 border border-gray-200 rounded">
              <img src={student.qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-[#a73838] text-white text-[9px] font-medium py-1.5 px-4 text-center tracking-wide flex justify-center space-x-1.5">
          <span>Caring</span>
          <span className="opacity-70">|</span>
          <span>Learning & Skills</span>
          <span className="opacity-70">|</span>
          <span>Transparency</span>
          <span className="opacity-70">|</span>
          <span>Professionalism</span>
          <span className="opacity-70">|</span>
          <span>Simplicity</span>
        </div>
        
      </div>
    </div>
  );
};

export default StudentIdCard;
