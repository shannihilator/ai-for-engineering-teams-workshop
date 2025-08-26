'use client'

import { useState } from 'react'
import TestButton from '../../components/TestButton'

/**
 * Test page to validate accessibility constraints integration
 * 
 * This page demonstrates that the enhanced platform constraints
 * automatically generate accessible components with:
 * - ARIA labels and descriptions
 * - Keyboard navigation support
 * - Semantic HTML structure
 * - Proper focus indicators
 * - Screen reader compatibility
 */
export default function TestAccessibilityPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handlePrimaryClick = () => {
    setMessage('Primary button clicked!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLoadingTest = () => {
    setIsLoading(true)
    // Simulate async operation
    setTimeout(() => {
      setIsLoading(false)
      setMessage('Loading completed!')
      setTimeout(() => setMessage(''), 3000)
    }, 2000)
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      {/* Semantic heading hierarchy for screen readers */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Accessibility Test Page
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        Testing enhanced platform constraints with accessibility requirements
      </p>

      {/* Test section with proper semantic structure */}
      <section aria-labelledby="button-tests" className="mb-8">
        <h2 id="button-tests" className="text-2xl font-semibold text-gray-800 mb-4">
          Button Component Tests
        </h2>

        {/* Button variants with accessibility features */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <TestButton
              variant="primary"
              onClick={handlePrimaryClick}
              aria-label="Test primary button functionality"
            >
              Primary Button
            </TestButton>

            <TestButton
              variant="secondary"
              onClick={() => setMessage('Secondary button works!')}
              aria-label="Test secondary button styling"
            >
              Secondary Button
            </TestButton>

            <TestButton
              variant="danger"
              onClick={() => setMessage('Danger button activated!')}
              aria-label="Test danger button variant"
            >
              Danger Button
            </TestButton>
          </div>

          <div className="flex flex-wrap gap-4">
            <TestButton
              variant="primary"
              isLoading={isLoading}
              onClick={handleLoadingTest}
              disabled={isLoading}
              aria-label={isLoading ? 'Processing request' : 'Start loading test'}
            >
              {isLoading ? 'Loading...' : 'Test Loading State'}
            </TestButton>

            <TestButton
              variant="secondary"
              disabled={true}
              aria-label="Disabled button example"
            >
              Disabled Button
            </TestButton>
          </div>
        </div>
      </section>

      {/* Accessible feedback section */}
      <section aria-labelledby="feedback" className="mb-8">
        <h2 id="feedback" className="text-2xl font-semibold text-gray-800 mb-4">
          Accessibility Features Demonstrated
        </h2>

        {/* Live region for dynamic content announcements */}
        {message && (
          <div 
            role="status" 
            aria-live="polite"
            className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4"
          >
            {message}
          </div>
        )}

        {/* Accessibility checklist */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            ✅ Accessibility Features Implemented
          </h3>
          
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Keyboard Navigation:</strong> Tab through buttons, activate with Enter/Space</li>
            <li>• <strong>ARIA Labels:</strong> Descriptive labels for screen reader users</li>
            <li>• <strong>Semantic HTML:</strong> Proper button elements and heading hierarchy</li>
            <li>• <strong>Focus Indicators:</strong> High-contrast focus rings on all interactive elements</li>
            <li>• <strong>Loading States:</strong> ARIA live regions announce state changes</li>
            <li>• <strong>Screen Reader Support:</strong> Hidden loading text and status updates</li>
            <li>• <strong>Color Contrast:</strong> All text meets WCAG AA contrast ratios</li>
          </ul>
        </div>
      </section>

      {/* Keyboard navigation instructions */}
      <section aria-labelledby="navigation-help" className="text-sm text-gray-600">
        <h2 id="navigation-help" className="text-lg font-medium text-gray-800 mb-2">
          Keyboard Navigation Help
        </h2>
        <p>
          <kbd className="bg-gray-200 px-2 py-1 rounded">Tab</kbd> to move between buttons • 
          <kbd className="bg-gray-200 px-2 py-1 rounded ml-1">Enter</kbd> or 
          <kbd className="bg-gray-200 px-2 py-1 rounded ml-1">Space</kbd> to activate • 
          <kbd className="bg-gray-200 px-2 py-1 rounded ml-1">Shift + Tab</kbd> to move backwards
        </p>
      </section>
    </main>
  )
}