"use client";

import { APIDashboard } from "./cache/Api";
import { CacheDashboard } from "./cache/Cache";

export const AdminCache = () => (
  <div className="admin-cache">
    <h1>Cache</h1>
    <APIDashboard />
    <CacheDashboard />
  </div>
);

export default AdminCache;
