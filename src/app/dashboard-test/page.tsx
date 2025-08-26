'use client';

import React from 'react';
import { CustomerIntelligenceDashboard } from '../../components/CustomerIntelligenceDashboard';

/**
 * Test page for Customer Intelligence Dashboard
 * Demonstrates the complete dashboard composition with all widgets
 */
export default function DashboardTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Dashboard Integration Test
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete Customer Intelligence Dashboard with Market Intelligence Widget
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Exercise 07: Market Intelligence Widget Composition
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Component */}
      <CustomerIntelligenceDashboard />

      {/* Footer with Test Guidelines */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-green-900 mb-4">
              Dashboard Testing Workflow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-green-900 mb-2">1. Customer Management</h3>
                <ul className="space-y-1 text-green-800">
                  <li>• Add new customers</li>
                  <li>• Select existing customers</li>
                  <li>• View customer details</li>
                  <li>• Test CRUD operations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-green-900 mb-2">2. Domain Health</h3>
                <ul className="space-y-1 text-green-800">
                  <li>• Check customer domains</li>
                  <li>• Test response times</li>
                  <li>• Verify error handling</li>
                  <li>• Observe caching behavior</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-green-900 mb-2">3. Market Intelligence</h3>
                <ul className="space-y-1 text-green-800">
                  <li>• Analyze customer companies</li>
                  <li>• Review sentiment analysis</li>
                  <li>• Check news headlines</li>
                  <li>• Test auto-population</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-green-900 mb-2">4. Integration</h3>
                <ul className="space-y-1 text-green-800">
                  <li>• Data flow between widgets</li>
                  <li>• Summary aggregation</li>
                  <li>• Quick actions panel</li>
                  <li>• Responsive layout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
