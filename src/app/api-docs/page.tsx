"use client"

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => setSpec(data));
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading API Documentation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  );
}
