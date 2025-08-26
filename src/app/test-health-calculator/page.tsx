'use client';

import React, { useState } from 'react';
import { CustomerHealthDisplay } from '../../components/CustomerHealthDisplay';
import { mockCustomers, Customer } from '../../data/mock-customers';
import { HealthScoreResult } from '../../types/healthScore';

/**
 * Test page for Customer Health Score Calculator
 *
 * This page demonstrates:
 * - Health score calculation with realistic customer data
 * - UI component integration and responsiveness
 * - Error handling and edge cases
 * - Performance with multiple customers
 */
export default function TestHealthCalculatorPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [calculationResults, setCalculationResults] = useState<Map<string, HealthScoreResult>>(new Map());

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleHealthCalculated = (result: HealthScoreResult) => {
    setCalculationResults(prev => new Map(prev).set(selectedCustomer?.id || '', result));
  };

  const getCustomerRiskBadge = (customer: Customer) => {
    const result = calculationResults.get(customer.id);
    if (!result) return null;

    const colors = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[result.riskLevel]}`}>
        {result.riskLevel} ({result.overallScore})
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Health Score Calculator Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select customers to test health score calculation with realistic data scenarios.
            Verify algorithm accuracy, UI responsiveness, and edge case handling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Test Customers</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click to test health calculation
                </p>
              </div>
              <div className="p-4 space-y-2">
                {mockCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedCustomer?.id === customer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      <span className="text-sm text-gray-500">#{customer.id}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {customer.company}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Base Score: {customer.healthScore}
                      </span>
                      {getCustomerRiskBadge(customer)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Statistics */}
            {calculationResults.size > 0 && (
              <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {Array.from(calculationResults.values()).filter(r => r.riskLevel === 'healthy').length}
                      </div>
                      <div className="text-xs text-gray-500">Healthy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {Array.from(calculationResults.values()).filter(r => r.riskLevel === 'warning').length}
                      </div>
                      <div className="text-xs text-gray-500">Warning</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {Array.from(calculationResults.values()).filter(r => r.riskLevel === 'critical').length}
                      </div>
                      <div className="text-xs text-gray-500">Critical</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Tested:</span>
                        <span>{calculationResults.size} customers</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Confidence:</span>
                        <span>
                          {calculationResults.size > 0
                            ? Math.round(
                                Array.from(calculationResults.values())
                                  .reduce((sum, r) => sum + r.overallConfidence, 0) /
                                calculationResults.size * 100
                              )
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Health Display Panel */}
          <div className="lg:col-span-2">
            <CustomerHealthDisplay
              customer={selectedCustomer}
              onHealthCalculated={handleHealthCalculated}
              className="h-fit"
            />

            {/* Performance & Edge Case Testing */}
            {selectedCustomer && (
              <div className="mt-6 space-y-6">
                {/* Algorithm Explanation */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Algorithm Validation</h3>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Customer:</strong> {selectedCustomer.name} at {selectedCustomer.company}</p>
                      <p><strong>Base Health Score:</strong> {selectedCustomer.healthScore}/100 (from mock data)</p>
                      {calculationResults.has(selectedCustomer.id) && (
                        <>
                          <p><strong>Calculated Score:</strong> {calculationResults.get(selectedCustomer.id)?.overallScore}/100</p>
                          <p><strong>Risk Level:</strong> {calculationResults.get(selectedCustomer.id)?.riskLevel}</p>
                          <p><strong>Confidence:</strong> {Math.round((calculationResults.get(selectedCustomer.id)?.overallConfidence || 0) * 100)}%</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Test Scenarios */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Test Scenarios</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-1">✅ Healthy Customer</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Recent payments (5-15 days)</li>
                          <li>• High engagement (20+ logins)</li>
                          <li>• Stable contract (6+ months to renewal)</li>
                          <li>• High satisfaction (7+ rating)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-1">⚠️ Warning Customer</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Moderate payment delays (20-40 days)</li>
                          <li>• Low engagement (8-15 logins)</li>
                          <li>• Renewal approaching (30-90 days)</li>
                          <li>• Moderate satisfaction (4-7 rating)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-1">🚨 Critical Customer</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Late payments (45+ days overdue)</li>
                          <li>• Minimal engagement (1-5 logins)</li>
                          <li>• Overdue renewal or recent downgrade</li>
                          <li>• Poor satisfaction (1-4 rating)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-1">🔍 Edge Cases</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• New customers (no history)</li>
                          <li>• Missing data points</li>
                          <li>• Invalid/extreme values</li>
                          <li>• Mixed signal customers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Customer Health Score Calculator Test Suite</p>
          <p>Exercise 08: Health Score Calculator with AI Collaboration</p>
        </div>
      </div>
    </div>
  );
}
