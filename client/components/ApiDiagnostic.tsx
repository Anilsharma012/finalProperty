import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ApiDiagnosticProps {
  propertyId?: string;
}

export default function ApiDiagnostic({ propertyId }: ApiDiagnosticProps) {
  const [results, setResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    const result = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    setResults(prev => [result, ...prev]);
    console.log(`[${test}] ${status.toUpperCase()}: ${message}`, details);
  };

  const testApiConnection = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Test 1: Basic ping
      addResult('Basic Ping', 'info', 'Testing basic API connectivity...');
      try {
        const response = await fetch('/api/ping');
        const data = await response.json();
        if (response.ok) {
          addResult('Basic Ping', 'success', `Server responding: ${data.message}`, data);
        } else {
          addResult('Basic Ping', 'error', `Server error: ${response.status}`, data);
        }
      } catch (error: any) {
        addResult('Basic Ping', 'error', `Network error: ${error.message}`);
      }

      // Test 2: Properties endpoint
      addResult('Properties Endpoint', 'info', 'Testing properties API...');
      try {
        const response = await fetch('/api/properties?limit=1');
        const data = await response.json();
        if (response.ok && data.success) {
          addResult('Properties Endpoint', 'success', `Properties API working: ${data.data?.length || 0} properties`, data);
        } else {
          addResult('Properties Endpoint', 'error', `Properties API error: ${data.error || 'Unknown'}`, data);
        }
      } catch (error: any) {
        addResult('Properties Endpoint', 'error', `Network error: ${error.message}`);
      }

      // Test 3: Global API helper
      addResult('Global API Helper', 'info', 'Testing global API helper...');
      try {
        const apiResponse = await (window as any).api('properties?limit=1');
        if (apiResponse.ok && apiResponse.json.success) {
          addResult('Global API Helper', 'success', 'Global API helper working', apiResponse.json);
        } else {
          addResult('Global API Helper', 'error', `Global API helper error: ${apiResponse.json.error || 'Unknown'}`, apiResponse.json);
        }
      } catch (error: any) {
        addResult('Global API Helper', 'error', `Global API helper error: ${error.message}`);
      }

      // Test 4: Specific property (if ID provided)
      if (propertyId) {
        addResult('Property Detail', 'info', `Testing property ${propertyId}...`);
        try {
          const apiResponse = await (window as any).api(`properties/${propertyId}`);
          if (apiResponse.ok && apiResponse.json.success) {
            addResult('Property Detail', 'success', `Property loaded: ${apiResponse.json.data.title}`, apiResponse.json.data);
          } else {
            addResult('Property Detail', 'error', `Property error: ${apiResponse.json.error || 'Unknown'}`, apiResponse.json);
          }
        } catch (error: any) {
          addResult('Property Detail', 'error', `Property fetch error: ${error.message}`);
        }
      }

      // Test 5: Network configuration
      addResult('Network Config', 'info', 'Checking network configuration...');
      const config = {
        origin: window.location.origin,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port,
        userAgent: navigator.userAgent.substring(0, 100)
      };
      addResult('Network Config', 'info', 'Network configuration detected', config);

    } catch (error: any) {
      addResult('Test Suite', 'error', `Test suite failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Diagnostic Tool</CardTitle>
        <p className="text-sm text-gray-600">
          Diagnose API connectivity and property loading issues
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button 
            onClick={testApiConnection} 
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? 'Running Tests...' : 'Run Diagnostic Tests'}
          </Button>
          <Button 
            onClick={() => setResults([])} 
            variant="outline"
          >
            Clear Results
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded border-l-4 ${
                  result.status === 'success' 
                    ? 'bg-green-50 border-green-400' 
                    : result.status === 'error'
                      ? 'bg-red-50 border-red-400'
                      : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-medium ${
                      result.status === 'success' 
                        ? 'text-green-700' 
                        : result.status === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                    }`}>
                      {result.test}: {result.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer">Show details</summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
