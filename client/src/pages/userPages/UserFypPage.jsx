import React from "react";

const UserFypPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LoveConnect FYP</h1>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
            Edit Preferences
          </button>
        </div>
      </header> */}

      <main className="container mx-auto py-8">
        {/* Section: Greeting */}
        <section className="mb-8">
         
        <div className="container mx-auto flex justify-between items-center">
        <div>
        <h2 className="text-3xl font-bold text-gray-800">Welcome, User!</h2>
          <p className="text-gray-600 text-lg">
            Here are some recommendations just for you.
          </p>
        </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
            Edit Preferences
          </button>
        </div>
        </section>

        {/* Section: Content Feed */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example FYP Cards */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={`https://via.placeholder.com/400x200?text=Recommendation+${index +
                  1}`}
                alt={`Recommendation ${index + 1}`}
                className="rounded-lg mb-4 w-full h-40 object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Recommendation {index + 1}
              </h3>
              <p className="text-gray-600">
                Discover exciting opportunities and connections that match your
                interests.
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg w-full">
                View Details
              </button>
            </div>
          ))}
        </section>

        {/* Section: Call to Action */}
        <section className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Want to see more?
          </h2>
          <button className="px-6 py-3 bg-pink-600 text-white text-lg font-semibold rounded-lg">
            Load More
          </button>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 LoveConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserFypPage;
