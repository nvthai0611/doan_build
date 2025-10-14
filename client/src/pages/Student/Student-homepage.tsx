"use client"

export default function     StudentHomepage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Student Homepage</h1>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Welcome, [Student Name]</h2>
        <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your classes:</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold">Class 1</h3>
          <p className="text-sm text-gray-500">Assignment due: 10/15/2025</p>
        </div>
      </div>
    </div>
  )
} 