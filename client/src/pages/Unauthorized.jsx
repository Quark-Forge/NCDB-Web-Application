const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-2xl">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Unauthorized</h2>
        <p className="mt-2 text-gray-600">
          You don’t have permission to access this page.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
