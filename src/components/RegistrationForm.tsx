import React from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { track } from '../lib/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBOA-yFtuYmdVjAa9xoj7UeqBfUsQ5iSss",
  authDomain: "sav-public-school.firebaseapp.com",
  databaseURL: "https://sav-public-school-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "sav-public-school",
  storageBucket: "sav-public-school.appspot.com",
  messagingSenderId: "166292915984",
  appId: "1:166292915984:web:aa5f0b6c5efc672e690795",
  measurementId: "G-C8617DEWSF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function RegistrationForm() {
  const formRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        track('registration_form_viewed');
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      studentName: (document.getElementById("studentName") as HTMLInputElement).value,
      dob: (document.getElementById("dob") as HTMLInputElement).value,
      class: (document.getElementById("class") as HTMLSelectElement).value,
      parentName: (document.getElementById("parentName") as HTMLInputElement).value,
      phone: (document.getElementById("phone") as HTMLInputElement).value,
      email: (document.getElementById("email") as HTMLInputElement)?.value || null,
      address: (document.getElementById("address") as HTMLTextAreaElement).value,
    };

    const timestamp = new Date().toISOString().replace(/\./g, '-').replace(/:/g, '-');
    const reference = ref(db, 'registrations/' + timestamp);
    
    try {
      await set(reference, formData);
      track('registration_submitted', { class_applied: formData.class, has_email: !!formData.email, success: true });
      alert('Registration submitted successfully!');
    } catch (error) {
      console.error("Error:", error);
      track('registration_submitted', { class_applied: formData.class, has_email: !!formData.email, success: false });
      alert('Failed to submit registration.');
    }
  };

  return (
    <div ref={formRef} className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-semibold mb-6">Register Now</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
              Student's Name*
            </label>
            <input
              type="text"
              id="studentName"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth*
            </label>
            <input
              type="date"
              id="dob"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
            Applying for Class*
          </label>
          <select
            id="class"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select Class</option>
            <option value="playgroup">Playgroup</option>
            <option value="nursery">Nursery</option>
            <option value="kg">KG</option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={`class${i + 1}`}>
                Class {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
              Parent's Name*
            </label>
            <input
              type="text"
              id="parentName"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number*
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address*
          </label>
          <textarea
            id="address"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            required
          ></textarea>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              required
            />
            <span className="text-sm text-gray-700">I agree to the terms and conditions</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Submit Registration
        </button>
      </form>
    </div>
  );
}
