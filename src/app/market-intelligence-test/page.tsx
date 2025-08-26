'use client';

import React from 'react';
import { MarketIntelligenceWidget } from '../../components/MarketIntelligenceWidget';

/**
 * Test page for Market Intelligence Widget
 * Demonstrates the complete implementation with sample data
 */
export default function MarketIntelligenceTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Market Intelligence Widget Test
          </h1>
          <p className="text-gray-600">
            Testing the complete Market Intelligence Widget implementation with API integration and caching.
          </p>
        </div>

        {/* Widget Test - Empty State */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Empty State Test
          </h2>
          <MarketIntelligenceWidget />
        </div>

        {/* Widget Test - Pre-populated */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pre-populated Test (Tesla)
          </h2>
          <MarketIntelligenceWidget
            companyName="Tesla"
            onAnalysisComplete={(data) => {
              console.log('Analysis completed:', data);
            }}
          />
        </div>

        {/* Widget Test - With Callback */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Callback Test (Microsoft)
          </h2>
          <MarketIntelligenceWidget
            companyName="Microsoft"
            onAnalysisComplete={(data) => {
              alert(`Analysis completed for ${data.company}: ${data.sentiment.label} sentiment (${Math.round(data.sentiment.confidence * 100)}% confidence)`);
            }}
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Test Instructions
          </h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Empty State:</strong> Enter any company name (e.g., Apple, Google, Amazon) and click &quot;Analyze Market&quot;</p>
            <p><strong>2. Pre-populated:</strong> Tesla is pre-filled - just click &quot;Analyze Market&quot;</p>
            <p><strong>3. Callback Test:</strong> Microsoft is pre-filled with an alert callback - test the callback functionality</p>
            <p><strong>4. Error Testing:</strong> Try invalid inputs like special characters or very long strings</p>
            <p><strong>5. Caching:</strong> Repeat the same company analysis to test 10-minute cache behavior</p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Technical Implementation Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">API Layer</h3>
              <ul className="space-y-1 text-gray-700">
                <li>✓ Next.js 15 App Router API route</li>
                <li>✓ Stillriver proxy integration</li>
                <li>✓ Input validation and sanitization</li>
                <li>✓ Error handling with timeout protection</li>
                <li>✓ 10-minute HTTP cache headers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Service Layer</h3>
              <ul className="space-y-1 text-gray-700">
                <li>✓ MarketIntelligenceService class</li>
                <li>✓ 10-minute TTL caching</li>
                <li>✓ Custom error handling</li>
                <li>✓ Memory leak prevention</li>
                <li>✓ Cache statistics and management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">UI Component</h3>
              <ul className="space-y-1 text-gray-700">
                <li>✓ React 19 hooks and patterns</li>
                <li>✓ TypeScript strict typing</li>
                <li>✓ Accessibility support (ARIA)</li>
                <li>✓ Responsive Tailwind CSS design</li>
                <li>✓ Loading/error states</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Integration</h3>
              <ul className="space-y-1 text-gray-700">
                <li>✓ Dashboard composition ready</li>
                <li>✓ Customer context integration</li>
                <li>✓ Consistent widget patterns</li>
                <li>✓ Color-coded sentiment indicators</li>
                <li>✓ Callback support for orchestration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
