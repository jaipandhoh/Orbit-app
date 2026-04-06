import React from 'react';

export default function TermsOfUse() {
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
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Terms of Use</h1>
          <p className="text-sm text-gray-500">Last updated: April 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing or using Orbit ("we", "our", or "us"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, and we will notify you of any material changes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Use of Service</h2>
          <p className="leading-relaxed">
            Orbit provides a collaborative workspace for PR and Campaign Intelligence. You must:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate information when creating an account.</li>
            <li>Maintain the security of your account credentials.</li>
            <li>Use the service only for lawful purposes.</li>
            <li>Not interfere with the proper functioning of the platform.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Intellectual Property</h2>
          <p className="leading-relaxed">
            All content, features, and functionality of Orbit—including but not limited to text, graphics, logos, and software—are the exclusive property of Orbit or its licensors. You retain ownership of any data, campaigns, and files you upload to your workspace.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. User Content</h2>
          <p className="leading-relaxed">
            You represent and warrant that you own or have the necessary rights to use all content you upload or create using Orbit. You are solely responsible for the legality, reliability, and appropriateness of your content.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Termination</h2>
          <p className="leading-relaxed">
            We may terminate or suspend your account and access to the service immediately, without prior notice or liability, if you breach any of these Terms. Upon termination, your right to use the service will immediately cease.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Limitation of Liability</h2>
          <p className="leading-relaxed">
            In no event shall Orbit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
        </section>
      </div>
    </div>
  );
}
