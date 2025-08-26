import { NextRequest, NextResponse } from 'next/server';
import { CustomerService, CustomerUpdateData } from '../../../../services/CustomerService';

// GET /api/customers/[id] - Get specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Customer ID is required'
        },
        { status: 400 }
      );
    }

    const customer = CustomerService.getCustomer(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Customer not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch customer'
      },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Customer ID is required'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Prepare update data
    const updateData: CustomerUpdateData = {
      id,
      ...(body.name && { name: body.name.trim() }),
      ...(body.company && { company: body.company.trim() }),
      ...(body.email && { email: body.email.trim() }),
      ...(body.healthScore !== undefined && { healthScore: Number(body.healthScore) }),
      ...(body.subscriptionTier && { subscriptionTier: body.subscriptionTier }),
      ...(Array.isArray(body.domains) && { domains: body.domains })
    };

    const result = CustomerService.updateCustomer(updateData);

    if (!result.success) {
      const status = result.errors?.includes('Customer not found') ? 404 : 400;
      return NextResponse.json(
        {
          success: false,
          error: status === 404 ? 'Not found' : 'Validation error',
          message: 'Customer update failed',
          details: result.errors
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.customer,
      message: 'Customer updated successfully'
    });

  } catch (error) {
    console.error('Error updating customer:', error);

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
        message: 'Failed to update customer'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Customer ID is required'
        },
        { status: 400 }
      );
    }

    const result = CustomerService.deleteCustomer(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Customer not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete customer'
      },
      { status: 500 }
    );
  }
}
