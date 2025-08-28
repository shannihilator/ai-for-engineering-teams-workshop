/**
 * Service Demo Component
 * Interactive demonstration of CustomerService functionality
 */

'use client';

import { useState, useCallback } from 'react';
import { runAllTests } from '../CustomerService.test';

export function ServiceDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string[]>([]);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestOutput([]);

    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    
    const capturedOutput: string[] = [];
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      capturedOutput.push(`[LOG] ${message}`);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      capturedOutput.push(`[ERROR] ${message}`);
      originalError(...args);
    };

    try {
      await runAllTests();
      capturedOutput.push('\n✅ All tests completed successfully!');
    } catch (error) {
      capturedOutput.push(`\n❌ Test suite failed: ${error}`);
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      
      setTestOutput([...capturedOutput]);
      setIsRunning(false);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setTestOutput([]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CustomerService Demo
        </h1>
        <p className="text-lg text-gray-600">
          Interactive demonstration of the CustomerService layer functionality.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Test Controls
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isRunning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={clearOutput}
            disabled={isRunning || testOutput.length === 0}
            className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isRunning || testOutput.length === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            Clear Output
          </button>
        </div>
      </div>

      {/* Service Features Overview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          CustomerService Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">CRUD Operations</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create customers with validation</li>
              <li>• Read customers by ID or search</li>
              <li>• Update customer information</li>
              <li>• Delete customers</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">Advanced Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Search and filtering</li>
              <li>• Sorting and pagination</li>
              <li>• Batch operations</li>
              <li>• Customer statistics</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">Business Logic</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Health score validation (0-100)</li>
              <li>• Email format validation</li>
              <li>• Subscription tier enforcement</li>
              <li>• Domain array validation</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">Error Handling</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Validation errors with field details</li>
              <li>• Not found errors</li>
              <li>• Conflict errors (duplicate data)</li>
              <li>• Batch operation error handling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Output */}
      {testOutput.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Test Output
          </h2>
          <div className="bg-black rounded p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
              {testOutput.map((line, index) => (
                <div key={index} className={
                  line.includes('[ERROR]') ? 'text-red-400' :
                  line.includes('✅') ? 'text-green-400' :
                  line.includes('❌') ? 'text-red-400' :
                  line.includes('===') ? 'text-blue-400 font-bold' :
                  'text-gray-300'
                }>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Running CustomerService tests...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDemo;