'use client';

import { useState, useEffect } from 'react';
import { PredictiveAlertEngine } from '../../lib/alerts';
import { PredictiveAlertsWidget } from '../../components/PredictiveAlertsWidget';
import { Alert, AlertTestScenario } from '../../types/alerts';
import { allTestScenarios, generateTestHistoryMap } from '../../data/mock-alert-data';
import { mockCustomers } from '../../data/mock-customers';

export default function TestPredictiveAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<AlertTestScenario | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<string[]>([]);

  const alertEngine = new PredictiveAlertEngine();
  const historyMap = generateTestHistoryMap();

  // Evaluate all test scenarios on component mount
  useEffect(() => {
    evaluateAllScenarios();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const evaluateAllScenarios = () => {
    setIsEvaluating(true);
    const results: string[] = [];
    const generatedAlerts: Alert[] = [];

    for (const scenario of allTestScenarios) {
      const startTime = Date.now();
      const customerAlerts = alertEngine.evaluateCustomer(
        scenario.customerHealthData,
        historyMap.get(scenario.customerHealthData.customerId)
      );
      const evaluationTime = Date.now() - startTime;

      generatedAlerts.push(...customerAlerts);

      // Validate against expected results
      const expectedTypes = scenario.expectedAlertTypes;
      const actualTypes = customerAlerts.map(alert => alert.type);
      const expectedPriority = scenario.expectedPriority;
      const actualPriorities = customerAlerts.map(alert => alert.priority);

      const typeMatch = expectedTypes.every(type => actualTypes.includes(type)) &&
                       actualTypes.every(type => expectedTypes.includes(type));
      const priorityMatch = actualPriorities.length === 0 ||
                           actualPriorities.every(priority => priority === expectedPriority);

      results.push(
        `✅ ${scenario.name}: ${customerAlerts.length} alert(s) generated in ${evaluationTime}ms` +
        ` | Types: ${actualTypes.join(', ') || 'none'}` +
        ` | Priority: ${[...new Set(actualPriorities)].join(', ') || 'none'}` +
        ` | Expected: ${typeMatch && priorityMatch ? 'PASS' : 'FAIL'}`
      );
    }

    setAlerts(generatedAlerts);
    setEvaluationResults(results);
    setIsEvaluating(false);
  };

  const evaluateBatchPerformance = () => {
    setIsEvaluating(true);

    // Test batch processing with mock customers
    const startTime = Date.now();
    const batchAlerts = alertEngine.evaluateAllCustomers(
      mockCustomers.slice(0, 10), // Test with first 10 customers
      historyMap
    );
    const totalTime = Date.now() - startTime;

    setEvaluationResults(prev => [
      ...prev,
      '',
      `🚀 Batch Performance Test:`,
      `• Evaluated 10 customers in ${totalTime}ms`,
      `• Average per customer: ${(totalTime / 10).toFixed(1)}ms`,
      `• Total alerts generated: ${batchAlerts.length}`,
      `• Performance target (<5000ms): ${totalTime < 5000 ? 'PASS' : 'FAIL'}`
    ]);

    setIsEvaluating(false);
  };

  const handleAlertAction = (alertId: string, action: 'dismiss' | 'resolve' | 'snooze') => {
    switch (action) {
      case 'dismiss':
        alertEngine.dismissAlert(alertId, 'test-user');
        break;
      case 'resolve':
        alertEngine.resolveAlert(alertId, 'test-user');
        break;
      case 'snooze':
        alertEngine.snoozeAlert(alertId, new Date(Date.now() + 60 * 60 * 1000)); // 1 hour
        break;
    }

    // Refresh alerts display
    const activeAlerts = alertEngine.getActiveAlerts();
    setAlerts(activeAlerts);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Predictive Alerts System Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of alert rules, performance, and UI components with realistic customer scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Test Controls & Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

              <div className="space-y-4">
                <button
                  onClick={evaluateAllScenarios}
                  disabled={isEvaluating}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEvaluating ? 'Evaluating...' : 'Run All Alert Scenarios'}
                </button>

                <button
                  onClick={evaluateBatchPerformance}
                  disabled={isEvaluating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEvaluating ? 'Testing...' : 'Test Batch Performance'}
                </button>
              </div>
            </div>

            {/* Test Scenarios */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Test Scenarios</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allTestScenarios.map((scenario) => (
                  <button
                    key={scenario.name}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedScenario?.name === scenario.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{scenario.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        scenario.expectedPriority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {scenario.expectedPriority}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {scenario.expectedAlertTypes.join(', ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluation Results */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Evaluation Results</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {evaluationResults.length === 0 ? (
                  <div className="text-gray-500">No evaluation results yet. Run tests to see results.</div>
                ) : (
                  evaluationResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Alerts Display */}
          <div className="space-y-6">
            {/* Live Alerts Widget */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Live Alerts ({alerts.filter(alert => alert.status === 'active').length})
              </h2>
              <PredictiveAlertsWidget
                alerts={alerts}
                onAlertAction={handleAlertAction}
              />
            </div>

            {/* Selected Scenario Details */}
            {selectedScenario && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Scenario Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedScenario.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedScenario.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Customer ID:</span>
                      <div className="text-gray-600">{selectedScenario.customerHealthData.customerId}</div>
                    </div>
                    <div>
                      <span className="font-medium">Contract Value:</span>
                      <div className="text-gray-600">
                        ${selectedScenario.customerHealthData.contract.contractValue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Days Until Renewal:</span>
                      <div className="text-gray-600">
                        {selectedScenario.customerHealthData.contract.daysUntilRenewal} days
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Support Satisfaction:</span>
                      <div className="text-gray-600">
                        {selectedScenario.customerHealthData.support.satisfactionScore}/10
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Days Since Payment:</span>
                      <div className="text-gray-600">
                        {selectedScenario.customerHealthData.paymentHistory.daysSinceLastPayment} days
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Logins (30 days):</span>
                      <div className="text-gray-600">
                        {selectedScenario.customerHealthData.engagement.loginsLast30Days}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Expected Alert Types:</span>
                    <div className="flex gap-2 mt-1">
                      {selectedScenario.expectedAlertTypes.map(type => (
                        <span key={type} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">System Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Alerts:</span>
                  <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
                </div>
                <div>
                  <span className="font-medium">Active Alerts:</span>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter(alert => alert.status === 'active').length}
                  </div>
                </div>
                <div>
                  <span className="font-medium">High Priority:</span>
                  <div className="text-lg font-semibold text-red-500">
                    {alerts.filter(alert => alert.priority === 'high').length}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Medium Priority:</span>
                  <div className="text-lg font-semibold text-yellow-500">
                    {alerts.filter(alert => alert.priority === 'medium').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
