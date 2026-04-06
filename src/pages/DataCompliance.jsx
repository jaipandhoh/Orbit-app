import React from 'react';

export default function DataCompliance() {
  return (
    <div className="min-h-screen bg-[#070a17] text-gray-300 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="mb-12 border-b border-indigo-500/20 pb-8">
          <button 
            onClick={() => window.history.back()} 
            className="text-indigo-400 hover:text-indigo-300 mb-6 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            &larr; Back
          </button>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Data Compliance & Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: April 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
          <p className="leading-relaxed">
            At Orbit, we take your privacy and data security seriously. This Data Compliance & Privacy Policy explains how we collect, use, process, and protect your personal data in compliance with standard global privacy regulations (e.g., GDPR, CCPA).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
          <p className="leading-relaxed">
            We collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Data:</strong> Email addresses, names, and authentication credentials.</li>
            <li><strong>Workspace Data:</strong> Campaigns, deliverables, contacts, and images uploaded by your team.</li>
            <li><strong>Usage Data:</strong> Analytics on how you interact with Orbit to improve our service.</li>
            <li><strong>Device Information:</strong> Browser type, IP addresses, and operating system.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. How We Use Your Data</h2>
          <p className="leading-relaxed">
            We use your data solely to provide and improve the Orbit service constraint to your workspace. This includes:
            authenticating your login, rendering your dashboards, executing your workflows, and processing your campaign approvals.
            We do not sell your personal data or your company's campaign data to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
          <p className="leading-relaxed">
            We implement industry-standard security measures, including encryption at rest and in transit, to protect your personal and company data from unauthorized access, disclosure, or alteration.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Third-Party Integrations</h2>
          <p className="leading-relaxed">
            If you connect third-party platforms (like generative AI models) to Orbit, we share only the strictly necessary data prompted by you. Please review those platforms' respective privacy policies to understand how they process your data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Your Rights</h2>
          <p className="leading-relaxed">
            Depending on your jurisdiction, you have the right to access, rectify, port, and delete your personal data. You may also be able to object to its processing. To exercise these rights, please contact us or use the account deletion tools provided within Orbit.
          </p>
        </section>

        <section className="space-y-4 mt-12 pt-8 border-t border-indigo-500/20">
          <p className="text-sm text-gray-500 text-center">
            If you have any questions about this Data Compliance Policy, please contact our support team.
          </p>
        </section>
      </div>
    </div>
  );
}
