# Customer API Documentation

A comprehensive REST API for customer CRUD operations with enterprise-level security validation, built on Next.js 15+ App Router.

## Features

- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete customers
- ✅ **Enterprise Security**: Input validation, sanitization, rate limiting
- ✅ **Comprehensive Validation**: Zod schema validation for all endpoints
- ✅ **Proper HTTP Status Codes**: RESTful response codes
- ✅ **Security Headers**: XSS protection, content type validation
- ✅ **Rate Limiting**: Configurable request limits per IP
- ✅ **Error Handling**: Consistent error response format
- ✅ **Filtering & Pagination**: Advanced query capabilities
- ✅ **Statistics Endpoint**: Health score analytics

## Base URL

```
/api/customers
```

## Authentication

Currently using IP-based rate limiting. In production, add JWT or API key authentication.

## Endpoints

### GET /api/customers

List customers with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `subscriptionTier` (optional): Filter by tier (`basic`, `premium`, `enterprise`)
- `minHealthScore` (optional): Minimum health score (0-100)
- `maxHealthScore` (optional): Maximum health score (0-100)
- `search` (optional): Search in name, company, email, domains

**Example Request:**
```bash
curl "http://localhost:3000/api/customers?page=1&limit=5&subscriptionTier=premium&minHealthScore=70"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "John Smith",
      "company": "Acme Corp",
      "healthScore": 85,
      "email": "john.smith@acmecorp.com",
      "subscriptionTier": "premium",
      "domains": ["acmecorp.com", "portal.acmecorp.com"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

### POST /api/customers

Create a new customer.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "company": "Tech Solutions Inc",
  "healthScore": 78,
  "email": "jane@techsolutions.com",
  "subscriptionTier": "enterprise",
  "domains": ["techsolutions.com", "api.techsolutions.com"]
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "company": "Tech Solutions Inc",
    "healthScore": 78,
    "email": "jane@techsolutions.com",
    "subscriptionTier": "enterprise",
    "domains": ["techsolutions.com"]
  }'
```

**Response:** Returns created customer with status 201.

### GET /api/customers/[id]

Get a specific customer by ID.

**Example Request:**
```bash
curl http://localhost:3000/api/customers/1
```

**Response:** Returns customer object or 404 if not found.

### PUT /api/customers/[id]

Update a specific customer. Partial updates supported.

**Request Body (partial update example):**
```json
{
  "healthScore": 90,
  "subscriptionTier": "enterprise"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"healthScore": 90, "subscriptionTier": "enterprise"}'
```

**Response:** Returns updated customer object.

### DELETE /api/customers/[id]

Delete a specific customer.

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/customers/1
```

**Response:** Returns 204 No Content on success.

### GET /api/customers/stats

Get customer health score statistics and analytics.

**Example Request:**
```bash
curl http://localhost:3000/api/customers/stats
```

**Example Response:**
```json
{
  "healthScore": {
    "average": 65.5,
    "distribution": {
      "poor": 2,
      "moderate": 3,
      "good": 3
    }
  },
  "total": 8,
  "timestamp": "2024-01-30T14:22:00Z"
}
```

## Validation Rules

### Customer Fields

- **name**: Required, 1-100 characters, letters/spaces/hyphens/apostrophes only
- **company**: Required, 1-200 characters, alphanumeric with common business characters
- **healthScore**: Required, integer 0-100
- **email**: Optional, valid email format, max 254 characters
- **subscriptionTier**: Optional, enum: `basic`, `premium`, `enterprise`
- **domains**: Optional, array of valid domains, max 10 domains

### Query Parameters

- **page**: Positive integer, default 1
- **limit**: Integer 1-100, default 10
- **healthScore filters**: Integer 0-100
- **search**: Max 100 characters, alphanumeric with common characters

## Rate Limits

- **GET requests**: 100 per 15 minutes per IP
- **POST/PUT requests**: 50 per 15 minutes per IP
- **DELETE requests**: 30 per 15 minutes per IP

## Error Responses

All errors follow consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2024-01-30T14:22:00Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid request data
- `CUSTOMER_NOT_FOUND` (404): Customer ID not found
- `DUPLICATE_RESOURCE` (409): Email or company already exists
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `PAYLOAD_TOO_LARGE` (413): Request body exceeds limit
- `METHOD_NOT_ALLOWED` (405): HTTP method not supported
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

## Security Features

### Input Validation
- Zod schema validation for all inputs
- Input sanitization to prevent XSS
- Domain format validation
- Email format validation

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Request Limits
- Content-Type validation (must be `application/json`)
- Request size limit (1MB)
- Field length limits
- Array size limits

### Rate Limiting
- IP-based rate limiting
- Different limits for different operations
- Configurable time windows

## Health Score Ranges

The API uses the following health score classification:
- **Poor** (0-30): Red indicator, requires immediate attention
- **Moderate** (31-70): Yellow indicator, needs monitoring
- **Good** (71-100): Green indicator, healthy customer

## Testing Examples

### Create a Customer
```bash
# Create a new customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "company": "Test Company",
    "healthScore": 85,
    "email": "test@example.com",
    "subscriptionTier": "premium"
  }'
```

### Filter Customers
```bash
# Get customers with good health scores
curl "http://localhost:3000/api/customers?minHealthScore=71&limit=20"

# Search customers
curl "http://localhost:3000/api/customers?search=acme"

# Get enterprise customers
curl "http://localhost:3000/api/customers?subscriptionTier=enterprise"
```

### Update a Customer
```bash
# Update customer health score
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"healthScore": 95}'
```

### Get Statistics
```bash
# Get health score distribution
curl http://localhost:3000/api/customers/stats
```

## Development Notes

- Built with Next.js 15+ App Router
- Uses TypeScript with strict mode
- Zod for runtime validation
- In-memory data store (replace with database in production)
- Comprehensive error handling and logging
- Ready for production deployment with database integration