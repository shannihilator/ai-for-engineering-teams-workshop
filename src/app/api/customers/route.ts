import { NextRequest, NextResponse } from 'next/server';
import { CustomerService, CustomerCreateData, CustomerFilter } from '../../../services/CustomerService';

// GET /api/customers - List all customers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filter: CustomerFilter = {};

    // Parse query parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filter.searchQuery = searchQuery;
    }

    const minHealthScore = searchParams.get('minHealthScore');
    if (minHealthScore && !isNaN(Number(minHealthScore))) {
      filter.minHealthScore = Number(minHealthScore);
    }

    const maxHealthScore = searchParams.get('maxHealthScore');
    if (maxHealthScore && !isNaN(Number(maxHealthScore))) {
      filter.maxHealthScore = Number(maxHealthScore);
    }

    const subscriptionTier = searchParams.get('subscriptionTier');
    if (subscriptionTier) {
      filter.subscriptionTier = subscriptionTier;
    }

    const customers = CustomerService.getAllCustomers(filter);
    const stats = CustomerService.getCustomerStats();

    return NextResponse.json({
      success: true,
      data: customers,
      meta: {
        total: customers.length,
        filtered: customers.length,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch customers'
      },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'company', 'email', 'healthScore'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Sanitize and prepare customer data
    const customerData: CustomerCreateData = {
      name: body.name?.trim(),
      company: body.company?.trim(),
      email: body.email?.trim(),
      healthScore: Number(body.healthScore),
      subscriptionTier: body.subscriptionTier || 'basic',
      domains: Array.isArray(body.domains) ? body.domains : []
    };

    const result = CustomerService.createCustomer(customerData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Customer creation failed',
          details: result.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.customer,
      message: 'Customer created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create customer'
      },
      { status: 500 }
    );
  }
}
