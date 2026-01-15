export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Your Perfect Flight
        </h1>
        <p className="text-gray-600">
          Search hundreds of airlines and compare prices instantly
        </p>
      </div>

      {/* Search form will go here */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-500 text-center">Search form</p>
      </div>

      {/* Results section will go here */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-center">Filters</p>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <p className="text-gray-500 text-center">Price graph</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-center">Flight results</p>
          </div>
        </div>
      </div>
    </div>
  );
}
