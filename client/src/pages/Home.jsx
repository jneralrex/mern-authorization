import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to LoveConnect</h1>
        <p className="text-xl text-gray-600 mb-12">Your journey to finding love starts here. Join thousands of singles who are looking for meaningful connections.</p>

        {/* Section 1: About the Dating Site */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Why LoveConnect?</h2>
            <p className="text-gray-600 mb-4">At LoveConnect, we match people based on shared values, interests, and goals. We believe in creating real connections and meaningful relationships.</p>
            <ul className="text-left text-gray-600">
              <li>💖 Safe and secure platform</li>
              <li>🌍 Meet singles near you or globally</li>
              <li>🧑‍🤝‍🧑 Match based on interests and values</li>
              <li>💬 Private messaging and video chat</li>
            </ul>
          </div>

          <div className="relative">
            <img
              src="https://via.placeholder.com/500x300/0000FF/808080?text=Dating+Image"
              alt="Couple meeting"
              className="rounded-lg shadow-md w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50 rounded-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg font-semibold">
              <p>Find your perfect match today</p>
            </div>
          </div>
        </section>

        {/* Section 2: Featured Matches */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Featured Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://via.placeholder.com/300x200/FF6347/FFFFFF?text=F"
                alt="User"
                className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">Jane Doe</h3>
              <p className="text-gray-600">25, New York</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">View Profile</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://via.placeholder.com/300x200/32CD32/FFFFFF?text=M"
                alt="User"
                className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">John Smith</h3>
              <p className="text-gray-600">28, California</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">View Profile</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://via.placeholder.com/300x200/FFD700/FFFFFF?text=F"
                alt="User"
                className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">Alexandra Lee</h3>
              <p className="text-gray-600">30, Texas</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">View Profile</button>
            </div>
          </div>
        </section>

        {/* Section 3: Call to Action */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ready to find your match?</h2>
          <p className="text-lg text-gray-600 mb-6">Sign up today and start meeting singles in your area!</p>
          <Link to="signup">
            <button className="px-6 py-3 bg-pink-600 text-white text-lg font-semibold rounded-lg">
              Join Now
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Home;
