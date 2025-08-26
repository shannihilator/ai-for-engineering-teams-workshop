'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert, AlertPriority, AlertType, AlertSystemMetrics } from '../types/alerts';
import { alertEngine } from '../lib/alerts';
import { generateCustomerHealthData } from '../data/mock-health-data';
import { mockCustomers, Customer } from '../data/mock-customers';

/**
 * Props interface for PredictiveAlertsWidget component
 */
interface PredictiveAlertsWidgetProps {
  /** Currently selected customer (optional) */
  selectedCustomer?: Customer | null;
  /** Optional CSS classes to apply to the widget */
  className?: string;
  /** Optional callback when alert is triggered */
  onAlertTriggered?: (alert: Alert) => void;
  /** Optional callback when alert action is taken */
  onAlertAction?: (alertId: string, action: 'dismiss' | 'resolve' | 'snooze') => void;
  /** Maximum number of alerts to display */
  maxDisplayAlerts?: number;
}

/**
 * Priority color mapping for consistent UI theming
 */
const getPriorityColor = (priority: AlertPriority): string => {
  switch (priority) {
    case 'high':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

/**
 * Priority icon mapping
 */
const getPriorityIcon = (priority: AlertPriority): string => {
  switch (priority) {
    case 'high':
      return '🚨';
    case 'medium':
      return '⚠️';
    default:
      return '🔔';
  }
};

/**
 * Alert type display names
 */
const getAlertTypeDisplay = (type: AlertType): string => {
  const typeMap: Record<AlertType, string> = {
    payment_risk: 'Payment Risk',
    engagement_cliff: 'Engagement Drop',
    contract_expiration_risk: 'Renewal Risk',
    support_ticket_spike: 'Support Issues',
    feature_adoption_stall: 'Feature Stagnation'
  };
  return typeMap[type] || type;
};

/**
 * Individual Alert Display Component
 */
interface AlertItemProps {
  alert: Alert;
  onDismiss: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onSnooze: (alertId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (alertId: string) => void;
}

function AlertItem({ alert, onDismiss, onResolve, onSnooze, isExpanded, onToggleExpand }: AlertItemProps) {
  const customer = mockCustomers.find(c => c.id === alert.customerId);
  const customerName = customer ? customer.name : `Customer ${alert.customerId}`;
  const confidencePercentage = Math.round(alert.confidence * 100);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className={`border rounded-lg mb-3 transition-all duration-200 ${getPriorityColor(alert.priority)}`}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => onToggleExpand(alert.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <span className="text-xl mt-1" role="img" aria-label={`${alert.priority} priority alert`}>
              {getPriorityIcon(alert.priority)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate">
                  {alert.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  alert.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.priority.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>{customerName}</strong> • {getAlertTypeDisplay(alert.type)}
              </div>
              <div className="text-sm line-clamp-2">
                {alert.message}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  {alert.triggeredAt.toLocaleString()} • {confidencePercentage}% confidence
                </div>
                <span className={`transform transition-transform text-gray-400 ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`}>
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          <div className="p-4">
            {/* Recommended Actions */}
            {alert.recommendedActions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Recommended Actions:</h4>
                <ul className="text-sm space-y-1">
                  {alert.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alert Metadata */}
            {alert.metadata.triggerValues && Object.keys(alert.metadata.triggerValues).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Alert Details:</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(alert.metadata.triggerValues).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={(e) => handleActionClick(e, () => onResolve(alert.id))}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                aria-label={`Resolve alert for ${customerName}`}
              >
                ✓ Resolve
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onSnooze(alert.id))}
                className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                aria-label={`Snooze alert for ${customerName}`}
              >
                😴 Snooze
              </button>
              <button
                onClick={(e) => handleActionClick(e, () => onDismiss(alert.id))}
                className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                aria-label={`Dismiss alert for ${customerName}`}
              >
                ✕ Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Alert System Metrics Display
 */
interface MetricsDisplayProps {
  metrics: AlertSystemMetrics;
}

function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4">
      <h4 className="font-semibold text-sm mb-2">System Status</h4>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold text-red-600">
            {metrics.alertsByPriority.high}
          </div>
          <div className="text-xs text-gray-500">High Priority</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-600">
            {metrics.alertsByPriority.medium}
          </div>
          <div className="text-xs text-gray-500">Medium Priority</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {metrics.accuracyMetrics.accuracy}%
          </div>
          <div className="text-xs text-gray-500">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Predictive Alerts Widget Component
 *
 * Features:
 * - Real-time alert monitoring and display
 * - Priority-based alert ordering and visual distinction
 * - Expandable alert details with recommended actions
 * - Alert management actions (dismiss, resolve, snooze)
 * - System metrics and performance monitoring
 * - Customer-specific alert filtering
 * - Accessibility compliant with keyboard navigation
 *
 * @param props - Component props
 * @returns JSX element representing the predictive alerts widget
 */
export function PredictiveAlertsWidget({
  selectedCustomer,
  className = '',
  onAlertTriggered,
  onAlertAction,
  maxDisplayAlerts = 10
}: PredictiveAlertsWidgetProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [lastEvaluation, setLastEvaluation] = useState<Date | null>(null);

  // Memoized alert evaluation
  const evaluatedAlerts = useMemo(() => {
    try {
      setIsLoading(true);
      setError(null);

      if (selectedCustomer) {
        // Evaluate alerts for specific customer
        const healthData = generateCustomerHealthData(selectedCustomer.id);
        if (healthData) {
          const customerAlerts = alertEngine.evaluateCustomer(healthData);
          setLastEvaluation(new Date());
          return customerAlerts.slice(0, maxDisplayAlerts);
        }
      } else {
        // Evaluate alerts for all customers
        const allHealthData = mockCustomers.map(customer => generateCustomerHealthData(customer.id)!).filter(Boolean);
        const allAlerts = alertEngine.evaluateAllCustomers(allHealthData);
        setLastEvaluation(new Date());
        return allAlerts.slice(0, maxDisplayAlerts);
      }

      return [];
    } catch (error) {
      console.error('Alert evaluation error:', error);
      setError('Failed to evaluate alerts. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [selectedCustomer?.id, maxDisplayAlerts]);

  // Update alerts when evaluation changes
  useEffect(() => {
    setAlerts(evaluatedAlerts);

    // Notify parent component of new alerts
    evaluatedAlerts.forEach(alert => {
      if (alert.status === 'active') {
        onAlertTriggered?.(alert);
      }
    });
  }, [evaluatedAlerts, onAlertTriggered]);

  // Alert management handlers
  const handleDismissAlert = useCallback((alertId: string) => {
    alertEngine.dismissAlert(alertId, 'current_user'); // In production, get actual user ID
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'dismissed' as const, dismissedAt: new Date() } : alert
    ).filter(alert => alert.status === 'active'));
    onAlertAction?.(alertId, 'dismiss');
  }, [onAlertAction]);

  const handleResolveAlert = useCallback((alertId: string) => {
    alertEngine.resolveAlert(alertId, 'current_user'); // In production, get actual user ID
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'resolved' as const, resolvedAt: new Date() } : alert
    ).filter(alert => alert.status === 'active'));
    onAlertAction?.(alertId, 'resolve');
  }, [onAlertAction]);

  const handleSnoozeAlert = useCallback((alertId: string) => {
    const snoozeUntil = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    alertEngine.snoozeAlert(alertId, snoozeUntil);
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'snoozed' as const, snoozedUntil: snoozeUntil } : alert
    ).filter(alert => alert.status === 'active'));
    onAlertAction?.(alertId, 'snooze');
  }, [onAlertAction]);

  const handleToggleExpand = useCallback((alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  }, []);

  // Get system metrics
  const systemMetrics = useMemo(() => alertEngine.getSystemMetrics(), [alerts]);

  // Active alerts for display
  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Evaluating alerts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Predictive Alerts
            {selectedCustomer && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                for {selectedCustomer.name}
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            {activeAlerts.length > 0 && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activeAlerts.some(a => a.priority === 'high')
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {activeAlerts.length} active
              </span>
            )}
            {lastEvaluation && (
              <div className="text-sm text-gray-500">
                Updated {lastEvaluation.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <h4 className="text-red-800 font-semibold">Alert System Error</h4>
            </div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* System Metrics */}
        <MetricsDisplay metrics={systemMetrics} />

        {/* Alerts List */}
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-500 text-4xl mb-3">✅</div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">All Clear!</h4>
            <p className="text-gray-500 text-sm">
              {selectedCustomer
                ? `No active alerts for ${selectedCustomer.name}`
                : 'No active alerts for monitored customers'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {activeAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
                onResolve={handleResolveAlert}
                onSnooze={handleSnoozeAlert}
                isExpanded={expandedAlerts.has(alert.id)}
                onToggleExpand={handleToggleExpand}
              />
            ))}

            {activeAlerts.length === maxDisplayAlerts && (
              <div className="text-center text-sm text-gray-500 mt-4">
                Showing top {maxDisplayAlerts} alerts
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictiveAlertsWidget;
