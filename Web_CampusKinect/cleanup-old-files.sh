#!/bin/bash

echo "🧹 Cleaning up old React Query and Socket.io files..."

# Remove old files that are causing build errors
rm -f src/components/providers/QueryProvider.tsx
rm -f src/hooks/useConversationMessages.ts
rm -f src/hooks/useRealTimeMessaging.ts
rm -f src/services/socketService.ts
rm -f build-safe.js

# Remove directories if they're empty
rmdir src/components/providers 2>/dev/null || true
rmdir src/hooks 2>/dev/null || true

echo "✅ Cleanup complete!"
echo "📋 Removed files:"
echo "  - src/components/providers/QueryProvider.tsx"
echo "  - src/hooks/useConversationMessages.ts"
echo "  - src/hooks/useRealTimeMessaging.ts"
echo "  - src/services/socketService.ts"
echo "  - build-safe.js"
echo ""
echo "🚀 Now run: docker-compose -f docker-compose.prod.yml up --build -d" 