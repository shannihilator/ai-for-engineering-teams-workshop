'use client';

import { useState } from 'react';
import { Customer } from '@/data/mock-customers';
import { LoadingButton } from './ui/LoadingButton';

export interface CustomerActionsProps {
  /** Customer data for the actions */
  customer: Customer;
  /** Callback when edit is requested */
  onEdit?: (customer: Customer) => void;
  /** Callback when delete is requested */
  onDelete?: (customer: Customer) => void;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Show confirmation dialog for delete */
  showDeleteConfirmation?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CustomerActions component providing edit and delete functionality
 * Integrates with CustomerCard to provide action buttons with proper accessibility
 */
export function CustomerActions({
  customer,
  onEdit,
  onDelete,
  isLoading = false,
  showDeleteConfirmation = true,
  className = ''
}: CustomerActionsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  /**
   * Handle edit button click
   */
  const handleEdit = () => {
    if (!isLoading) {
      onEdit?.(customer);
    }
  };

  /**
   * Handle delete button click
   */
  const handleDelete = () => {
    if (showDeleteConfirmation) {
      setShowConfirmDialog(true);
    } else {
      confirmDelete();
    }
  };

  /**
   * Confirm and execute delete operation
   */
  const confirmDelete = async () => {
    setDeleteInProgress(true);
    setShowConfirmDialog(false);
    
    try {
      await onDelete?.(customer);
    } finally {
      setDeleteInProgress(false);
    }
  };

  /**
   * Cancel delete confirmation
   */
  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const baseClasses = 'flex items-center gap-2';
  const actionsClasses = `${baseClasses} ${className}`;

  return (
    <>
      <div className={actionsClasses}>
        {/* Edit Button */}
        <LoadingButton
          onClick={handleEdit}
          disabled={isLoading || deleteInProgress}
          isLoading={false}
          size="small"
          variant="outline"
          className="text-blue-600 border-blue-300 hover:bg-blue-50 focus:ring-blue-500"
          aria-label={`Edit customer ${customer.name}`}
        >
          <svg
            className="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </LoadingButton>

        {/* Delete Button */}
        <LoadingButton
          onClick={handleDelete}
          disabled={isLoading}
          isLoading={deleteInProgress}
          loadingText="Deleting..."
          size="small"
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50 focus:ring-red-500"
          aria-label={`Delete customer ${customer.name}`}
        >
          <svg
            className="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 002 0V3h4v1a1 1 0 002 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V8z"
              clipRule="evenodd"
            />
          </svg>
          Delete
        </LoadingButton>
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg font-medium text-gray-900" id="delete-dialog-title">
                  Delete Customer
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500" id="delete-dialog-description">
                    Are you sure you want to delete{' '}
                    <span className="font-medium text-gray-900">{customer.name}</span>{' '}
                    from <span className="font-medium text-gray-900">{customer.company}</span>?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <LoadingButton
                onClick={confirmDelete}
                isLoading={deleteInProgress}
                loadingText="Deleting..."
                variant="primary"
                size="small"
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                Delete
              </LoadingButton>
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleteInProgress}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}