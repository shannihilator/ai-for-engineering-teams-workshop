'use client';

import React, { useState } from 'react';
import { Customer } from '../data/mock-customers';
import { CustomerList } from './CustomerList';
import CustomerCard from './CustomerCard';
import { DomainHealthWidget } from './DomainHealthWidget';
import { MarketIntelligenceWidget } from './MarketIntelligenceWidget';
import { AddCustomerForm } from './AddCustomerForm';
import { DomainHealthData } from '../services/DomainHealthService';
import { MarketIntelligenceData } from '../services/MarketIntelligenceService';

/**
 * Props interface for CustomerIntelligenceDashboard component
 */
interface CustomerIntelligenceDashboardProps {
  /** Optional CSS classes to apply to the dashboard */
  className?: string;
}

/**
 * Customer Intelligence Dashboard Component
 *
 * Features:
 * - Complete customer management with CRUD operations
 * - Real-time domain health monitoring
 * - Market intelligence and sentiment analysis
 * - Responsive grid layout with mobile-first design
 * - Widget composition and data flow orchestration
 * - Integrated error handling and loading states
 *
 * @param props - Component props
 * @returns JSX element representing the complete customer intelligence dashboard
 */
export function CustomerIntelligenceDashboard({
  className = ''
}: CustomerIntelligenceDashboardProps) {
  // State management for customer operations
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // State management for widget data
  const [domainHealthData, setDomainHealthData] = useState<DomainHealthData | null>(null);
  const [marketIntelligenceData, setMarketIntelligenceData] = useState<MarketIntelligenceData | null>(null);

  // Analytics state for dashboard insights
  const [dashboardStats, setDashboardStats] = useState({
    totalHealthChecks: 0,
    totalMarketAnalyses: 0,
    lastUpdated: new Date().toISOString()
  });

  /**
   * Handles customer selection from the customer list
   * Updates widget contexts with selected customer data
   */
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);

    // Reset widget data when switching customers
    setDomainHealthData(null);
    setMarketIntelligenceData(null);

    console.log(`Customer selected: ${customer.name} (${customer.company})`);
  };

  /**
   * Handles add customer button click
   */
  const handleAddCustomer = () => {
    setShowAddForm(true);
  };

  /**
   * Handles successful customer addition
   * Updates the customer list and selects the new customer
   */
  const handleCustomerAdded = (customer: Customer) => {
    setShowAddForm(false);
    setSelectedCustomer(customer);
    // Trigger refresh of customer list
    setRefreshKey(prev => prev + 1);
    console.log(`New customer added: ${customer.name} (${customer.company})`);
  };

  /**
   * Handles cancellation of add customer form
   */
  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  /**
   * Handles domain health check completion
   * Updates dashboard analytics
   */
  const handleHealthCheckComplete = (data: DomainHealthData) => {
    setDomainHealthData(data);
    setDashboardStats(prev => ({
      ...prev,
      totalHealthChecks: prev.totalHealthChecks + 1,
      lastUpdated: new Date().toISOString()
    }));
    console.log(`Domain health check completed for: ${data.domain}`);
  };

  /**
   * Handles market intelligence analysis completion
   * Updates dashboard analytics
   */
  const handleAnalysisComplete = (data: MarketIntelligenceData) => {
    setMarketIntelligenceData(data);
    setDashboardStats(prev => ({
      ...prev,
      totalMarketAnalyses: prev.totalMarketAnalyses + 1,
      lastUpdated: new Date().toISOString()
    }));
    console.log(`Market intelligence analysis completed for: ${data.company}`);
  };


  /**
   * Gets the company name for the selected customer
   * Used for automatic market intelligence analysis
   */
  const getCustomerCompanyName = (): string => {
    return selectedCustomer?.company || '';
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Intelligence Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive customer management with domain health monitoring and market intelligence analysis
              </p>
            </div>

            {/* Dashboard Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-medium text-gray-900">{dashboardStats.totalHealthChecks}</div>
                <div>Health Checks</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">{dashboardStats.totalMarketAnalyses}</div>
                <div>Market Analyses</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {selectedCustomer ? 'Active' : 'No Selection'}
                </div>
                <div>Customer Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Add Customer Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border">
              <AddCustomerForm
                onSuccess={handleCustomerAdded}
                onCancel={handleCancelAdd}
              />
            </div>
          )}

          {/* Customer Management Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <CustomerList
              key={refreshKey}
              onCustomerSelect={handleCustomerSelect}
              selectedCustomer={selectedCustomer}
              showAddButton={!showAddForm}
              onAddCustomer={handleAddCustomer}
            />
          </div>

          {/* Selected Customer Details */}
          {selectedCustomer && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Customer</h2>
              <CustomerCard
                customer={selectedCustomer}
              />
            </div>
          )}

          {/* Intelligence Widgets Grid */}
          {selectedCustomer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Domain Health Widget */}
              <DomainHealthWidget
                className="h-fit"
                onHealthCheck={handleHealthCheckComplete}
              />

              {/* Market Intelligence Widget */}
              <MarketIntelligenceWidget
                className="h-fit"
                companyName={getCustomerCompanyName()}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          )}

          {/* Intelligence Data Summary */}
          {selectedCustomer && (domainHealthData || marketIntelligenceData) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Intelligence Summary for {selectedCustomer.company}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Domain Health Summary */}
                {domainHealthData && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Website Health</h3>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        domainHealthData.status === 'healthy' ? 'bg-green-500' :
                        domainHealthData.status === 'degraded' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span className="font-medium text-gray-900 capitalize">
                        {domainHealthData.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({domainHealthData.responseTime}ms)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Domain: {domainHealthData.domain}
                    </p>
                  </div>
                )}

                {/* Market Intelligence Summary */}
                {marketIntelligenceData && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Market Sentiment</h3>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        marketIntelligenceData.sentiment.label === 'positive' ? 'bg-green-500' :
                        marketIntelligenceData.sentiment.label === 'negative' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <span className="font-medium text-gray-900 capitalize">
                        {marketIntelligenceData.sentiment.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({Math.round(marketIntelligenceData.sentiment.confidence * 100)}% confidence)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {marketIntelligenceData.news.articleCount} recent articles
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {domainHealthData && !domainHealthData.error && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Website Accessible
                    </span>
                  )}
                  {marketIntelligenceData && !marketIntelligenceData.error && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ✓ Market Data Current
                    </span>
                  )}
                  {selectedCustomer.healthScore >= 71 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ High Health Score
                    </span>
                  )}
                  {selectedCustomer.healthScore < 31 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ⚠ Low Health Score
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Getting Started Guide */}
          {!selectedCustomer && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Get Started with Customer Intelligence
                  </h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>1. <strong>Select a customer</strong> from the list above to begin analysis</p>
                    <p>2. <strong>Check domain health</strong> to monitor website accessibility</p>
                    <p>3. <strong>Analyze market intelligence</strong> to track sentiment and news</p>
                    <p>4. <strong>Review the summary</strong> for actionable insights and quick actions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
