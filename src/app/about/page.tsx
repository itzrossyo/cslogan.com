import React from 'react';
import { BookOpen } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            <div className="max-w-4xl mx-auto px-6 py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-6">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        About Us
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto"></div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <div className="prose prose-lg max-w-none">
                        <p className="text-xl text-slate-700 leading-relaxed mb-6">
                            Welcome to <span className="font-semibold text-green-500">CS</span>Logan Publishing!
                            We&#39;re passionate about storytelling and helping authors share their vision with the world.
                        </p>

                        <p className="text-lg text-slate-600 leading-relaxed">
                            Whether you&#39;re a seasoned reader or new to independent works, we aim to offer something
                            meaningful, beautifully written, and uniquely crafted. Every book we publish is carefully
                            selected to bring you stories that inspire, challenge, and transport you to new worlds.
                        </p>
                    </div>
                </div>

                {/* Simple footer accent */}
                <div className="text-center mt-12">
                    <p className="text-slate-500 italic">
                        &quot;Where stories come alive&quot;
                    </p>
                </div>
            </div>
        </div >
    );
}