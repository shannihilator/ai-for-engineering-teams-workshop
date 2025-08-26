'use client';

import { useState } from 'react';
import CustomerCard, { Customer } from '../components/CustomerCard';
import { DomainHealthWidget } from '../components/DomainHealthWidget';

// Mock customer data for testing
const mockCustomers: Customer[] = [
  { id: '1', name: 'John Smith', company: 'Acme Corp', healthScore: 85 },
  { id: '2', name: 'Sarah Johnson', company: 'TechStart Inc', healthScore: 45 },
  { id: '3', name: 'Michael Brown', company: 'Global Solutions', healthScore: 15 },
  { id: '4', name: 'Emily Davis', company: 'Innovation Labs', healthScore: 92 },
  { id: '5', name: 'David Wilson', company: 'Future Systems', healthScore: 60 },
  { id: '6', name: 'Lisa Anderson', company: 'Smart Ventures', healthScore: 73 }
];

export default function Home() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Intelligence Dashboard</h1>
          <p className="text-gray-600">Domain Health Integration & Customer Management Demo</p>
        </header>

        {/* Domain Health Widget */}
        <div className="mb-8">
          <DomainHealthWidget className="max-w-2xl" />
        </div>

        {selectedCustomer && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-800">
              <strong>Selected:</strong> {selectedCustomer.name} from {selectedCustomer.company}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomer?.id === customer.id}
              onClick={handleCustomerSelect}
            />
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Health Score Legend</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Poor (0-30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Moderate (31-70)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Good (71-100)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
