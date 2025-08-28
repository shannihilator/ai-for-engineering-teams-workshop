'use client';

import { Suspense } from 'react';

// Dynamic component imports with error boundaries
const CustomerSelectorDemo = () => {
  try {
    // Try to import CustomerSelector - this will work after Exercise 4
    const { CustomerSelector } = require('../components/CustomerSelector');
    
    if (CustomerSelector) {
      return (
        <CustomerSelector 
          onCustomerSelect={(customer: any) => {
            console.log('Selected customer:', customer);
          }}
        />
      );
    }
  } catch (error) {
    // Component doesn't exist yet
  }
  
  return (
    <div className="text-gray-500 text-sm">
      After Exercise 4, your CustomerSelector component will appear here with search and selection functionality.
    </div>
  );
};

const DashboardWidgetDemo = ({ widgetName, exerciseNumber }: { widgetName: string, exerciseNumber: number }) => {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
      {widgetName}
      <br />
      <span className="text-xs">Exercise {exerciseNumber}</span>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Customer Intelligence Dashboard
        </h1>
        <p className="text-gray-600">
          AI for Engineering Teams Workshop - Your Progress
        </p>
      </header>

      {/* Progress Indicator */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Workshop Progress</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✅ Setup Complete - Next.js app is running</p>
          <p>✅ Exercise 3: CustomerCard component implemented</p>
          <p>✅ Exercise 4: CustomerSelector component implemented</p>
          <p className="text-gray-400">⏳ Exercise 5: Domain Health widget</p>
          <p className="text-gray-400">⏳ Exercise 9: Production-ready features</p>
        </div>
      </div>

      {/* Component Showcase Area */}
      <div className="space-y-8">
        {/* CustomerSelector Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">CustomerSelector Component</h3>
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <CustomerSelectorDemo />
          </Suspense>
        </section>

        {/* Dashboard Widgets Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Dashboard Widgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardWidgetDemo widgetName="Domain Health Widget" exerciseNumber={5} />
            <DashboardWidgetDemo widgetName="Market Intelligence" exerciseNumber={6} />
            <DashboardWidgetDemo widgetName="Predictive Alerts" exerciseNumber={8} />
          </div>
        </section>

        {/* Getting Started */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Start Building?</h3>
          <p className="text-blue-800 mb-4">
            Follow along with the workshop exercises to see this dashboard come to life with AI-generated components.
          </p>
          <div className="text-sm text-blue-700">
            <p className="mb-1"><strong>Next:</strong> Exercise 1 - Create your first specification</p>
            <p className="mb-1"><strong>Then:</strong> Exercise 3 - Generate your first component</p>
            <p className="text-xs text-blue-600">💡 Tip: Refresh this page after completing exercises to see your progress!</p>
          </div>
        </section>
      </div>
    </div>
  );
}
