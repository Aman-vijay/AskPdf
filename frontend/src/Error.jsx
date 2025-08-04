import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <h1 className="text-red-500 text-6xl font-bold mb-2">404</h1>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>
                
                <Link 
                    to="/" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default Error;