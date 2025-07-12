import React from 'react';

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
            <h1 className="flex justify-center">About Page</h1>
            <div className="flex justify-center items-center h-64 w-2xl bg-gray-100 p-4 rounded-lg shadow-md">
                <p>&#39;Welcome to CS Logan Publishing! We&#39;re passionate about storytelling and helping authors share their vision with the world. Whether you&#39;re a seasoned reader or new to independent works,
                    we aim to offer something meaningful, beautifully written, and uniquely crafted.&#39;
                </p>
            </div>

        </div>
    );
}