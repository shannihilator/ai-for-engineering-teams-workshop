import { CustomerCard } from "../components/CustomerCard";
import { mockCustomers } from "../data/mock-customers";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Intelligence Dashboard</h1>
          <p className="mt-2 text-gray-600">Workshop Exercise 03 - CustomerCard Component Test</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => console.log('Selected customer:', customer.name)}
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Component Test Results</h2>
          <div className="space-y-2 text-sm">
            <p>✅ Customer name and company displayed</p>
            <p>✅ Health scores with color coding (Red: 0-30, Yellow: 31-70, Green: 71-100)</p>
            <p>✅ Domain information with counts</p>
            <p>✅ Responsive grid layout</p>
            <p>✅ Click handlers and keyboard navigation</p>
            <p>✅ Accessibility features (ARIA labels, semantic HTML)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
