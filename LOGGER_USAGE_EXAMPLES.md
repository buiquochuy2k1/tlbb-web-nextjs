# Logger Usage Examples

## Basic Usage

### Import the logger

```typescript
import { logger } from '@/lib/logger';
```

### Simple logging

```typescript
// Basic logs
logger.info('APP', 'Application started');
logger.error('DATABASE', 'Connection failed', { error: 'timeout' });
logger.success('PAYMENT', 'Transaction completed', { transactionId: '123' });

// With user context
logger.payment('Payment created', { amount: 100000 }, userId, clientIP);
```

## API Route Usage

### Method 1: Using createAPILogger (Recommended)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logAPIRequest, logAPIResponse } from '@/lib/logger-utils';

export async function POST(request: NextRequest) {
  const apiLogger = logAPIRequest(request, '/api/v1/payment/create');

  try {
    // Your API logic here
    const result = await createPayment();

    apiLogger.payment('Payment transaction created', {
      transactionId: result.id,
      amount: result.amount,
    });

    logAPIResponse(apiLogger, '/api/v1/payment/create', true, 200, { transactionId: result.id });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    apiLogger.error('PAYMENT', 'Failed to create payment', { error: error.message });
    logAPIResponse(apiLogger, '/api/v1/payment/create', false, 500, { error: error.message });

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

### Method 2: Manual context

```typescript
import { createAPILogger } from '@/lib/logger-utils';

export async function POST(request: NextRequest) {
  const apiLogger = createAPILogger(request);

  apiLogger.api('Payment verification started');

  try {
    // Your logic
    apiLogger.success('PAYMENT', 'Payment verified successfully');
  } catch (error) {
    apiLogger.error('PAYMENT', 'Payment verification failed', { error });
  }
}
```

## Frontend Usage (Client-side)

```typescript
import { createSimpleLogger } from '@/lib/logger-utils';

// In a React component or client-side function
const clientLogger = createSimpleLogger();

const handlePayment = async () => {
  clientLogger.info('UI', 'User initiated payment');

  try {
    const result = await fetch('/api/payment');
    clientLogger.success('UI', 'Payment completed successfully');
  } catch (error) {
    clientLogger.error('UI', 'Payment failed', { error });
  }
};
```

## Specific Category Methods

```typescript
// Authentication logs
logger.auth('User logged in successfully', { userId: 123 });
logger.auth('Failed login attempt', { username: 'testuser' });

// Payment logs
logger.payment('Payment initiated', { amount: 50000, package: 'medium' });
logger.payment('Payment verified', { transactionId: 'TXN123' });

// Security logs
logger.security('Suspicious activity detected', { ip: '1.2.3.4' });
logger.security('API rate limit exceeded', { endpoint: '/api/auth' });

// Database logs
logger.database('Query executed', { query: 'SELECT * FROM users', duration: '45ms' });
logger.database('Connection pool exhausted', { activeConnections: 10 });
```

## Log Levels

```typescript
logger.debug('DEBUG', 'Detailed debugging info'); // Development only
logger.info('INFO', 'General information'); // General info
logger.warn('WARN', 'Warning message'); // Potential issues
logger.error('ERROR', 'Error occurred'); // Errors
logger.success('SUCCESS', 'Operation successful'); // Success messages
```

## Log File Structure

Logs are automatically saved to `/logs/app-YYYY-MM-DD.log`:

```
[2024-01-15 10:30:45.123] [INFO] [AUTH] [User:123] [IP:192.168.1.100] User logged in successfully
[2024-01-15 10:31:12.456] [SUCCESS] [PAYMENT] [User:123] [IP:192.168.1.100] Payment verified | Data: {"transactionId":"TXN789","amount":100000}
[2024-01-15 10:32:01.789] [ERROR] [DATABASE] Connection timeout | Data: {"host":"localhost","timeout":5000}
```

## Configuration

The logger automatically:

- ✅ Creates daily log files (`app-YYYY-MM-DD.log`)
- ✅ Rotates files when they exceed 10MB
- ✅ Keeps 30 days of logs
- ✅ Cleans up old log files automatically
- ✅ Shows console output in development mode
- ✅ Includes timestamp, level, category, user, and IP

## Add to .gitignore

```
# Log files
logs/
*.log
```

## Best Practices

1. **Use appropriate log levels**:

   - `DEBUG`: Detailed debugging (dev only)
   - `INFO`: General information
   - `WARN`: Potential issues
   - `ERROR`: Actual errors
   - `SUCCESS`: Successful operations

2. **Use descriptive categories**:

   - `AUTH`, `PAYMENT`, `DATABASE`, `API`, `SECURITY`, `UI`

3. **Include relevant data**:

   ```typescript
   logger.payment('Payment failed', {
     userId: 123,
     amount: 50000,
     error: 'Insufficient funds',
     timestamp: Date.now(),
   });
   ```

4. **Log both success and failure cases**:
   ```typescript
   try {
     const result = await processPayment();
     logger.success('PAYMENT', 'Payment processed', { transactionId: result.id });
   } catch (error) {
     logger.error('PAYMENT', 'Payment processing failed', { error: error.message });
   }
   ```
