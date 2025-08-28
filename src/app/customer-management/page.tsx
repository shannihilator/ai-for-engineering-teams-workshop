import { CustomerManagement } from '@/components/CustomerManagement';

/**
 * Customer Management Demo Page
 * Showcases the complete customer management system with all CRUD operations
 */
export default function CustomerManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CustomerManagement />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Customer Management | Customer Intelligence Dashboard',
  description: 'Comprehensive customer management system with search, filtering, and CRUD operations.',
};